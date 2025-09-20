"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdminUserRoleAssignment from "@/components/forms/AdminUserRoleAssignment";

const AdminPage: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Role Assignment</CardTitle>
        <CardDescription>
          Assign roles to users to control their access permissions within the
          system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AdminUserRoleAssignment />
      </CardContent>
    </Card>
  );
};

export default AdminPage;
