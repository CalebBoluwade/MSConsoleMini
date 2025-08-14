"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="grid h-screen place-content-center bg-white px-4 space-y-5">
      <h1 className="w-full uppercase flex justify-center text-center tracking-widest text-2xl text-gray-500">
        404 | Not Found
      </h1>

      <Image src={"/notFound.gif"} alt="notFound" width={500} height={500} />

      <div className="relative flex items-center justify-center">
        <Button onClick={() => (window.location.href = "/")}>
          Return Home
        </Button>
      </div>
    </div>
  );
}
