import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DeviceEnumValues,
  ServiceEntitySchema,
} from "@/lib/helpers/schema/service";
import LoadingEventUI from "../LoadingUI";
import { AlarmClockCheck, Blocks, Check, ToyBrick, Trash } from "lucide-react";
import { Badge } from "../ui/badge";
import { PluginSelector } from "./PluginManager";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  useCreateServiceMonitorMutation,
  useGetMonitorPluginsQuery,
  useGetSingleMonitorQuery,
  useUpdateServiceMonitorMutation,
} from "@/lib/helpers/api/MonitorService";
import { intervalOptions } from "@/lib/helpers/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

interface ServiceManagerFormProps {
  editServiceId?: string;
  existingPlugins?: MonitorPlugin[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ServiceManager: React.FC<ServiceManagerFormProps> = ({
  editServiceId,
  existingPlugins,
  onSuccess,
  onCancel,
}) => {
  const [showPluginSelector, setShowPluginSelector] = useState(false);
  const [plugins, setPlugins] = useState<MonitorPlugin[]>(
    existingPlugins ?? []
  );

  const { data: monitor, isLoading: isMonitorsLoading } =
    useGetSingleMonitorQuery(editServiceId! ?? "", {
      skip: !editServiceId,
    });
  const { data: pluginData, isLoading } = useGetMonitorPluginsQuery();

  const [createServiceMonitor] = useCreateServiceMonitorMutation();
  const [updateServiceMonitor] = useUpdateServiceMonitorMutation();

  const [allPlugins, setAllPlugins] = useState<MonitorPlugin[]>(
    pluginData ?? []
  );
  const form = useForm<z.infer<typeof ServiceEntitySchema>>({
    resolver: zodResolver(ServiceEntitySchema),
    defaultValues: {
      ServiceName: "",
      Description: "",
      IPAddress: "",
      Plugins: [],
      customCron: "",
    },
  });

  const selectedInterval = form.watch("checkInterval");
  const cron =
    selectedInterval === "Custom"
      ? form.watch("customCron")
      : intervalOptions.find((opt) => opt.label === selectedInterval)?.cron;

  const selectedServiceType = form.watch("Device");
  console.log(form.formState.errors);

  useEffect(() => {
    const initialize = async () => {
      //   await db.initialize();

      //   // Load mock devices if none exist
      //   const existingDevices = await db.getAllDevices();
      //   if (existingDevices.length === 0) {
      //     const mockDevices = GenerateMockDevices(50);
      //     await db.addDevices(mockDevices);
      //     setAvailableDevices(mockDevices);
      //   } else {
      //     setAvailableDevices(existingDevices);
      //   }\

      try {
        if (editServiceId) {
          const isResultsInvalid =
            !Array.isArray(plugins) || plugins.length === 0;

          // if (isResultsInvalid)
          setAllPlugins(plugins);
          console.log(isResultsInvalid, plugins);

          if (monitor) {
            form.reset({
              ServiceName: monitor.ServiceName,
              Description: monitor.Description,
              Port: monitor.Port.toString(),
              IPAddress: monitor.IPAddress,
              Device: monitor.Device,
              Plugins: monitor.PluginDetails.flatMap((p) => p.Id),
            });
          }

          // const groupDevices = await db.getDevicesByIds(group.deviceIds);
          // setDevices(groupDevices);
        }
      } catch (err) {
        console.error(err);
      }
    };

    initialize();
  }, [editServiceId, monitor, plugins, form]);

  const handleAddPlugin = (Ids: string[]) => {
    const currentPlugins = form.getValues("Plugins") || [];
    // Merge and deduplicate
    const newPluginsIds = Array.from(new Set([...currentPlugins, ...Ids]));

    form.setValue("Plugins", newPluginsIds);

    // 🔍 Fix: Ensure types match and filter works
    const addedPlugins = allPlugins.filter((plugin) => Ids.includes(plugin.Id));

    console.log("New Plugin IDs:", newPluginsIds);
    console.log("Incoming IDs:", Ids);
    console.log("All IDs:", allPlugins);
    console.log("Matched Plugins:", addedPlugins);

    // Update displayed plugins state
    setPlugins((prev) => [...prev, ...addedPlugins]);
    setShowPluginSelector(false);
  };

  const handleRemovePlugin = (Id: string) => {
    const currentPlugins = form.getValues("Plugins") || [];
    const Plugins = currentPlugins.filter((id) => id !== Id);
    form.setValue("Plugins", Plugins);
    setPlugins((prev) => prev.filter((plugin) => plugin.Id !== Id));
  };

  const onSubmit = async (data: z.infer<typeof ServiceEntitySchema>) => {
    console.log("Selected Interval:", data.checkInterval);
    console.log("Cron Expression:", cron);

    data.checkInterval = cron!;
    try {
      if (editServiceId) {
        //     const existingGroup = await db.getGroup(serviceId);
        //     if (existingGroup) {
        //       await db.updateGroup({
        //         ...existingGroup,

        //         ...values,
        //         deviceIds: values.deviceIds || [],
        //       });
        //     }
        console.log(editServiceId, data);
        await updateServiceMonitor({ id: editServiceId, data })
          .unwrap()
          .then(() => {
            toast("Configuration Updated", {
              description: `${editServiceId ? "Edited" : "Updated"} ${
                data.ServiceName
              } Service ${
                data.Plugins.length > 0 ? "and Updated its plugins" : ""
              }`,
            });

            onSuccess?.();
          });
      } else {
        createServiceMonitor(data)
          .unwrap()
          .then(() => {
            toast("Configuration saved", {
              description: `${editServiceId ? "Edited" : "Created"} ${
                data.ServiceName
              } Service ${
                data.Plugins.length > 0 ? "and Updated its plugins" : ""
              }`,
            });

            onSuccess?.();
          });
        //     await db.addGroup({
        //       name: values.name,

        //       description: values.description ?? "",
        //       deviceIds: values.deviceIds ?? [],
        //     });
      }
    } catch (error) {
      console.error("Error saving service:", error);

      toast("Error", {
        description: String(error),

        // variant: "destructive",
      });
    }
  };

  if (isLoading || isMonitorsLoading) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="ServiceName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Name</FormLabel>
                <FormControl>
                  <Input placeholder="Service Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Description"
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

          <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="IPAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Host</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Service IP Address"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Port</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Service Port"
                      type="number"
                      maxLength={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="checkInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Monitor Interval</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose interval" />
                      </SelectTrigger>
                      <SelectContent>
                        {intervalOptions.map((option) => (
                          <SelectItem key={option.label} value={option.label}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedInterval === "Custom" && (
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="customCron"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Cron Expression</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 0 9 * * *" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="Device"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Device Type</FormLabel>
                  <FormControl>
                    <div>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose device type" />
                        </SelectTrigger>
                        <SelectContent>
                          {DeviceEnumValues.map((device) => (
                            <SelectItem key={device} value={device}>
                              {device}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedServiceType === "Database" && (
                        <FormDescription>
                          [Database Plugin Required]
                        </FormDescription>
                      )}
                      {/* <Dialog
                        modal
                        open={selectedServiceType === "Database"}
                        onOpenChange={setShowDatabaseSelector}
                      >
                        <DialogContent className="sm:max-w-[625px]">
                          <DialogHeader>
                            <DialogTitle>
                              Select Database Service 
                            </DialogTitle>
                          </DialogHeader>

                          <FormField
                            control={form.control}
                            name="DeviceEngine"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    {dbImagePaths.map((item) => (
                                      <div
                                        key={item}
                                        className="flex items-center space-x-3"
                                      >
                                        <RadioGroupItem
                                          id={item}
                                          value={item}
                                          className="form-radio --checkbox-input h-5 w-5 text-indigo-600"
                                        />
                                        <span className="checkbox-tile">
                                          <Image
                                            src={`/database/${item}.svg`}
                                            className="px-5 checkbox-icon"
                                            width={95}
                                            height={95}
                                            alt={item}
                                          />
                                        </span>
                                        <FormLabel
                                          htmlFor={item}
                                          className="text-xl font-normal checkbox-label"
                                        >
                                          {item}
                                        </FormLabel>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormMessage />
                          <Button type="button" onClick={() => {}}>Submit</Button>
                        </DialogContent>
                      </Dialog> */}
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-cmb-2">
              <FormLabel className="px-2">Plugins</FormLabel>

              <AnimatePresence>
                <Sheet
                  modal
                  open={showPluginSelector}
                  onOpenChange={setShowPluginSelector}
                >
                  <SheetTrigger>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-green-600 hover:bg-green-700 --text-white p-2 rounded-lg font-medium transition-colors flex items-center gap-1"
                      size="sm"
                      onClick={() => setShowPluginSelector(true)}
                    >
                      <Blocks className="w-4 h-4 mr-2" />
                      Add Plugins
                    </Button>
                  </SheetTrigger>

                  <SheetContent className="sm:max-w-[625px]">
                    <SheetHeader>
                      <SheetTitle>
                        {editServiceId ? "Edit Plugins" : "Add Plugins"}
                      </SheetTitle>
                    </SheetHeader>

                    <div className="p-4 overflow-y-auto flex-grow">
                      <PluginSelector
                        editId={editServiceId ?? undefined}
                        selectedPluginIds={form.getValues("Plugins") || []}
                        onAddPlugins={handleAddPlugin}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {plugins.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {plugins.map((plugin) => (
                    <motion.div
                      key={plugin.Id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2 space-x-3">
                        <ToyBrick
                          className="rounded-full"
                          strokeWidth={1.25}
                          size={21}
                        />
                        <span>{plugin.Name}</span>
                        <Badge
                          variant="outline"
                          className="text-muted-foreground px-1.5 rounded-full"
                        >
                          {plugin.comingSoon ? (
                            <AlarmClockCheck color="yellow" />
                          ) : (
                            <Check className="fill-green-500 dark:fill-green-400" />
                          )}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemovePlugin(plugin.Id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-cjustify-cp-8 p-3 border-2 border-dashed rounded-lg"
                >
                  <p className="text-muted-foreground">No plugins added</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="border-green-600 hover:bg-green-700 --text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {editServiceId ? "Update Service" : "Create Service Monitor"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ServiceManager;
