"use client";

import AlertRuleManagement from "@/components/AlertRuleManagement";
import { Suspense } from "react";

export default function AlertManagementPage() {
  return (
    <Suspense>
      <AlertRuleManagement />
    </Suspense>
  );
}