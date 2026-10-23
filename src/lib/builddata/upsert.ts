import type { SupabaseClient } from "@supabase/supabase-js";
import { hashRecord, mapPermitRecord, type MappedPermit } from "./map";
import type { BuildDataDataset, BuildDataPermitRecord } from "./types";

/**
 * Companies resolved from ingested public records need SOME organization_id,
 * but `organizations` is workspace-scoped (unique(workspace_id,
 * normalized_name)) while the ingestion job has no tenant context — it's
 * platform data. Pragmatic choice (2026-10-17): attach to the same default
 * workspace used for the Phase 0 backfill rather than changing
 * `organizations`' shape. Revisit with a real shared-company-registry table
 * if/when this needs to be genuinely tenant-agnostic.
 */
const INGESTION_DEFAULT_WORKSPACE_SLUG = "eng-associates";

async function getIngestionWorkspaceId(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id")
    .eq("slug", INGESTION_DEFAULT_WORKSPACE_SLUG)
    .single();
  if (error) throw error;
  return data.id;
}

async function resolveOrganizationId(
  supabase: SupabaseClient,
  workspaceId: string,
  name: string
): Promise<string> {
  const normalized = name.trim().toLowerCase();
  const { data: existing, error: selectError } = await supabase
    .from("organizations")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("normalized_name", normalized)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from("organizations")
    .insert({
      workspace_id: workspaceId,
      name,
      normalized_name: normalized,
      organization_type: "construction",
      source_intake_id: null,
    })
    .select("id")
    .single();
  if (insertError) throw insertError;
  return created.id;
}

export interface UpsertResult {
  action: "created" | "unchanged" | "updated";
  projectId: string;
}

/**
 * Idempotent upsert for one raw record: unchanged raw_hash bumps
 * provider_sources.last_seen_at only; changed/new raw_hash inserts a new
 * project_events row (history preserved, never mutated in place) and
 * creates construction_projects/sites/project_organizations only the first
 * time a given (dataset, source_record_id) is seen.
 */
export async function upsertPermitRecord(
  supabase: SupabaseClient,
  dataset: BuildDataDataset,
  record: BuildDataPermitRecord
): Promise<UpsertResult> {
  const rawHash = hashRecord(record);

  const { data: existingSource, error: sourceSelectError } = await supabase
    .from("provider_sources")
    .select("id, raw_hash")
    .eq("provider", "builddata")
    .eq("dataset", dataset)
    .eq("source_record_id", record.record_id)
    .maybeSingle();
  if (sourceSelectError) throw sourceSelectError;

  if (existingSource && existingSource.raw_hash === rawHash) {
    await supabase
      .from("provider_sources")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", existingSource.id);

    const { data: existingEvent, error: eventLookupError } = await supabase
      .from("project_events")
      .select("project_id")
      .eq("provider_source_id", existingSource.id)
      .limit(1)
      .maybeSingle();
    if (eventLookupError) throw eventLookupError;
    if (existingEvent) return { action: "unchanged", projectId: existingEvent.project_id };
  }

  const mapped: MappedPermit = mapPermitRecord(record);

  let providerSourceId: string;
  if (existingSource) {
    const { error } = await supabase
      .from("provider_sources")
      .update({ raw_payload: record, raw_hash: rawHash, last_seen_at: new Date().toISOString() })
      .eq("id", existingSource.id);
    if (error) throw error;
    providerSourceId = existingSource.id;
  } else {
    const { data, error } = await supabase
      .from("provider_sources")
      .insert({
        provider: "builddata",
        dataset,
        source_record_id: record.record_id,
        municipality: record.municipality,
        raw_payload: record,
        raw_hash: rawHash,
      })
      .select("id")
      .single();
    if (error) throw error;
    providerSourceId = data.id;
  }

  let projectId: string;
  let action: UpsertResult["action"];
  if (existingSource) {
    const { data: priorEvent, error } = await supabase
      .from("project_events")
      .select("project_id")
      .eq("provider_source_id", providerSourceId)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (priorEvent) {
      projectId = priorEvent.project_id;
      action = "updated";
    } else {
      projectId = await createProject(supabase, mapped);
      action = "created";
    }
  } else {
    projectId = await createProject(supabase, mapped);
    action = "created";
  }

  await supabase.from("project_events").insert({
    project_id: projectId,
    provider_source_id: providerSourceId,
    event_type: mapped.event.eventType,
    stage_label: mapped.event.stageLabel,
    occurred_at: mapped.event.occurredAt,
  });

  if (action === "created") {
    await attachSiteAndOrganizations(supabase, projectId, providerSourceId, mapped);
  }

  return { action, projectId };
}

async function createProject(supabase: SupabaseClient, mapped: MappedPermit): Promise<string> {
  const { data, error } = await supabase
    .from("construction_projects")
    .insert({
      name: mapped.project.name,
      city: mapped.project.city,
      province: mapped.project.province,
      project_type: mapped.project.projectType,
      current_stage: mapped.project.currentStage,
      estimated_value: mapped.project.estimatedValue,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function attachSiteAndOrganizations(
  supabase: SupabaseClient,
  projectId: string,
  providerSourceId: string,
  mapped: MappedPermit
): Promise<void> {
  if (mapped.site.address) {
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .insert({
        address: mapped.site.address,
        city: mapped.site.city,
        province: mapped.site.province,
        latitude: mapped.site.latitude,
        longitude: mapped.site.longitude,
      })
      .select("id")
      .single();
    if (siteError) throw siteError;

    await supabase.from("project_site_links").insert({
      project_id: projectId,
      site_id: site.id,
      relationship: "primary",
    });
  }

  if (mapped.organizations.length > 0) {
    const workspaceId = await getIngestionWorkspaceId(supabase);
    for (const org of mapped.organizations) {
      const organizationId = await resolveOrganizationId(supabase, workspaceId, org.name);
      await supabase.from("project_organizations").insert({
        project_id: projectId,
        organization_id: organizationId,
        role: org.role,
        provider_source_id: providerSourceId,
        confidence: "medium",
      });
    }
  }
}
