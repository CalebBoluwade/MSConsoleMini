"use client";
import React from "react";
import ConsoleBar from "@/components/ConsoleBar";
// import { AppSidebar } from "@/components/SideBar";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Fragment>
      {/* <AppSidebar /> */}
      <main className="px-2 mt-12 --w-full mx-auto overflow-y-scroll --h-[calc(100dvh-50px)]">
      <ConsoleBar />
        {children}
      </main>
    </React.Fragment>
  );
}
