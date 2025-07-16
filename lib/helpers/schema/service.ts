import { z } from "zod";
import { Devices } from "../constants";

// Basic cron regex (you can improve it based on your needs)
const domainRegEx = /^(?!:\/\/)(?!www\.)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,3}$/;

export const DeviceEnumValues = Object.values(Devices) as [string, ...string[]];

export const ServiceEntitySchema = z
  .object({
    ServiceName: z
      .string()
      .min(1, "Name of Service is required")
      .max(50, "Name too long"),
    Description: z.string().max(200, "Description too long").optional(),
    IPAddress: z.string(),
    Port: z.string(z.number()),
    //   color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
    checkInterval: z.string({
      required_error: "Please select a time interval.",
    }),
    Device: z.enum(DeviceEnumValues),
    DeviceEngine: z.string().optional(),
    Plugins: z.array(z.string()),
    Configuration: z.object({}).optional(),
    customCron: z
      .string()
      .optional()
      .refine((val) => !val || domainRegEx.test(val.trim()), {
        message: "Invalid cron expression",
      }),
  })
  .refine(
    (data) => {
      if (data.checkInterval === "Custom") {
        return !!data.customCron?.trim();
      }
      return true;
    },
    { message: "Custom cron is required", path: ["customCron"] }
  );

export type ServiceSchema = z.infer<typeof ServiceEntitySchema>;
