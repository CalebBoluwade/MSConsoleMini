import * as z from 'zod';

export const NotificationGroupSchema = z.object({
  name: z.string().min(1, "Task title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  assignedUsers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    jobTitle: z.string(),
    avatar: z.string(),
    initials: z.string()
  })).min(1, "Please assign at least one user").max(5, "Cannot assign more than 5 users")
});

export type NotificationGroupSchema = z.infer<typeof NotificationGroupSchema>;