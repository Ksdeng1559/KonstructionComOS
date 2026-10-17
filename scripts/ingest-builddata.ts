import "dotenv/config";
import { createServiceRoleClient } from "../src/lib/supabase/server";
import { buildDataFetch } from "../src/lib/builddata/client";
import { refreshCoverage, isMunicipalityCovered } from "../src/lib/builddata/coverage";
import { BuildDataRateLimiter } from "../src/lib/builddata/rate-limit";
import { withRetry } from "../src/lib/builddata/retry";
import { upsertPermitRecord } from "../src/lib/builddata/upsert";
import { PILOT_MUNICIPALITIES } from "../src/lib/builddata/municipalities";
import type { BuildDataListResponse, BuildDataPermitRecord } from "../src/lib/builddata/types";

/**
 * Only "permit" is wired — it's the only dataset with a confirmed real
 * sample and mapper. /planning_application, /major_project,
 * /development_permit need their own `builddata:sample` run + mapper
 * before being added here.
 */
const DATASET = "permit" as const;

async function main() {
  const supabase = createServiceRoleClient();
  const limiter = await BuildDataRateLimiter.create(supabase);

  for (const municipality of PILOT_MUNICIPALITIES) {
    const run = await startRun(supabase, municipality);

    try {
      await limiter.throttle();
      await refreshCoverage(supabase, DATASET, PILOT_MUNICIPALITIES);

      const covered = await isMunicipalityCovered(supabase, DATASET, municipality);
      if (!covered) {
        await finishRun(supabase, run.id, limiter, { status: "failed", errorCount: 1 });
        console.log(`[${municipality}] not covered for ${DATASET}, skipping`);
        continue;
      }

      let fetched = 0;
      let upserted = 0;
      let skipped = 0;
      let cursor: string | undefined;

      do {
        await limiter.throttle();
        const outcome = await withRetry(() =>
          buildDataFetch<BuildDataListResponse<BuildDataPermitRecord>>(`/${DATASET}`, {
            municipality,
            limit: 100,
            cursor,
          })
        );

        if (outcome.action !== "use") {
          console.warn(`[${municipality}] page fetch ${outcome.action}: ${outcome.reason}`);
          break;
        }

        const page = outcome.value as BuildDataListResponse<BuildDataPermitRecord>;
        fetched += page.results.length;

        for (const record of page.results) {
          try {
            await upsertPermitRecord(supabase, DATASET, record);
            upserted += 1;
          } catch (err) {
            skipped += 1;
            console.warn(`[${municipality}] skipped ${record.record_id}:`, err);
          }
        }

        cursor = page.next_cursor ?? undefined;
      } while (cursor && limiter.remaining() > 0);

      await finishRun(supabase, run.id, limiter, {
        status: "success",
        recordsFetched: fetched,
        recordsUpserted: upserted,
        recordsSkipped: skipped,
      });
      console.log(`[${municipality}] fetched=${fetched} upserted=${upserted} skipped=${skipped}`);
    } catch (err) {
      await finishRun(supabase, run.id, limiter, { status: "failed", errorCount: 1 });
      console.error(`[${municipality}] run failed:`, err);
    }
  }
}

async function startRun(supabase: ReturnType<typeof createServiceRoleClient>, municipality: string) {
  const { data, error } = await supabase
    .from("ingestion_runs")
    .insert({ provider: "builddata", dataset: DATASET, municipality, status: "running" })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

async function finishRun(
  supabase: ReturnType<typeof createServiceRoleClient>,
  runId: string,
  limiter: BuildDataRateLimiter,
  fields: {
    status: "success" | "failed";
    recordsFetched?: number;
    recordsUpserted?: number;
    recordsSkipped?: number;
    errorCount?: number;
  }
) {
  await supabase
    .from("ingestion_runs")
    .update({
      finished_at: new Date().toISOString(),
      status: fields.status,
      records_fetched: fields.recordsFetched ?? 0,
      records_upserted: fields.recordsUpserted ?? 0,
      records_skipped: fields.recordsSkipped ?? 0,
      error_count: fields.errorCount ?? 0,
      requests_used: limiter.requestsUsedThisRun(),
      quota_remaining: limiter.remaining(),
    })
    .eq("id", runId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
