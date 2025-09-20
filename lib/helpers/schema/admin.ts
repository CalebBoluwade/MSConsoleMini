import { z } from "zod";

export const UserRoleAssignmentSchema = z.object({
  userIds: z.array(z.string().uuid("Invalid user ID")).min(1, "At least one user must be selected"),
  roles: z.array(z.enum(["MS005", "MS001", "ADMIN", "ALLSTAFF"])).min(1, "At least one role must be assigned"),
});

export type UserRoleAssignmentSchema = z.infer<typeof UserRoleAssignmentSchema>;