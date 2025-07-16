import { z } from "zod";

export const GroupFormSchema = z.object({
  name: z.string().min(1, "Group name is required").max(50, "Name too long"),
  description: z.string().max(200, "Description too long").optional(),
//   color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  deviceIds: z.array(z.string())
});

export type GroupFormSchema = z.infer<typeof GroupFormSchema>;
