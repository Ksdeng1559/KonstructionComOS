import "dotenv/config";
import { writeFileSync, mkdirSync } from "node:fs";
import { buildDataFetch } from "../src/lib/builddata/client";
import type { BuildDataCoverageResponse, BuildDataListResponse } from "../src/lib/builddata/types";
import { PILOT_MUNICIPALITIES } from "../src/lib/builddata/municipalities";

/**
 * Step 0 per the BuildData integration plan: capture one real sample per
 * dataset before writing/trusting its mapper. Run manually:
 *   npm run builddata:sample -- <dataset>
 * Defaults to "permit" (the only dataset already confirmed/mapped).
 */
async function main() {
  const dataset = process.argv[2] ?? "permit";
  const municipality = PILOT_MUNICIPALITIES[0];
  const outDir = "scripts/.builddata-samples";
  mkdirSync(outDir, { recursive: true });

  const coverage = await buildDataFetch<BuildDataCoverageResponse>(`/${dataset}/coverage`);
  writeFileSync(
    `${outDir}/${dataset}-coverage-${Date.now()}.json`,
    JSON.stringify(coverage, null, 2)
  );
  console.log(`[${dataset}] coverage: ${coverage.cities} cities, ${coverage.total} total records`);

  const sample = await buildDataFetch<BuildDataListResponse<unknown>>(`/${dataset}`, {
    municipality,
    limit: 5,
  });
  writeFileSync(
    `${outDir}/${dataset}-${municipality}-${Date.now()}.json`,
    JSON.stringify(sample, null, 2)
  );
  console.log(
    `[${dataset}] ${municipality}: fetched ${sample.results.length} sample record(s), saved to ${outDir}/`
  );
  console.log("Confirm field names against src/lib/builddata/types.ts before trusting a mapper for this dataset.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
