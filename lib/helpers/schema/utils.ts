import { ZodObject, ZodSchema } from "zod";

// Helper function to check if schema is a ZodObject
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isZodObject = (schema: ZodSchema<any>): schema is ZodObject<any> => {
  return schema instanceof ZodObject;
};