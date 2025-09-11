"use server";

import { jwtVerify } from "jose";
import { Buffer } from "buffer";
import crpyto from "crypto";
import { Env } from "@/lib/config/env";

const key = new TextEncoder().encode(Env("SECRET"));
const _KEY = Buffer.from(Env("SECRET_KEY"), "base64");
const _IV = Buffer.from(Env("IVKEY"), "base64");

export async function decrypt(token: string): Promise<JWTAuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256", "HS512"],
    });

    const x = JSON.parse(Decrypt(payload.UserPayload as string)!);

    return x;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      console.error("User Session Expired");
    } else {
      console.error(error);
    }

    return null;
  }
}

const Decrypt = (text: string) => {
  if (_KEY.length !== 32)
    throw new Error("Invalid key length, must be 32 bytes.");
  if (_IV.length !== 16)
    throw new Error("Invalid IV length, must be 16 bytes.");

  try {
    const decryptCipher = crpyto.createDecipheriv("aes-256-cbc", _KEY, _IV);
    decryptCipher.setAutoPadding(true);
    let clearText = decryptCipher.update(text, "base64", "utf8");
    clearText += decryptCipher.final("utf-8");
    return clearText;
  } catch (error) {
    console.error(error);
  }
};