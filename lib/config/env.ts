import { z, string } from "zod";

const ENV = {
  // NEXTAUTH_URL: "NEXTAUTH_URL",
  NEXTAUTH_SECRET: "NEXTAUTH_SECRET",
  SECRET: "SECRET",

  SECRET_KEY: "SECRET_KEY",
  IVKEY: "IVKEY",


  NEXT_PUBLIC_WS_SYNTHETIC_URL: "NEXT_PUBLIC_WS_SYNTHETIC_URL",
  NEXT_PUBLIC_WS_NOTIFY_URL: "NEXT_PUBLIC_WS_NOTIFY_URL",
} as const;

const ENVConfig = {
  SECRET: string({ required_error: "SECRET" }),
  NEXTAUTH_URL: string().url("NEXTAUTH_URL"),
  NEXTAUTH_SECRET: string({ required_error: "NEXTAUTH_SECRET" }),

  [ENV.SECRET_KEY]: string({ required_error: "SECRET_KEY" }),
  [ENV.IVKEY]: string({ required_error: "IVKEY" }),

  [ENV.NEXT_PUBLIC_WS_SYNTHETIC_URL]: string({
    required_error: "NEXT_PUBLIC_WS_SYNTHETIC_URL",
  }),

  [ENV.NEXT_PUBLIC_WS_NOTIFY_URL]: string({
    required_error: "NEXT_PUBLIC_WS_NOTIFY_URL",
  }),
} as const;

type ENVEnvType = (typeof ENV)[keyof typeof ENV];

export function Env<
  TData extends ENVEnvType,
  TRes = z.infer<(typeof ENVConfig)[TData]>,
>(val: TData) {
  return ENVConfig[val].parse(process.env[val]) as TRes;
}
