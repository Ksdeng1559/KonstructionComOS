"use server";

import { createRlsClient } from "@/lib/supabase/server";
import {
  ConstructionProjectInsertSchema,
  type ConstructionProjectInsert,
} from "./schema";

/**
 * Creates a construction_projects row. `construction_projects` is a shared,
 * platform-wide registry (not workspace-scoped) — any authenticated tenant
 * can read it, but writes still require a signed-in session. Forward
 * compatible with the deferred command-center UI; not used by the BuildData
 * ingestion script, which writes via the service-role client instead.
 */
export async function createConstructionProject(
  input: ConstructionProjectInsert
) {
  const parsed = ConstructionProjectInsertSchema.parse(input);
  const supabase = await createRlsClient();

  const { data, error } = await supabase
    .from("construction_projects")
    .insert({
      name: parsed.name,
      city: parsed.city,
      province: parsed.province,
      project_type: parsed.projectType,
      current_stage: parsed.currentStage,
      estimated_value: parsed.estimatedValue,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
