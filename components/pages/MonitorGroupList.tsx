// GroupList.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Edit, Group } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { db } from "@/lib/helpers/service/db/db.service";
import { GroupForm } from "../forms/MonitorGroups";
import { webSocketService } from "@/lib/helpers/service/websocket.service";
import LoadingEventUI from "../LoadingUI";

export const MonitorGroupList: React.FC = () => {
  const [groups, setGroups] = useState<MonitorGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadGroups = async () => {
      await db.initialize();
      const loadedGroups = await db.getAllGroups();
      setGroups(loadedGroups);
      setIsLoading(false);
    };

    loadGroups();

    // Set up WebSocket listeners
    const unsubscribeGroupCreated = webSocketService.subscribe(
      "groupCreated",
      (newGroup: MonitorGroup) => {
        setGroups((prev) => [...prev, newGroup]);
      }
    );

    const unsubscribeGroupUpdated = webSocketService.subscribe(
      "groupUpdated",
      (updatedGroup: MonitorGroup) => {
        setGroups((prev) =>
          prev.map((group) =>
            group.id === updatedGroup.id ? updatedGroup : group
          )
        );
      }
    );

    const unsubscribeGroupDeleted = webSocketService.subscribe(
      "groupDeleted",
      (groupId: string) => {
        setGroups((prev) => prev.filter((group) => group.id !== groupId));
      }
    );

    return () => {
      unsubscribeGroupCreated();
      unsubscribeGroupUpdated();
      unsubscribeGroupDeleted();
    };
  }, []);

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await db.deleteGroup(groupId);
      setGroups(groups.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleSuccess = async () => {
    const loadedGroups = await db.getAllGroups();
    setGroups(loadedGroups);
    setIsDialogOpen(false);
    setEditingGroupId(null);
  };

  if (isLoading) {
    return <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center"><LoadingEventUI /></div>;
  }

  return (
    <AnimatePresence>
      <motion.div className="">
        {/* Header */}
        <motion.div className="bg-white dark:bg-gray-800 space-y-6 rounded-lg p-3 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Monitor Group Manager
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Organize and monitor your entities in custom groups
              </p>
            </div>
            <Button
            variant={"outline"}
              onClick={() => setIsDialogOpen(true)}
              className="--bg-blue-600 --hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Group className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        </motion.div>

        {groups.length > 0 ? (
          <AnimatePresence>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Service Monitors</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{group.deviceIds.length}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(group.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingGroupId(group.id);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <AlertDialog
                        open={isDeleteDialogOpen}
                        onOpenChange={setIsDeleteDialogOpen}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure you want to delete this
                              group?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your group and remove your data
                              from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() =>
                                setIsDeleteDialogOpen(!isDeleteDialogOpen)
                              }
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteGroup(group.id)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/console/groups/${group.id}`)
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No groups created yet</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Group
            </Button>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>
                {editingGroupId ? "Edit Group" : "Create New Group"}
              </DialogTitle>
            </DialogHeader>
            <GroupForm
              groupId={editingGroupId ?? undefined}
              onSuccess={handleSuccess}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingGroupId(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
};
