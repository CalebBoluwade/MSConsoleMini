import { z } from "zod";

export const RuleSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  serviceId: z.string().uuid("Invalid service ID").or(z.literal("*")),
  description: z.string(),
  alertMessage: z.string().optional(),
  metricName: z.string().min(1, "Metric name is required"),
  conditions: z.object({
    Operator: z.enum([">", "<", ">=", "<=", "==", "!=", "rate_gt", "rate_lt"]),
    Threshold: z.number().min(0).nonnegative(),
    ConsecutiveBreaches: z.number().min(3).nonnegative(),
    EvaluationWindow: z.number().min(1).nonnegative(),
    dedupPeriodMin: z.number().int().min(5).max(1440).nonnegative(),
    MaxAlertsPerHour: z.number().int().min(1).max(500).nonnegative(),
    aggregationMethod: z.enum(["avg", "max", "min", "sum"]).optional(),
  }),
  recipients: z.array(z.string()).min(1, "At least one user must be assigned"),
  groupBy: z.array(z.string()).optional(),
  //   monitorGroups: z.array(z.string()).min(1, 'At least one monitor group must be assigned'),
  //   nodes: z.array(z.string()).optional(),
  //   nodeGroups: z.array(z.string()).optional(),
  //   actions: z.object({
  //     alertActions: z.array(
  //       z.object({
  //         type: z.enum(["email", "slack", "webhook"]),
  //         parameters: z.record(z.any()),
  //       })
  //     ),
  //   }),
  alertChannels: z.array(z.enum(["email", "slack", "webhook", "teams", "sms"])),
  severity: z.enum(["info", "Critical", "Warning", "Escalation"]),
  constraints: z
    .object({
      excludeMetrics: z.array(z.string()),
      // .default([]),
      maxSimilarRules: z.number().min(0),
      // .default(5),
      preventDuplicateThresholds: z.boolean(),
      // .default(true),
    })
    .optional(),
  createdBy: z.string(),
});

export type RuleSchema = z.infer<typeof RuleSchema>;
