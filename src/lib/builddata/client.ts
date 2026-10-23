import { BuildDataApiError } from "./types";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

/**
 * Confirmed live 2026-10-17: auth is the `X-API-Key` header, not
 * `Authorization: Bearer` — BuildData's own MCP docs claim both work, but
 * Bearer returns 403 "Missing API key" on the real REST API.
 */
export async function buildDataFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  const baseUrl = process.env.BUILDDATA_BASE_URL ?? "https://api.builddata.ca";
  const apiKey = requireEnv("BUILDDATA_API_KEY");

  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: { "X-API-Key": apiKey, Accept: "application/json" },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new BuildDataApiError(
      response.status,
      body,
      `BuildData request failed: ${response.status} ${path}`
    );
  }

  return body as T;
}
