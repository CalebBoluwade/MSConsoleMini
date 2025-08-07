/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { z } from "zod";
import React, { useEffect, useState } from "react";
import { CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FormDescription, FormLabel } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import useDebouncedSearch from "@/lib/hooks/useDebouncedSearch";
import { Input } from "../ui/input";
import {
  PLUGIN_CONFIGS,
  PluginGenericProps,
  PluginInputProps,
} from "@/lib/helpers/schema/plugins";
import { Textarea } from "../ui/textarea";
import { AlertCircle, RotateCcw, Save, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { isZodObject } from "@/lib/helpers/schema/utils";
import {
  useGetAllMonitorsQuery,
  useGetMonitorPluginsQuery,
} from "@/lib/helpers/api/MonitorService";
import LoadingEventUI from "../LoadingUI";
import { SheetFooter } from "../ui/sheet";

export interface PluginEditorProps {
  selectedMonitor: BaseMonitor;
}

type ValidationErrors = {
  [pluginId: string]: {
    [propertyKey: string]: string[] | undefined;
  };
};

export const PluginEditor: React.FC<PluginEditorProps> = ({
  // editPluginId,
  selectedMonitor,
}) => {
  const [properties, setProperties] = useState<PluginGenericProps>({});
  const [hasChanges, setHasChanges] = useState<PluginGenericProps | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isValidating, setIsValidating] = useState(false);
  const [selectedPluginId, setSelectedPluginId] = useState<string>();

  const selectedPlugin =
    selectedMonitor?.PluginDetails?.find(
      (plugin) => plugin.Id === selectedPluginId
    ) ?? selectedMonitor?.PluginDetails[0];

  const selectedPluginIndex = selectedMonitor?.PluginDetails?.findIndex(
    (plugin) => plugin.Id === selectedPlugin?.Id
  );

  const pluginConfig = selectedPlugin
    ? PLUGIN_CONFIGS[selectedPlugin.Id]
    : null;

  useEffect(() => {
    if (
      (selectedMonitor?.PluginDetails ?? [])?.length > 0 &&
      !selectedPluginId
    ) {
      // Auto-select the first plugin if none is selected
      setSelectedPluginId((selectedMonitor.PluginDetails ?? [])[0].Id);
    }
  }, [selectedMonitor, selectedPluginId]);

  useEffect(() => {
    if (selectedMonitor && pluginConfig) {
      const configObj = (() => {
        try {
          return selectedMonitor?.Configuration
            ? JSON.parse(selectedMonitor.Configuration)
            : {};
        } catch (err) {
          console.error("Invalid JSON in selectedMonitor.Configuration", err);
          return {};
        }
      })();

      // Initialize properties with defaults or existing values
      const initialProps: PluginGenericProps = {};

      Object.entries(configObj).forEach(([key]) => {
        initialProps[key] = selectedMonitor.PluginDetails[parseInt(key)];
      });

      Object.entries(pluginConfig.properties).forEach(([key, config]) => {
        initialProps[key] =
          selectedMonitor.PluginDetails[parseInt(key)] ?? config.default;
      });

      console.log(initialProps);
      setProperties(initialProps);
      setHasChanges(null);
      setValidationErrors({});
    }
  }, [selectedMonitor, pluginConfig]);

  const validateProperties = async (props: PluginGenericProps) => {
    if (!pluginConfig?.schema) return {};

    try {
      setIsValidating(true);

      // Validate the entire object
      const validationResult = await pluginConfig.schema.parseAsync(props);
      console.log("validationResult", validationResult);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error);
        const fieldErrors: Record<string, Array<string>> = {};
        error.errors.forEach((err) => {
          const fieldName = err.path[0];
          if (!fieldErrors[fieldName]) {
            fieldErrors[fieldName] = [];
          }
          fieldErrors[fieldName].push(err.message);
        });
        return fieldErrors;
      }
      return {};
    } finally {
      setIsValidating(false);
    }
  };

  const validateSingleProperty = async (key: string, value: unknown) => {
    if (!pluginConfig?.schema) return [];

    try {
      // Create a temporary object with current properties and the new value
      // const tempProps = { ...properties, [key]: value };

      // Validate just this field using the schema
      const fieldSchema = (pluginConfig.schema as any).shape[key];
      if (fieldSchema) {
        await fieldSchema.parseAsync(value);
      }

      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.map((err) => err.message);
      }
      return [];
    }
  };

  const handlePropertyChange = async (key: string, value: unknown) => {
    if (!selectedPlugin) return;

    const newProperties = { ...properties, [key]: value } as PluginGenericProps;
    setProperties(newProperties);
    setHasChanges((prev) => ({ ...prev, [selectedPlugin.Id]: true }));

    // Validate the single property
    const errors = await validateSingleProperty(key, value);
    console.log("validateSingleProperty", errors);
    setValidationErrors((prev) => ({
      ...prev,
      [selectedPlugin.Id]: {
        ...(prev[selectedPlugin.Id] ?? {}), // fallback to empty object
        [key]: errors.length > 0 ? errors : undefined,
      },
    }));
  };

  const handleSave = async () => {
    if (!pluginConfig?.schema || !selectedPlugin) return;

    console.log("handleSaveProperties", properties);
    const errors = await validateProperties(properties);
    setValidationErrors((prev) => ({
      ...prev,
      [selectedPlugin.Id]: errors,
    }));

    const hasErrors = Object.keys(errors).length > 0;

    if (!hasErrors) {
      try {
        // Validate the complete object one more time before saving
        const validatedData = await pluginConfig.schema.parseAsync(properties);

        // Save logic here
        console.log(
          `Saving plugin properties for ${selectedPlugin.Id}:`,
          validatedData
        );
        setHasChanges((prev) => ({ ...prev, [selectedPlugin.Id]: false }));

        // Show success message (in real app, you might want to use a toast notification)
        console.log(
          `✅ Plugin configuration saved successfully for ${selectedPlugin.Id}!`
        );

        // In real implementation, you would call an API to save the changes
        // await savePluginConfiguration(editPluginId, selectedPlugin.Id, validatedData);
      } catch (error) {
        console.error("Failed to save plugin configuration:", error);
      }
    }
  };

  const handleReset = () => {
    if (selectedPlugin && pluginConfig) {
      const resetProps = {} as PluginGenericProps;
      Object.entries(pluginConfig.properties).forEach(([key, config]) => {
        resetProps[key] = config.default;
      });
      setProperties(resetProps);
      setHasChanges((prev) => ({ ...prev, [selectedPlugin.Id]: false }));
      setValidationErrors((prev) => ({ ...prev, [selectedPlugin.Id]: {} }));
    }
  };

  if (!selectedMonitor) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">No Monitor Selected</h3>
        <p>Please select a monitor to edit its plugin properties.</p>
      </div>
    );
  }

  if (!selectedPlugin) {
    return (
      <div className="p-6 text-center space-y-10 text-gray-500">
        <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">No Plugin Selected</h3>
        <p>Please select a plugin to edit its properties.</p>

        <Button className="px-4 py-3">Add a Plugin</Button>
      </div>
    );
  }

  if (
    !selectedMonitor.PluginDetails ||
    selectedMonitor.PluginDetails.length === 0
  ) {
    return (
      <div className="p-6 text-center text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
        <h3 className="text-lg font-medium mb-2">No Plugins Available</h3>
        <p>This monitor doesn&#39;t have any plugins configured.</p>
      </div>
    );
  }

  const currentPluginErrors = validationErrors[selectedPlugin.Id] ?? {};
  const hasValidationErrors = Object.keys(currentPluginErrors).some(
    (key) => currentPluginErrors[key]
  );
  const currentPluginHasChanges = hasChanges
    ? hasChanges[selectedPlugin.Id]
    : false;

  const renderPropertyInput = (key: string, config: PluginInputProps) => {
    const value = properties[key];
    const errors = validationErrors[selectedPlugin?.Id]?.[key] as Array<string>;
    const hasError = errors && errors.length > 0;

    const commonClasses = `w-full px-3 py-2 border rounded-md transition-colors ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
    } focus:outline-none focus:ring-2`;

    switch (config.type) {
      case "text":
        return (
          <div className="space-y-1">
            <input
              type="text"
              value={(value as string | number) || ""}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
              className={commonClasses}
              placeholder={config.label}
            />
            {hasError && (
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div
                    key={index + 1}
                    className="flex items-center text-red-600 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-1">
            <Textarea
              value={(value as string | number) || ""}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
              className={`${commonClasses} h-20 resize-vertical`}
              placeholder={config.label}
            />
            {hasError && (
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div
                    key={index + 1}
                    className="flex items-center text-red-600 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "number":
        return (
          <div className="space-y-1">
            <Input
              type="number"
              value={(value as string | number) || ""}
              onChange={(e) => {
                const numValue =
                  e.target.value === "" ? "" : Number(e.target.value);
                handlePropertyChange(key, numValue);
              }}
              className={commonClasses}
              min={config.min}
              max={config.max}
              placeholder={config.label}
            />
            {hasError && (
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div
                    key={index + 1}
                    className="flex items-center text-red-600 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "boolean":
        return (
          <div className="flex items-center">
            <Input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handlePropertyChange(key, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            {hasError && (
              <div className="ml-3 space-y-1">
                {errors.map((error, index) => (
                  <div
                    key={index + 1}
                    className="flex items-center text-red-600 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "select":
        return (
          <div className="space-y-1">
            <Select
              value={(value as string) || ""}
              onValueChange={(e) => handlePropertyChange(key, e)}
              // className={commonClasses}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose interval" />
              </SelectTrigger>
              <SelectContent>
                {(config.options ?? []).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div
                    key={index + 1}
                    className="flex items-center text-red-600 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return <div className="text-gray-500">Unsupported property type</div>;
    }
  };

  return (
    <div className="p-6 min-h-full h-full w-full rounded-lg shadow-sm border">
      <div className="mb-6 border-b pb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Plugin Editor: {selectedMonitor.ServiceName}
        </h2>
        <div className="mt-2 flex items-center space-x-4 text-sm ">
          <span className="text-sm">
            Plugin {(selectedPluginIndex ?? 1) + 1} of{" "}
            {selectedMonitor.PluginDetails?.length ?? 0}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">
            {selectedMonitor.PluginDetails.length} plugin
            {selectedMonitor.PluginDetails.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Plugin Selection Sidebar */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-medium mb-3">Plugins</h3>
          <div className="space-y-2">
            {selectedMonitor.PluginDetails.map((plugin) => {
              const config = PLUGIN_CONFIGS[plugin.Id];
              const pluginHasChanges = hasChanges
                ? hasChanges[plugin.Id]
                : false;
              const pluginHasErrors =
                validationErrors[plugin.Id] &&
                Object.keys(validationErrors[plugin.Id]).some(
                  (key) => validationErrors[plugin.Id][key]
                );

              return (
                <div
                  key={plugin.Id}
                  onClick={() => setSelectedPluginId(plugin.Id)}
                  className={`relative p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlugin.Id === plugin.Id
                      ? "bg-blue-50 border-blue-300"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {config?.name || plugin.Id}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {plugin.Name}
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-2 space-y-1">
                      {pluginHasChanges ? (
                        <div
                          className="w-2 h-2 bg-amber-400 rounded-full"
                          title="Has unsaved changes"
                        ></div>
                      ) : (
                        <></>
                      )}
                      {pluginHasErrors && (
                        <div
                          className="w-2 h-2 bg-red-400 rounded-full"
                          title="Has validation errors"
                        ></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3">
          {!pluginConfig ? (
            <div className="p-6 w-full text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-medium mb-2">Unknown Plugin Type</h3>
              <p>Plugin {selectedPlugin.Name} is not supported.</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                {/* Plugin Configuration Form */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pluginConfig.name} Configuration
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500">
                      Plugin ID: {selectedPlugin.Id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(pluginConfig.properties).map(
                  ([key, config]) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {config.label}
                        {/* Check if field is required from Zod schema */}
                        {isZodObject(pluginConfig.schema) &&
                          pluginConfig.schema.shape[key] &&
                          !pluginConfig.schema.shape[key].isOptional() && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                      </label>
                      {renderPropertyInput(key, config)}
                      {config.type === "number" &&
                        (config.min !== undefined ||
                          config.max !== undefined) && (
                          <div className="text-xs text-gray-500">
                            Range: {config.min ?? "∞"} - {config.max ?? "∞"}
                          </div>
                        )}
                    </div>
                  )
                )}
              </div>

              <div className="mt-8 flex items-center justify-between pt-6 border-t">
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSave}
                    disabled={
                      !currentPluginHasChanges ||
                      hasValidationErrors ||
                      isValidating
                    }
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isValidating ? "Validating..." : "Save Changes"}
                  </Button>
                  <Button
                    onClick={handleReset}
                    disabled={!currentPluginHasChanges || isValidating}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>

                <div className="flex items-center space-x-3">
                  {hasValidationErrors && (
                    <div className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Validation errors
                    </div>
                  )}
                  {currentPluginHasChanges && !hasValidationErrors && (
                    <div className="text-sm text-amber-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Unsaved changes
                    </div>
                  )}
                  {isValidating && (
                    <div className="text-sm text-blue-600 flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-1"></div>
                      Validating...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PluginSelectorProps {
  editId: string | undefined;
  selectedPluginIds: string[];
  onAddPlugins: (Ids: string[]) => void;
}

export const PluginSelector: React.FC<PluginSelectorProps> = ({
  editId,
  selectedPluginIds,
  onAddPlugins,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchTerm = useDebouncedSearch(searchInput, 300);

  const { data: monitors, isLoading: isMonitorsLoading } =
    useGetAllMonitorsQuery();
  const { data: plugins, isLoading } = useGetMonitorPluginsQuery();

  const [serviceMonitors, setServiceMonitors] = useState<BaseMonitor[]>(
    monitors ?? []
  );
  const [allPlugins, setAllPlugins] = useState<MonitorPlugin[]>(plugins ?? []);

  const selectedDevice = serviceMonitors.find(
    (service) => service.SystemMonitorId == editId
  );

  useEffect(() => {
    const initialize = async () => {
      try {
        setServiceMonitors(monitors ?? []);
        setAllPlugins(plugins ?? []);
        console.log(plugins);

        if (selectedDevice?.Plugins) {
          setSelected([...(selectedDevice?.Plugins ?? [])]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    initialize();
  }, [selectedDevice?.Plugins, monitors, plugins]);

  // Filter plugins based on selected device type
  const filteredPlugins = allPlugins.filter(
    (plugin) =>
      plugin.compatibleDeviceTypes.includes(
        selectedDevice?.Device as ServiceType
      ) || !selectedPluginIds.includes(plugin.Id)
  );

  const toggleDevice = (deviceId: string) => {
    setSelected((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleAddSelected = () => {
    console.log(selected);
    onAddPlugins(selected);
  };

  if (isLoading || isMonitorsLoading) {
    return <LoadingEventUI />;
  }

  return (
    <div className="">
      {/* <CardHeader>
        <CardTitle>Service Plugin Management</CardTitle>
      </CardHeader>
      <CardContent> */}
      {/* <Form {...form}> */}
      <div className="space-y-6 relative">
        <div className="space-y-4">
          <Input
            placeholder="Search Monitors..."
            value={debouncedSearchTerm}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <Separator />
          <div className="space-y-2 min-h-[80vh]">
            <CardTitle>
              Select Plugins for Service Device [{selectedDevice?.Device}] you
              want to monitor.
            </CardTitle>

            {filteredPlugins.map((plugin) => (
              <div
                key={plugin.Id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selected.includes(plugin.Id)
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-accent"
                }`}
                onClick={() => toggleDevice(plugin.Id)}
              >
                <Checkbox
                  className="checkbox-input absolute inline-block form-checkbox bg-transparent rounded-full h-8 w-8 text-indigo-600"
                  checked={selected.includes(plugin.Id)}
                />
                <div className="flex-1">
                  <span className="checkbox-tile">
                    <Image
                      aria-hidden
                      src={"/" + "globe" + ".svg"}
                      className="px-5 checkbox-icon"
                      width={50}
                      height={50}
                      alt={plugin.Description}
                    />
                  </span>
                  <FormLabel className="checkbox-label text-lg ml-2 font-medium --text-sm">
                    {plugin.Name}
                  </FormLabel>

                  <FormDescription>{plugin.Description}</FormDescription>
                </div>
              </div>
            ))}
          </div>
        </div>

        <SheetFooter className=" w-full">
          <Button
            type="button"
            disabled={selected.length === 0}
            onClick={handleAddSelected}
          >
            Add Selected ({selected.length})
          </Button>
        </SheetFooter>
      </div>
      {/* </Form> */}
      {/* </CardContent> */}
    </div>
  );
};
