/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Mail, Smartphone, Slack } from "lucide-react";
import { Button } from "../ui/button";

import UserSelectDropdown from "../UserSelect";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RuleSchema } from "@/lib/helpers/schema/rules";
import { Input } from "../ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import {
  useCreateRuleMutation,
  useGetRuleQuery,
  useUpdateRuleMutation,
} from "@/lib/helpers/api/RulesService";
import LoadingEventUI from "../LoadingUI";
import { metrics } from "@/lib/helpers/constants";

interface User {
  id: string;
  name: string;
  jobTitle: string;
  avatar: string;
  initials: string;
}

interface RuleFormProps {
  ruleId?: string;
  // onSubmit: () => void;
  nodes: BaseMonitor[];
  nodeGroups: MonitorGroup[];
}

const AlertRuleManagement: React.FC<RuleFormProps> = ({ ruleId }) => {
  const [conflicts, setConflicts] = useState<RuleConflict[]>([]);
  const [selectedRule, setSelectedRule] = useState<MonitoringRule>();

  const { data, isLoading } = useGetRuleQuery(ruleId!, {
    skip: !ruleId,
    refetchOnMountOrArgChange: true,
  });

  const [updateRule] = useUpdateRuleMutation();

  const form = useForm<RuleSchema>({
    resolver: zodResolver(RuleSchema),
    defaultValues: {
      createdBy: "",
      name: selectedRule ? selectedRule.name : "",
      severity: "info",
      conditions: {
        ConsecutiveBreaches: 3,
        EvaluationWindow: 10,
      },
      constraints: {
        excludeMetrics: [],
        maxSimilarRules: 5,
        preventDuplicateThresholds: true,
      },
    },
  });

  const watchedMetric = form.watch("metricName");
  const watchedThreshold = form.watch("conditions.Threshold");

  // Check for conflicts when metric or threshold changes
  useEffect(() => {
    if (watchedMetric && watchedThreshold) {
      checkConflicts();
    }

    if (data) {
      setSelectedRule(data.data);
    }
  }, [watchedMetric, watchedThreshold, data]);

  const [createRule] = useCreateRuleMutation();

  const checkConflicts = async () => {
    // Implementation to check conflicts in real-time
    // This would call the API to check for similar rules

    setConflicts([]);
  };

  // Helper functions for handling array field changes
  const handleAddItem = (field: any, title: string) => {
    field.onChange([...(field.value ?? []), title]);
  };

  const handleRemoveItem = (field: any, title: string) => {
    field.onChange(
      (field.value ?? []).filter((value: string) => value !== title)
    );
  };

  // If you still want a combined handler, you can create it using the above functions
  const createCheckboxHandler =
    (field: any, item: string) => (checked: boolean) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      checked ? handleAddItem(field, item) : handleRemoveItem(field, item);
    };

  const defaultUsers: User[] = [
    {
      id: "1",
      name: "Alice Johnson",
      jobTitle: "Senior Frontend Developer",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      initials: "AJ",
    },
    {
      id: "2",
      name: "Bob Smith",
      jobTitle: "Product Manager",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      initials: "BS",
    },
    {
      id: "3",
      name: "Carol Davis",
      jobTitle: "UX Designer",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      initials: "CD",
    },
    {
      id: "4",
      name: "David Wilson",
      jobTitle: "Backend Engineer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      initials: "DW",
    },
    {
      id: "5",
      name: "Emma Brown",
      jobTitle: "Data Scientist",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
      initials: "EB",
    },
  ];

  const handleRuleSubmit = async (data: RuleSchema) => {
    if (ruleId) {
      updateRule({
        id: ruleId,
        rule: data,
      }).unwrap();
    }

    data.createdBy = "user.id";
    createRule(data).unwrap();
  };

  console.log(form.getValues(), "\n\n", form.formState.errors);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleRuleSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rule Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter Rule Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Rule Description *
              </FormLabel>
              <FormControl>
                <Textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter Rule Description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="metricName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Metric Name *
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Enter Metric Name e.g. cpu.utilization" />
                    </SelectTrigger>
                    <SelectContent>
                      {metrics.map((item) => (
                        <SelectItem key={item.label} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alerting Priority</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose Alert Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Critical", "Warning", "Escalation"].map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Conditions Section */}
        <div className="border rounded-lg p-4 space-y-5">
          <h3 className="text-lg font-medium mb-4">Conditions</h3>

          <div className="grid grid-cols-2 items-center gap-4 space-y-2">
            <FormField
              control={form.control}
              name="conditions.MaxAlertsPerHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Max Alerts Per Hour *
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="Enter Max Alerts Per Hour"
                      type="number"
                      min={1}
                      step="0.01"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conditions.Operator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Operator *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} {...field}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Condition Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=">">Greater than (&gt;)</SelectItem>
                        <SelectItem value="<">Less than (&lt;)</SelectItem>
                        <SelectItem value=">=">
                          Greater than or equal (&gt;=)
                        </SelectItem>
                        <SelectItem value="<=">
                          Less than or equal (&lt;=)
                        </SelectItem>
                        <SelectItem value="==">Equal (==)</SelectItem>
                        <SelectItem value="!=">Not equal (!=)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 items-center gap-4 space-y-2">
            <FormField
              control={form.control}
              name="conditions.Threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Threshold *
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="Enter Threshold 0.00"
                      type="number"
                      step="0.01"
                      min={0}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conditions.EvaluationWindow"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Evaluation Window (Minutes) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="10"
                      type="number"
                      min={1}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 items-center gap-4 space-y-2">
            <FormField
              control={form.control}
              name="conditions.ConsecutiveBreaches"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Consecutive Breaches (Service Failure Count) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="Enter Count"
                      type="number"
                      {...field}
                      min={0}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conditions.dedupPeriodMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Alert Throttle Time (Alert Cooldown Period) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="Enter Alert Throttle (Minutes)"
                      type="number"
                      {...field}
                      min={0}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Conflicts Display */}
        {conflicts.length > 0 && (
          <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Potential Conflicts Detected
            </h4>
            {conflicts.map((conflict, index) => (
              <div key={index + 1} className="text-sm text-yellow-700">
                {conflict.description}
              </div>
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="recipients"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Recepients *
              </FormLabel>
              <FormControl>
                <UserSelectDropdown
                  value={field.value}
                  onChange={field.onChange}
                  users={defaultUsers}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Target Type" required>
              <select
                value={rule.targetType}
                onChange={(e) =>
                  handleInputChange("targetType", e.target.value as TargetType)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="node">Individual Node</option>
                <option value="nodeGroup">Node Group</option>
              </select>
            </FormField>

            <FormField
              label={
                rule.targetType === "node" ? "Select Node" : "Select Node Group"
              }
              required
            >
              <select
                value={rule.targetId}
                onChange={(e) => handleInputChange("targetId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  Select{" "}
                  {rule.targetType === "node" ? "a node" : "a node group"}
                </option>
                {rule.targetType === "node"
                  ? nodes.map((node) => (
                      <option
                        key={node.SystemMonitorId}
                        value={node.SystemMonitorId}
                      >
                        {node.ServiceName} ({node.Device})
                      </option>
                    ))
                  : nodeGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({monitorGroups.length} nodes)
                      </option>
                    ))}
              </select>
            </FormField>
          </div> */}

        <FormField
          control={form.control}
          name="alertChannels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Select the Notification Platforms for the Rule
              </FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { platform: "email", icon: Mail },
                  { platform: "sms", icon: Smartphone },
                  { platform: "slack", icon: Slack },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = field.value?.includes(item.platform as any);

                  return (
                    <FormItem
                      key={item.platform}
                      className="relative flex flex-row gap-3 items-center rounded-md border py-3 px-4"
                    >
                      <FormControl>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={createCheckboxHandler(
                            field,
                            item.platform
                          )}
                        />
                      </FormControl>
                      <FormLabel className="flex gap-2 items-center font-medium text-sm">
                        <Icon size={20} className="text-gray-500" />
                        <span className="capitalize">{item.platform}</span>
                      </FormLabel>
                    </FormItem>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conflicts Display */}
        {conflicts.length > 0 && (
          <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Potential Conflicts Detected
            </h4>
            {conflicts.map((conflict, index) => (
              <div key={index + 1} className="text-sm text-yellow-700">
                {conflict.description}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            variant={"outline"}
            type="button"
            onClick={() => {
              form.reset();
            }}
            className="px-4 py-6 border border-red-400 --hover:text-red-500 rounded-md text-gray-700"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={"outline"}
            disabled={isLoading}
            className="border-green-600 border --hover:text-green-400 px-4 py-6 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? <LoadingEventUI /> : null}
            {ruleId ? "Edit Rule" : "Create New Rule"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

// Extracted Components
// const FilterSection: React.FC<{
//   searchTerm: string;
//   setSearchTerm: (term: string) => void;
//   filterStatus: FilterStatusType;
//   setFilterStatus: (status: FilterStatusType) => void;
//   filterSeverity: FilterSeverityType;
//   setFilterSeverity: (severity: FilterSeverityType) => void;
// }> = ({
//   searchTerm,
//   setSearchTerm,
//   filterStatus,
//   setFilterStatus,
//   filterSeverity,
//   setFilterSeverity,
// }) => (
//   <div className="rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       <div className="relative">
//         <Search
//           className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//           size={20}
//         />
//         <input
//           type="text"
//           placeholder="Search rules..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>
//       <select
//         value={filterStatus}
//         onChange={(e) => setFilterStatus(e.target.value as FilterStatusType)}
//         className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//       >
//         <option value="all">All Status</option>
//         <option value="active">Active</option>
//         <option value="paused">Paused</option>
//         <option value="error">Error</option>
//       </select>
//       <select
//         value={filterSeverity}
//         onChange={(e) =>
//           setFilterSeverity(e.target.value as FilterSeverityType)
//         }
//         className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//       >
//         <option value="all">All Severities</option>
//         <option value="critical">Critical</option>
//         <option value="warning">Warning</option>
//         <option value="info">Info</option>
//       </select>
//     </div>
//   </div>
// );

// const RuleTableRow: React.FC<{
//   rule: AlertRule;
//   metrics: MetricOption[];
//   nodes: BaseMonitor[];
//   nodeGroups: MonitorGroup[];
//   severityColors: Record<SeverityType, string>;
//   statusColors: Record<StatusType, string>;
//   notificationIcons: Record<NotificationType, LucideIcon>;
//   onToggleStatus: (ruleId: string) => void;
//   onEdit: (rule: AlertRule) => void;
//   onDelete: (ruleId: string) => void;
// }> = React.memo(
//   ({
//     rule,
//     metrics,
//     nodes,
//     nodeGroups,
//     severityColors,
//     statusColors,
//     notificationIcons,
//     onToggleStatus,
//     onEdit,
//     onDelete,
//   }) => {
//     const getTargetName = () => {
//       if (rule.targetType === "node") {
//         return (
//           nodes.find((n) => n.SystemMonitorId === rule.targetId)?.ServiceName ||
//           "Unknown Node"
//         );
//       }
//       return (
//         nodeGroups.find((g) => g.id === rule.targetId)?.name || "Unknown Group"
//       );
//     };

//     return (
//       <tr className="hover:bg-gray-50">
//         <td className="px-6 py-4 whitespace-nowrap">
//           <div className="text-sm font-medium text-gray-900">{rule.name}</div>
//           <div className="text-sm text-gray-500">{rule.description}</div>
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap">
//           <div className="text-sm text-gray-900">{getTargetName()}</div>
//           <div className="text-sm text-gray-500">
//             {rule.targetType === "node" ? "Node" : "Node Group"}
//           </div>
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap">
//           <div className="text-sm text-gray-900">
//             {metrics.find((m) => m.value === rule.metric)?.label}{" "}
//             {rule.condition} {rule.threshold}
//           </div>
//           <div className="text-sm text-gray-500">for {rule.duration}</div>
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap">
//           <span
//             className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//               severityColors[rule.severity]
//             }`}
//           >
//             {rule.severity}
//           </span>
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap">
//           <Button
//             onClick={() => onToggleStatus(rule.id)}
//             className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//               statusColors[rule.status]
//             } cursor-pointer hover:opacity-80`}
//           >
//             {rule.status}
//           </Button>
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap">
//           <div className="flex space-x-1">
//             {rule.notifications.map((notification) => {
//               const Icon = notificationIcons[notification];
//               return (
//                 <Icon key={notification} size={16} className="text-gray-500" />
//               );
//             })}
//           </div>
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//           {rule.lastTriggered || "Never"}
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//           <div className="flex items-center justify-end space-x-2">
//             <Button
//               onClick={() => onEdit(rule)}
//               className="text-blue-600 hover:text-blue-900"
//             >
//               <Edit size={16} />
//             </Button>
//             <Button
//               onClick={() => onDelete(rule.id)}
//               className="text-red-600 hover:text-red-900"
//             >
//               <Trash2 size={16} />
//             </Button>
//           </div>
//         </td>
//       </tr>
//     );
//   }
// );

export default AlertRuleManagement;
