"use client";

import { MonitorGroupList } from "@/components/pages/MonitorGroupList";
import { Suspense } from "react";

export default function GroupsPage() {
  return (
    <Suspense>
      <MonitorGroupList />
    </Suspense>
  );
}