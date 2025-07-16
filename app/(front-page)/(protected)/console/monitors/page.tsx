"use client";

import React, { Suspense } from "react";
import ServicesManagement from "@/components/pages/Services";

export default function Monitors() {
  return (
    <Suspense>
      <ServicesManagement />
    </Suspense>
  );
}
