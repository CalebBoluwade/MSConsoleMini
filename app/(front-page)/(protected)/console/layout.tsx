"use client";
import React from "react";
import ConsoleBar from "@/components/ConsoleBar";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="px-2 mt-18 w-full mx-auto --overflow-y-scroll --h-[calc(100dvh-50px)]">
      <ConsoleBar />
      {children}
    </main>
  );
}
