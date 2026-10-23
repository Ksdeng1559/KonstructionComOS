import { auth } from "@clerk/nextjs/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

/**
 * RLS-bound client for Server Actions/components. Forwards the signed-in
 * Clerk session token so `current_workspace_id()` resolves via the caller's
 * own `org_id` claim — never trust a workspace id from client input.
 */
export async function createRlsClient(): Promise<SupabaseClient> {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) throw new Error("No authenticated session");

  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

/**
 * Service-role client that bypasses RLS. Only two legitimate uses exist in
 * this codebase: the Clerk organization webhook, and the BuildData ingestion
 * script (which has no Clerk session to derive a workspace from). Never use
 * this for a request made on behalf of a signed-in user.
 */
export function createServiceRoleClient(): SupabaseClient {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SECRET_KEY")
  );
}
