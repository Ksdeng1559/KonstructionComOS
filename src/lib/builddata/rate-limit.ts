import type { SupabaseClient } from "@supabase/supabase-js";

const DAILY_LIMIT = 100;
const DELAY_BETWEEN_CALLS_MS = 400;

/**
 * Minimal rate limiter appropriate to a 100-req/day free tier run by a
 * single manual operator — no queue/cron library needed. Does not persist
 * across process runs by itself; `requestsUsedToday` reads the persisted
 * sum from `ingestion_runs` so a run started later the same day still
 * respects the daily cap.
 */
export class BuildDataRateLimiter {
  private used = 0;

  constructor(private readonly alreadyUsedToday: number) {}

  static async create(supabase: SupabaseClient): Promise<BuildDataRateLimiter> {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("ingestion_runs")
      .select("requests_used")
      .eq("provider", "builddata")
      .gte("started_at", startOfDay.toISOString());

    if (error) throw error;
    const alreadyUsedToday = (data ?? []).reduce(
      (sum, row) => sum + (row.requests_used ?? 0),
      0
    );
    return new BuildDataRateLimiter(alreadyUsedToday);
  }

  remaining(): number {
    return Math.max(0, DAILY_LIMIT - this.alreadyUsedToday - this.used);
  }

  async throttle(): Promise<void> {
    if (this.remaining() <= 0) {
      throw new Error(
        `BuildData daily quota exhausted (${DAILY_LIMIT}/day, ${this.alreadyUsedToday} already used today)`
      );
    }
    this.used += 1;
    await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_CALLS_MS));
  }

  requestsUsedThisRun(): number {
    return this.used;
  }
}
