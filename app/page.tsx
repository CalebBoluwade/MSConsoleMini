"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import ConsoleBar from "@/components/ConsoleBar";

const AllDevices = dynamic(() => import("@/components/pages/AllDevices"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <Suspense>
    <React.Fragment>
      <ConsoleBar />

      <AllDevices />
    </React.Fragment>
    </Suspense>
  );
}
