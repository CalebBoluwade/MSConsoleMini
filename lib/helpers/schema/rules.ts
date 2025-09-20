import { z } from "zod";

const domainRegEx = /^\d+[mh]$/;

export const RuleSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    serviceId: z.string().uuid("Invalid service ID").or(z.literal("*")),
    description: z.string(),
    alertMessage: z.string().optional(),
    metricName: z.string().min(1, "Metric name is required"),
    conditions: z.object({
      Operator: z.enum([
        ">",
        "<",
        ">=",
        "<=",
        "==",
        "!=",
        "rate_gt",
        "rate_lt",
      ]),
      Threshold: z.number().min(0).nonnegative(),
      ConsecutiveBreaches: z.number().min(3).nonnegative(),
      EvaluationWindow: z
        .string()
        .regex(
          domainRegEx,
          "Must be a valid duration (e.g., '5m', '10m', '1h')"
        ),
      AlertThrottleTime: z
        .string()
        .regex(
          domainRegEx,
          "Must be a valid duration (e.g., '5m', '10m', '1h')"
        ),
      MaxAlertsPerHour: z.number().int().min(1).max(24).nonnegative(),
      AggregationMethod: z.enum(["avg", "max", "min", "sum"]).optional(),
    }),
    customAlertThrottle: z
      .string()
      .optional()
      .refine((val) => !val || domainRegEx.test(val.trim()), {
        message: "Invalid cron expression",
      }),
    customWindow: z
      .string()
      .optional()
      .refine((val) => !val || domainRegEx.test(val.trim()), {
        message: "Invalid cron expression",
      }),
    recipients: z.array(z.string()),
    // .min(1, "At least one user must be assigned"),
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
    alertChannels: z.array(
      z.enum(["email", "slack", "webhook", "teams", "sms"])
    ),
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
  })
  .refine(
    (data) => {
      if (data.conditions.EvaluationWindow === "Custom") {
        return !!data.customWindow?.trim();
      }

      return true;
    },
    { message: "Custom Window is required", path: ["customWindow"] }
  )
  .refine(
    (data) => {
      if (data.conditions.AlertThrottleTime === "Custom") {
        return !!data.customAlertThrottle?.trim();
      }

      return true;
    },
    {
      message: "Custom Throttle Time is required",
      path: ["customAlertThrottle"],
    }
  );

export type RuleSchema = z.infer<typeof RuleSchema>;
