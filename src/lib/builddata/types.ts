/**
 * Confirmed live 2026-10-17 against GET /permit (sample saved to
 * scripts/.builddata-samples/permit-vancouver-20261017.json) and
 * GET /permit/coverage (scripts/.builddata-samples/permit-coverage-20261017.json).
 * Other P0 datasets (/planning_application, /major_project,
 * /development_permit) are UNVERIFIED — confirm their shape with
 * `npm run builddata:sample` before trusting the equivalent types below.
 */

export type BuildDataDataset =
  | "permit"
  | "planning_application"
  | "major_project"
  | "development_permit";

/** Confirmed shape for dataset: "permit". */
export interface BuildDataPermitRecord {
  record_id: string;
  municipality: string;
  lat?: number;
  lng?: number;
  work?: string;
  status?: string;
  status_canonical?: string;
  address?: string;
  normalized_address?: string;
  postal_code?: string;
  province?: string;
  neighborhood?: string;
  company?: string;
  builder_name?: string;
  contractor_name?: string;
  contractor_name_normalized?: string;
  contractor_address?: string;
  normalized_business_name?: string;
  current_use?: string;
  description?: string;
  permit_type?: string;
  permit_type_canonical?: string;
  permit_number?: string;
  storeys?: string;
  storeys_source?: string;
  construction_value?: number;
  application_date?: string;
  issued_date?: string;
  opening_soon?: boolean;
  fetched_at: string;
}

/** UNVERIFIED — placeholder until a real sample is captured. */
export type BuildDataPlanningApplicationRecord = Record<string, unknown>;
/** UNVERIFIED — placeholder until a real sample is captured. */
export type BuildDataMajorProjectRecord = Record<string, unknown>;
/** UNVERIFIED — placeholder until a real sample is captured. */
export type BuildDataDevelopmentPermitRecord = Record<string, unknown>;

export interface BuildDataListResponse<T> {
  entity_type: string;
  count: number;
  offset: number;
  next_cursor: string | null;
  results: T[];
}

export interface BuildDataCoverageResponse {
  entity_type: string;
  cities: number;
  total: number;
  by_municipality: Record<string, number>;
}

export class BuildDataApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message: string
  ) {
    super(message);
    this.name = "BuildDataApiError";
  }
}
