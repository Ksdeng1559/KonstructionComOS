import { createHash } from "node:crypto";
import type { BuildDataPermitRecord } from "./types";

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const entries = keys.map(
    (k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`
  );
  return `{${entries.join(",")}}`;
}

export function hashRecord(record: unknown): string {
  return createHash("sha256").update(stableStringify(record)).digest("hex");
}

export interface MappedOrganization {
  name: string;
  role: "owner" | "builder" | "contractor";
}

export interface MappedPermit {
  project: {
    name: string;
    city: string;
    province: string;
    projectType: string | null;
    currentStage: string | null;
    estimatedValue: number | null;
  };
  event: {
    eventType: string;
    stageLabel: string | null;
    occurredAt: string | null;
  };
  site: {
    address: string | null;
    city: string;
    province: string;
    latitude: number | null;
    longitude: number | null;
  };
  organizations: MappedOrganization[];
}

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Pure mapping, no I/O. Dedupes org candidates by normalized name — permit
 * records frequently repeat the same company across company/builder_name/
 * contractor_name fields (confirmed in the 2026-10-17 sample), and a
 * corroborating role for the same org+source would otherwise collide with
 * project_organizations' unique(project_id, organization_id, role,
 * provider_source_id) constraint for no benefit.
 */
export function mapPermitRecord(record: BuildDataPermitRecord): MappedPermit {
  const city = record.municipality;
  const province = record.province ?? "BC";

  const orgCandidates: MappedOrganization[] = [
    record.contractor_name_normalized
      ? { name: record.contractor_name!, role: "contractor" as const }
      : record.contractor_name
        ? { name: record.contractor_name, role: "contractor" as const }
        : undefined,
    record.builder_name ? { name: record.builder_name, role: "builder" as const } : undefined,
    record.company ? { name: record.company, role: "owner" as const } : undefined,
  ].filter((v): v is MappedOrganization => v !== undefined);

  const seen = new Set<string>();
  const organizations = orgCandidates.filter((org) => {
    const key = normalize(org.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    project: {
      name: record.normalized_address || record.address || `Permit ${record.record_id}`,
      city,
      province,
      projectType: record.permit_type_canonical ?? record.permit_type ?? record.work ?? null,
      currentStage: record.status_canonical ?? record.status ?? null,
      estimatedValue: record.construction_value ?? null,
    },
    event: {
      eventType: "permit_status",
      stageLabel: record.status ?? null,
      occurredAt: record.issued_date ?? record.application_date ?? null,
    },
    site: {
      address: record.address ?? null,
      city,
      province,
      latitude: record.lat ?? null,
      longitude: record.lng ?? null,
    },
    organizations,
  };
}
