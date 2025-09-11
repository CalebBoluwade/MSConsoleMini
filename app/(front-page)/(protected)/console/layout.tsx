"use client";
import React from "react";
import ConsoleBar from "@/components/ConsoleBar";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="shadow-lg rounded-md px-8 py-2 mt-18 w-full mx-auto --overflow-y-scroll min-h-[calc(100dvh-80px)]">
      <ConsoleBar />
      {children}
    </main>
  );
}
