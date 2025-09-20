import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRoleAssignmentSchema } from "@/lib/helpers/schema/admin";
import { Button } from "../ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "../ui/checkbox";
import UserSelectDropdown from "../UserSelect";
import { useAllUsersQuery } from "@/lib/helpers/api/UserService";
import { toast } from "sonner";
import LoadingEventUI from "../LoadingUI";

interface AdminUserRoleAssignmentProps {
  onSuccess?: () => void;
}

const roles = [
  { id: "MS005", label: "MS005 - Basic User" },
  { id: "MS001", label: "MS001 - Advanced User" },
  { id: "ADMIN", label: "ADMIN - Administrator" },
  { id: "ALLSTAFF", label: "ALLSTAFF - All Staff Access" },
] as const;

const AdminUserRoleAssignment: React.FC<AdminUserRoleAssignmentProps> = ({
  onSuccess,
}) => {
  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError,
    refetch,
  } = useAllUsersQuery({
    page: 0,
    pageSize: 50,
  });

  const form = useForm<UserRoleAssignmentSchema>({
    resolver: zodResolver(UserRoleAssignmentSchema),
    defaultValues: {
      userIds: [],
      roles: [],
    },
  });

  const handleSubmit = async (data: UserRoleAssignmentSchema) => {
    try {
      // API call would go here
      console.log("Assigning roles:", data);
      toast.success("User roles assigned successfully!");
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error assigning roles:", error);
      toast.error("Failed to assign roles. Please try again.");
    }
  };

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    const currentRoles = form.getValues("roles");
    const newRoles = checked
      ? [...currentRoles, roleId as Roles]
      : currentRoles.filter((role) => role !== roleId);
    form.setValue("roles", newRoles);
  };

  if (isUsersLoading) {
    return (
      <div className="h-[calc(100dvh-120px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  if (isUsersError) {
    return (
      <div className="--h-[calc(100dvh-150px)] w-full flex justify-center items-center gap-3">
        Error loading data
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="userIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select User</FormLabel>
              <FormControl>
                <UserSelectDropdown
                  value={field.value}
                  onChange={field.onChange}
                  users={users}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Roles</FormLabel>
              <div className="space-y-3">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={role.id}
                      checked={field.value.includes(role.id)}
                      onCheckedChange={(checked) =>
                        handleRoleToggle(role.id, !!checked)
                      }
                    />
                    <label
                      htmlFor={role.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {role.label}
                    </label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isUsersLoading}>
          Assign Roles
        </Button>
      </form>
    </FormProvider>
  );
};

export default AdminUserRoleAssignment;
