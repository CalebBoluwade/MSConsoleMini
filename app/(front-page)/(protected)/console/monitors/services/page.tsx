"use client";

import React, { Suspense } from "react";
import ServiceTracker from "@/components/pages/ServiceTracker";

export default function ServiceMonitors() {
  return (
    <Suspense>
      <ServiceTracker />
    </Suspense>
  );
}