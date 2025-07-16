import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import UserSelectDropdown from "../UserSelect";
import { NotificationGroupSchema } from "@/lib/helpers/schema/notifications";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import LoadingEventUI from "../LoadingUI";

const UserNotifications = ({ editId }: { editId?: string }) => {
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

  const form = useForm<NotificationGroupSchema>({
    resolver: zodResolver(NotificationGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      assignedUsers: [],
    },
  });

  const onSubmit = async (data: NotificationGroupSchema) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Form submitted:", data);
      alert("Task created successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (form.formState.isSubmitting) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  return (
    <div>
      <Form {...form}>
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="--space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief Service Description"
                        className="min-h-[75px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedUsers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Users</FormLabel>
                    <FormControl>
                      <UserSelectDropdown
                        value={field.value}
                        onChange={field.onChange}
                        label="Assign Users"
                        placeholder="Select team members..."
                        // error={errors.assignedUsers?.message}
                        enableSearch
                        users={defaultUsers}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => {}}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  className="border-green-600 hover:bg-green-700 --text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {editId
                    ? "Update Notification Group"
                    : "Create Notification Group"}
                </Button>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </Form>
    </div>
  );
};

export default UserNotifications;
