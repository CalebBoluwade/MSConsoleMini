"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import AlertRuleManagement from "../forms/AlertRuleManagement";
import LoadingEventUI from "../LoadingUI";
import { Button } from "../ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Mail, MoreHorizontal, Plus, Slack, Webhook } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "../DataTable";
import {
  useDeleteRuleMutation,
  useGetAllRulesQuery,
} from "@/lib/helpers/api/RulesService";

import { db } from "@/lib/helpers/service/db/db.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Header from "../Header";
import { Card, CardContent, CardHeader } from "../ui/card";
import ActionConfirmation from "../ActionConfirmation";
import { toast } from "sonner";
import { generateInitials } from "@/lib/helpers/utils";
import { PageNameEnum } from "@/lib/config/site-map";
import AuthRequired from "@/lib/hooks/useAuthRequired";

const Rules = () => {
  const [showRuleModal, setShowRuleModal] = useState<boolean>(false);
  const [selectedRule, setSelectedRule] = useState<MonitoringRule | null>(null);

  const [rules, setRules] = useState<MonitoringRule[]>([]);
  const [monitorGroups, setMonitorGroups] = useState<MonitorGroup[]>([]);

  const { data: rulesData, isLoading, isError } = useGetAllRulesQuery({});
  const [deleteRule, { isLoading: isDeleteLoading }] = useDeleteRuleMutation(
    {}
  );

  useEffect(() => {
    if (rulesData) {
      setRules(rulesData.data.data ?? []);
      toast.success("Rules Loaded");
    }

    const loadGroups = async () => {
      await db.initialize();
      const loadedGroups = await db.getAllGroups();
      setMonitorGroups(loadedGroups);
    };

    loadGroups();
  }, [rulesData]);

  function handleEditRule(id: string): void {
    throw new Error("Function not implemented." + id);
  }

  const handleDeleteRule = useCallback(
    async (ruleIdToDelete: string): Promise<void> => {
      if (!ruleIdToDelete) return;
      setRules((prev) => prev.filter((rule) => rule.id !== ruleIdToDelete));

      await deleteRule(ruleIdToDelete).unwrap();
      //   setShowDeleteConfirm(false);
      //   setRuleToDelete(null);
      // }
    },
    [deleteRule]
  );

  const toggleRuleStatus = useCallback((ruleId: string): void => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.name === ruleId
          ? { ...rule, status: rule.isActive ? "paused" : "active" }
          : rule
      )
    );
  }, []);

  const renderPlatform = (platform: string) => {
    switch (platform) {
      case "email":
        return <Mail className="h-5 w-5 text-blue-500" />;
      case "slack":
        return <Slack className="h-5 w-5 text-purple-500" />;
      case "webhook":
        return <Webhook className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />; // fallback
    }
  };

  const Users = ({ user, initials }: { user: string; initials: string }) => {
    return (
      <Avatar key={user.substring(5, 7)} className="h-8 w-8 rounded-full">
        <AvatarImage src={user} alt="Avatar" />
        <AvatarFallback>
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
            {initials}
          </div>
        </AvatarFallback>
      </Avatar>
    );
  };

  const columns: ColumnDef<MonitoringRule>[] = [
    { accessorKey: "name", header: "Rule Name" },
    {
      accessorKey: "serviceName",
      header: "Service Name",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.serviceId === "00000000-0000-0000-0000-000000000000"
            ? "*"
            : row.original.serviceId || "N / A"}
        </div>
      ),
    },
    { accessorKey: "description", header: "Rule Description" },
    { accessorKey: "metricName", header: "Rule Metric" },
    {
      accessorKey: "conditions",
      header: "Rule Operator",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.conditions.Operator || "N / A"}
        </div>
      ),
    },
    {
      accessorKey: "conditions.breaches",
      header: "Consecutive Breaches",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.conditions.ConsecutiveBreaches || "N / A"}
        </div>
      ),
    },
    {
      accessorKey: "conditions.threshold",
      header: "Rule Threshold",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.conditions?.Threshold || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "lastTriggered",
      header: "Last Triggered",
      cell: ({ row }) => (
        <div className="flex -space-x-1">
          {row.original.lastTriggered || "Never"}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Channels",
      cell: ({ row }) => {
        const channels: string[] = row.original.alertChannels;

        if (!channels || channels.length === 0) {
          return <span className="text-gray-400">No Channels</span>;
        }

        return (
          <div className="flex -space-x-1">
            {channels.map((ch, i) => (
              <div
                key={i}
                className="p-1 rounded-full bg-white shadow-sm ring-1 ring-gray-200"
              >
                {renderPlatform(ch)}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "recipients",
      header: "Assigned Receipients",
      cell: ({ row }) => {
        const users = row.original.recipients ?? [];
        console.log(users);

        if (!users || users.length === 0) {
          return <span className="text-gray-400 text-center">No Users</span>;
        }

        return (
          <div className="flex space-x-1">
            {users.map((user, i) => (
              <Users
                key={i + 1}
                user={user.avatar}
                initials={generateInitials(user.fullName)}
              />
            ))}
          </div>
        );
      },
    },
    { accessorKey: "createdAt", header: "Created At" },
    {
      header: "Actions",
      cell: ({ row }) => {
        const rule = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="space-y-2 p-3">
              <DropdownMenuLabel>Rule Actions</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedRule(rule);

                  setShowRuleModal(true);
                  // if (!isMonitorsLoading && !isMonitorsError) {
                  // } else {
                  //   toast.error("Monitors Unavailable");
                  // }
                }}
              >
                Edit Rule
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleRuleStatus(rule.id)}>
                {rule.isActive ? "Deactivate" : "Activate"} Rule
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditRule(rule.id)}>
                Edit
              </DropdownMenuItem>
              <ActionConfirmation
                dialogTitle=""
                triggerButtonLabel=""
                onOpenChange={() => {}}
                dialogDescription="Are you sure you want to delete this alert rule? This action cannot be undone."
                onConfirm={() => {}}
                open={false}
                customTrigger={
                  <DropdownMenuItem onClick={() => handleDeleteRule(rule.id)}>
                    {isDeleteLoading ? <LoadingEventUI /> : "Delete Rule"}
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        Error loading data
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div className="space-y-6 space-x-1">
        <Card className="border-0 py-0 px-1">
          <CardHeader>
            {/* Header */}
            <Header
              title="Alert Rules"
              subTitle="Monitor"
              subTitle2="Manage Your Alert Configurations"
              image="Programmer"
              ctaButton={
                <Button
                  variant="outline"
                  onClick={() => setShowRuleModal(true)}
                  className="border-green-600 hover:bg-green-400 dark:text-white px-4 py-6 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Rule
                </Button>
              }
            />
          </CardHeader>

          {/* Content */}
          <CardContent>
            {/* Rules Table */}
            <DataTable data={rules} columns={columns} tableTitle="Rules" />
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        {/* <Modal
          show={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Alert Rule"
        >
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Are you sure you want to delete this alert rule? This action
                cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteRule}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Rule
              </Button>
            </div>
          </div>
        </Modal> */}

        <Dialog open={showRuleModal} onOpenChange={setShowRuleModal}>
          <DialogHeader>
            <DialogTitle>Create New Alert Rule</DialogTitle>
          </DialogHeader>
          <DialogContent className="md:min-w-200 max-h-[85vh] overflow-y-auto">
            <AlertRuleManagement
              ruleId={selectedRule?.name}
              nodeGroups={monitorGroups}
              onSuccess={() => {
                setShowRuleModal(false);
                setSelectedRule(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthRequired(PageNameEnum.RULES)(Rules);
