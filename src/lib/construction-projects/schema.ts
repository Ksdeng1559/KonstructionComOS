import { z } from "zod";

export const ConstructionProjectInsertSchema = z.object({
  name: z.string().min(1),
  city: z.string().optional(),
  province: z.string().default("BC"),
  projectType: z.string().optional(),
  currentStage: z.string().optional(),
  estimatedValue: z.number().nonnegative().optional(),
});

export type ConstructionProjectInsert = z.infer<
  typeof ConstructionProjectInsertSchema
>;
