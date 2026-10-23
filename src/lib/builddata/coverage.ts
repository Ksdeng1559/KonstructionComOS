import type { SupabaseClient } from "@supabase/supabase-js";
import { buildDataFetch } from "./client";
import type { BuildDataCoverageResponse, BuildDataDataset } from "./types";

/**
 * Calls the dataset's /coverage endpoint and upserts source_coverage.
 * A municipality is only ingestion-eligible if present and covered in a
 * fresh check — per BuildData's own warning not to assume uniform
 * municipality coverage across datasets.
 */
export async function refreshCoverage(
  supabase: SupabaseClient,
  dataset: BuildDataDataset,
  municipalities: readonly string[]
): Promise<void> {
  const response = await buildDataFetch<BuildDataCoverageResponse>(
    `/${dataset}/coverage`
  );

  const rows = municipalities.map((municipality) => ({
    provider: "builddata",
    dataset,
    municipality,
    is_covered: municipality in response.by_municipality,
    record_count: response.by_municipality[municipality] ?? 0,
    last_checked_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("source_coverage")
    .upsert(rows, { onConflict: "provider,dataset,municipality" });

  if (error) throw error;
}

export async function isMunicipalityCovered(
  supabase: SupabaseClient,
  dataset: BuildDataDataset,
  municipality: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("source_coverage")
    .select("is_covered")
    .eq("provider", "builddata")
    .eq("dataset", dataset)
    .eq("municipality", municipality)
    .maybeSingle();

  if (error) throw error;
  return data?.is_covered ?? false;
}
