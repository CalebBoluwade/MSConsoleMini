/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { z } from "zod";
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import {
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Save,
  Search,
  Settings,
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { isZodObject } from "@/lib/helpers/schema/utils";
import {
  useGetMonitorPluginsQuery,
  useGetSingleMonitorQuery,
} from "@/lib/helpers/api/MonitorService";
import LoadingEventUI from "../LoadingUI";
import { SheetFooter } from "../ui/sheet";
import { CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export interface PluginEditorProps {
  selectedMonitor: BaseMonitor;
}

type ValidationErrors = {
  [pluginId: string]: {
    [propertyKey: string]: string[] | undefined;
  };
};

export const PluginEditor: React.FC<PluginEditorProps> = ({
  selectedMonitor,
}) => {
  const [pluginConfigurations, setPluginConfigurations] = useState<
    Record<string, PluginGenericProps>
  >({});
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPluginId, setSelectedPluginId] = useState<string>();
  const [saveStatus, setSaveStatus] = useState<
    Record<string, "success" | "error" | null>
  >({});

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
    if (selectedMonitor?.PluginDetails) {
      const configurations: Record<string, PluginGenericProps> = {};
      const changes: Record<string, boolean> = {};

      selectedMonitor.PluginDetails.forEach((plugin) => {
        const config = PLUGIN_CONFIGS[plugin.Id];
        if (config) {
          const pluginConfig: PluginGenericProps = {};

          // Parse existing configuration if available
          let existingConfig: Record<string, any> = {};
          try {
            existingConfig = selectedMonitor.Configuration
              ? JSON.parse(selectedMonitor.Configuration)
              : {};
          } catch (err) {
            console.error(
              `Invalid JSON in plugin ${plugin.Id} configuration:`,
              err
            );
          }

          // Initialize with defaults and existing values
          Object.entries(config.properties).forEach(([key, propConfig]) => {
            pluginConfig[key] = existingConfig[key] ?? propConfig.default;
          });

          configurations[plugin.Id] = pluginConfig;
          changes[plugin.Id] = false;
        }
      });

      setPluginConfigurations(configurations);
      setHasChanges(changes);
      setValidationErrors({});
      setSaveStatus({});
    }
  }, [selectedMonitor]);

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

    console.log(key, value)

    const newConfiguration = {
      ...pluginConfigurations[selectedPlugin.Id],
      [key]: value,
    } as PluginGenericProps;

    setPluginConfigurations((prev) => ({
      ...prev,
      [selectedPlugin.Id]: newConfiguration,
    }));

    setHasChanges((prev) => ({ ...prev, [selectedPlugin.Id]: true }));
    setSaveStatus((prev) => ({ ...prev, [selectedPlugin.Id]: null }));

    // Validate the single property
    const errors = await validateSingleProperty(key, value);
    setValidationErrors((prev) => ({
      ...prev,
      [selectedPlugin.Id]: {
        ...(prev[selectedPlugin.Id] ?? {}),
        [key]: errors.length > 0 ? errors : undefined,
      },
    }));
  };

  const handleSave = async () => {
    if (!pluginConfig?.schema || !selectedPlugin) return;

    setIsSaving(true);
    const currentConfig = pluginConfigurations[selectedPlugin.Id];

    try {
      const errors = await validateProperties(currentConfig);
      setValidationErrors((prev) => ({
        ...prev,
        [selectedPlugin.Id]: errors,
      }));

      const hasErrors = Object.keys(errors).length > 0;

      if (!hasErrors) {
        // Validate the complete object one more time before saving
        const validatedData = await pluginConfig.schema.parseAsync(
          currentConfig
        );

        const pluginConfigObject = { [selectedPlugin.Id]: validatedData };

        // Simulate API call to save configuration
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update the monitor's plugin configuration
        const updatedPluginDetails = selectedMonitor.PluginDetails.map(
          (plugin) =>
            plugin.Id === selectedPlugin.Id
              ? { ...plugin, Configuration: JSON.stringify(pluginConfigObject) }
              : plugin
        );

        // In real implementation, you would call an API to save the changes
        console.log(
          `Saving plugin configuration for ${selectedPlugin.Id}:`,
          pluginConfigObject, updatedPluginDetails
        );

       // await savePluginConfiguration(selectedMonitor.SystemMonitorId, selectedPlugin.Id, validatedData);

        setHasChanges((prev) => ({ ...prev, [selectedPlugin.Id]: false }));
        setSaveStatus((prev) => ({ ...prev, [selectedPlugin.Id]: "success" }));

        // Clear success status after 3 seconds
        setTimeout(() => {
          setSaveStatus((prev) => ({ ...prev, [selectedPlugin.Id]: null }));
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to save plugin configuration:", error);
      setSaveStatus((prev) => ({ ...prev, [selectedPlugin.Id]: "error" }));

      // Clear error status after 5 seconds
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [selectedPlugin.Id]: null }));
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (selectedPlugin && pluginConfig) {
      const resetProps = {} as PluginGenericProps;
      Object.entries(pluginConfig.properties).forEach(([key, config]) => {
        resetProps[key] = config.default;
      });

      setPluginConfigurations((prev) => ({
        ...prev,
        [selectedPlugin.Id]: resetProps,
      }));
      setHasChanges((prev) => ({ ...prev, [selectedPlugin.Id]: false }));
      setValidationErrors((prev) => ({ ...prev, [selectedPlugin.Id]: {} }));
      setSaveStatus((prev) => ({ ...prev, [selectedPlugin.Id]: null }));
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
  const currentPluginHasChanges = hasChanges[selectedPlugin.Id] ?? false;
  const currentPluginConfig = pluginConfigurations[selectedPlugin.Id] ?? {};
  const currentSaveStatus = saveStatus[selectedPlugin.Id];
  
  // Check if plugin has existing configuration
  const hasExistingConfig = selectedMonitor?.Configuration && 
    selectedMonitor.Configuration.trim() !== '' && 
    selectedMonitor.Configuration !== '{}';
  
  const handleCreateConfig = () => {
    if (selectedPlugin && pluginConfig) {
      const defaultConfig: PluginGenericProps = {};
      Object.entries(pluginConfig.properties).forEach(([key, config]) => {
        defaultConfig[key] = config.default;
      });
      
      setPluginConfigurations((prev) => ({
        ...prev,
        [selectedPlugin.Id]: defaultConfig,
      }));
      setHasChanges((prev) => ({ ...prev, [selectedPlugin.Id]: true }));
    }
  };

  const renderPropertyInput = (key: string, config: PluginInputProps) => {
    const value = currentPluginConfig[key];
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
              const pluginHasChanges = hasChanges[plugin.Id] ?? false;
              const pluginHasErrors =
                validationErrors[plugin.Id] &&
                Object.keys(validationErrors[plugin.Id]).some(
                  (key) => validationErrors[plugin.Id][key]
                );
              const pluginSaveStatus = saveStatus[plugin.Id];

              return (
                <div
                  key={plugin.Id}
                  onClick={() => setSelectedPluginId(plugin.Id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPluginId(plugin.Id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
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
                      {pluginSaveStatus === "success" && (
                        <CheckCircle2
                          className="w-4 h-4 text-green-500"
                          // title="Saved successfully"
                        />
                      )}
                      {pluginSaveStatus === "error" && (
                        <XCircle
                          className="w-4 h-4 text-red-500"
                          // title="Save failed"
                        />
                      )}
                      {pluginHasChanges && !pluginSaveStatus && (
                        <div
                          className="w-2 h-2 bg-amber-400 rounded-full"
                          title="Has unsaved changes"
                        />
                      )}
                      {pluginHasErrors && (
                        <div
                          className="w-2 h-2 bg-red-400 rounded-full"
                          title="Has validation errors"
                        />
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
                    {hasExistingConfig ? (
                      <Badge variant="outline" className="text-xs text-green-600">
                        Configured
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-amber-600">
                        No Configuration
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {!hasExistingConfig && Object.keys(currentPluginConfig).length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Configuration Found</h3>
                  <p className="text-gray-500 mb-4">
                    This plugin doesn&apos;t have a configuration yet. Create one to get started.
                  </p>
                  <Button onClick={handleCreateConfig} className="px-6 py-2">
                    Create Configuration
                  </Button>
                </div>
              ) : (
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
              )}

              {(hasExistingConfig || Object.keys(currentPluginConfig).length > 0) && (
                <div className="mt-8 flex items-center justify-between pt-6 border-t">
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSave}
                    disabled={
                      !currentPluginHasChanges ||
                      hasValidationErrors ||
                      isValidating ||
                      isSaving
                    }
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving
                      ? "Saving..."
                      : isValidating
                      ? "Validating..."
                      : "Save Changes"}
                  </Button>
                  <Button
                    onClick={handleReset}
                    disabled={
                      !currentPluginHasChanges || isValidating || isSaving
                    }
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>

                <div className="flex items-center space-x-3">
                  {currentSaveStatus === "success" && (
                    <div className="text-sm text-green-600 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Saved successfully
                    </div>
                  )}
                  {currentSaveStatus === "error" && (
                    <div className="text-sm text-red-600 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      Save failed
                    </div>
                  )}
                  {hasValidationErrors && (
                    <div className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Validation errors
                    </div>
                  )}
                  {currentPluginHasChanges &&
                    !hasValidationErrors &&
                    !currentSaveStatus && (
                      <div className="text-sm text-amber-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Unsaved changes
                      </div>
                    )}
                  {isSaving && (
                    <div className="text-sm text-blue-600 flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-1"></div>
                      Saving...
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
              )}
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
  onRemovePlugins?: (pluginIds: string[]) => void;
}

const EmptyState = ({ searchTerm }: { searchTerm: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-medium text-muted-foreground">
      {searchTerm ? "No plugins found" : "No compatible plugins available"}
    </h3>
    <p className="text-sm text-muted-foreground mt-1">
      {searchTerm
        ? `Try adjusting your search term "${searchTerm}"`
        : "No plugins are compatible with the selected device type"}
    </p>
  </div>
);

const PluginCard = React.memo(
  ({
    plugin,
    isSelected,
    isAlreadyAdded,
    onToggle,
    canRemove = false,
  }: {
    plugin: MonitorPlugin;
    isSelected: boolean;
    isAlreadyAdded: boolean;
    onToggle: (pluginId: string) => void;
    canRemove?: boolean;
  }) => {
    const handleClick = useCallback(() => {
      onToggle(plugin.Id);
    }, [plugin.Id, onToggle]);

    const showAsRemovable = isAlreadyAdded && canRemove;

    return (
      <div
        className={`group relative flex items-start gap-3 p-4 border rounded-lg transition-all duration-200 ${
          showAsRemovable
            ? "bg-destructive/5 border-destructive/30 hover:bg-destructive/10 cursor-pointer"
            : isAlreadyAdded
            ? "bg-muted/50 border-muted cursor-not-allowed opacity-60"
            : isSelected
            ? "bg-primary/10 border-primary shadow-sm cursor-pointer"
            : "hover:bg-accent hover:shadow-sm cursor-pointer"
        }`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(plugin.Id);
          }
        }}
      >
        <div className="flex-shrink-0 mt-1">
          <Checkbox
            checked={isSelected || (isAlreadyAdded && !showAsRemovable)}
            disabled={isAlreadyAdded && !canRemove}
            className={`h-5 w-5 ${
              showAsRemovable
                ? "data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                : ""
            }`}
            onChange={() => onToggle(plugin.Id)}
          />
        </div>

        <div className="flex-shrink-0">
          <div className="relative">
            <Image
              src="/globe.svg"
              width={40}
              height={40}
              alt={`${plugin.Name} icon`}
              className="rounded-md"
            />
            {isAlreadyAdded && !showAsRemovable && (
              <div className="absolute -top-1 -right-1">
                <CheckCircle2 className="h-4 w-4 text-green-600 bg-white rounded-full" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FormLabel
              className={`text-base font-medium cursor-pointer ${
                showAsRemovable
                  ? "group-hover:text-destructive"
                  : "group-hover:text-primary"
              }`}
            >
              {plugin.Name}
            </FormLabel>
            {plugin.isRecommended && (
              <Badge variant="secondary" className="text-xs">
                Recommended
              </Badge>
            )}
            {isAlreadyAdded && !showAsRemovable && (
              <Badge variant="outline" className="text-xs">
                Already Added
              </Badge>
            )}
            {showAsRemovable && (
              <Badge variant="destructive" className="text-xs">
                Click to Remove
              </Badge>
            )}
          </div>
          <FormDescription className="text-sm leading-relaxed">
            {plugin.Description}
          </FormDescription>
          {plugin.pluginType && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {plugin.pluginType}
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  }
);

PluginCard.displayName = "PluginCard";

export const PluginSelector: React.FC<PluginSelectorProps> = ({
  editId,
  selectedPluginIds,
  onAddPlugins,
  onRemovePlugins,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [toRemove, setToRemove] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [showRemovalMode, setShowRemovalMode] = useState(false);

  // Custom hooks would be replaced with your actual implementations
  const debouncedSearchTerm = useDebouncedSearch(searchInput, 300);
  const {
    data: selectedMonitor,
    isLoading: isMonitorsLoading,
    error: monitorError,
  } = useGetSingleMonitorQuery(editId! ?? "", {
    skip: !editId,
  });
  const {
    data: plugins,
    isLoading: isPluginsLoading,
    error: pluginsError,
  } = useGetMonitorPluginsQuery();

  // Initialize selected plugins from monitor data
  useEffect(() => {
    if (selectedMonitor?.Plugins) {
      setSelected(selectedMonitor.Plugins);
    }
  }, [selectedMonitor?.Plugins]);

  // Filter and search plugins
  const { searchResults, stats } = useMemo(() => {
    if (!plugins) {
      return {
        compatiblePlugins: [],
        searchResults: [],
        stats: { total: 0, compatible: 0, alreadyAdded: 0 },
      };
    }

    // If no selectedMonitor (creating new service), show all plugins
    if (!selectedMonitor) {
      const searched = debouncedSearchTerm
        ? plugins.filter(
            (plugin) =>
              plugin.Name.toLowerCase().includes(
                debouncedSearchTerm.toLowerCase()
              ) ||
              plugin.Description.toLowerCase().includes(
                debouncedSearchTerm.toLowerCase()
              ) ||
              plugin.pluginType
                ?.toLowerCase()
                .includes(debouncedSearchTerm.toLowerCase())
          )
        : plugins;

      return {
        compatiblePlugins: plugins,
        searchResults: searched,
        stats: {
          total: plugins.length,
          compatible: plugins.length,
          alreadyAdded: 0,
        },
      };
    }

    // Debug logging
    console.log('Available plugins:', plugins);
    console.log('Selected monitor device:', selectedMonitor.Device);

    // Filter by device compatibility - fallback to show all plugins if compatibility check fails
    const compatible = plugins.filter((plugin) => {
      const isCompatible = plugin.compatibleDeviceTypes?.includes(
        selectedMonitor.Device as ServiceType
      );
      console.log(`Plugin ${plugin.Name} compatible:`, isCompatible, 'compatibleTypes:', plugin.compatibleDeviceTypes);
      return isCompatible;
    });

    // If no compatible plugins found, show all plugins as fallback
    const pluginsToShow = compatible.length > 0 ? compatible : plugins;

    // Apply search filter
    const searched = debouncedSearchTerm
      ? pluginsToShow.filter(
          (plugin) =>
            plugin.Name.toLowerCase().includes(
              debouncedSearchTerm.toLowerCase()
            ) ||
            plugin.Description.toLowerCase().includes(
              debouncedSearchTerm.toLowerCase()
            ) ||
            plugin.pluginType
              ?.toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase())
        )
      : pluginsToShow;

    const alreadyAddedCount = searched.filter((plugin) =>
      selectedPluginIds.includes(plugin.Id)
    ).length;

    console.log('Final search results:', searched);

    return {
      compatiblePlugins: compatible,
      searchResults: searched,
      stats: {
        total: plugins.length,
        compatible: compatible.length > 0 ? compatible.length : plugins.length,
        alreadyAdded: alreadyAddedCount,
      },
    };
  }, [plugins, selectedMonitor, debouncedSearchTerm, selectedPluginIds]);

  const togglePlugin = useCallback(
    (pluginId: string) => {
      if (showRemovalMode && selectedPluginIds.includes(pluginId)) {
        // Toggle removal selection for already added plugins
        setToRemove((prev) =>
          prev.includes(pluginId)
            ? prev.filter((id) => id !== pluginId)
            : [...prev, pluginId]
        );
      } else {
        // Toggle selection for new plugins
        setSelected((prev) =>
          prev.includes(pluginId)
            ? prev.filter((id) => id !== pluginId)
            : [...prev, pluginId]
        );
      }
    },
    [showRemovalMode, selectedPluginIds]
  );

  const handleAddSelected = useCallback(() => {
    const newlySelected = selected.filter(
      (id) => !selectedPluginIds.includes(id)
    );
    onAddPlugins(newlySelected);
    setSelected([]);
  }, [selected, selectedPluginIds, onAddPlugins]);

  const handleRemoveSelected = useCallback(() => {
    if (onRemovePlugins && toRemove.length > 0) {
      onRemovePlugins(toRemove);
      setToRemove([]);
      setShowRemovalMode(false);
    }
  }, [toRemove, onRemovePlugins]);

  const handleClearSelection = useCallback(() => {
    if (showRemovalMode) {
      setToRemove([]);
    } else {
      setSelected([]);
    }
  }, [showRemovalMode]);

  const toggleMode = useCallback(() => {
    setShowRemovalMode((prev) => !prev);
    setSelected([]);
    setToRemove([]);
  }, []);

  const isLoading = isMonitorsLoading || isPluginsLoading;
  const hasError = monitorError || pluginsError;
  const newlySelectedCount = selected.filter(
    (id) => !selectedPluginIds.includes(id)
  ).length;
  const toRemoveCount = toRemove.length;
  const canRemovePlugins = Boolean(onRemovePlugins);
  const hasAlreadyAddedPlugins = selectedPluginIds.length > 0;

  if (isLoading) {
    return <LoadingEventUI />;
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">
            Failed to load plugins or monitor data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search plugins by name, description, or category..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{stats.compatible} compatible plugins</span>
          {debouncedSearchTerm && <span>{searchResults.length} found</span>}
          <span>{stats.alreadyAdded} already added</span>
        </div>

        <Separator />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {showRemovalMode ? "Remove Plugins from" : "Select Plugins for"}{" "}
              {selectedMonitor?.Device || "Service"}
            </CardTitle>
            {showRemovalMode && (
              <p className="text-sm text-muted-foreground">
                Select plugins to remove from monitoring
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canRemovePlugins && hasAlreadyAddedPlugins && (
              <Button
                variant={showRemovalMode ? "destructive" : "outline"}
                size="sm"
                onClick={toggleMode}
              >
                {showRemovalMode ? "Cancel Remove" : "Remove Plugins"}
              </Button>
            )}
            {(selected.length > 0 || toRemove.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
              >
                Clear Selection
              </Button>
            )}
          </div>
        </div>

        {/* Plugin List */}
        <div className="space-y-3 min-h-[60vh] max-h-[60vh] overflow-y-auto">
          {searchResults.length === 0 ? (
            <EmptyState searchTerm={debouncedSearchTerm} />
          ) : (
            searchResults.map((plugin) => {
              const isAlreadyAdded = selectedPluginIds.includes(plugin.Id);
              const isSelectedForAddition = selected.includes(plugin.Id);
              const isSelectedForRemoval = toRemove.includes(plugin.Id);

              // Show plugin if:
              // 1. Not in removal mode, OR
              // 2. In removal mode and plugin is already added
              const shouldShow = !showRemovalMode || isAlreadyAdded;

              if (!shouldShow) return null;

              return (
                <PluginCard
                  key={plugin.Id}
                  plugin={plugin}
                  isSelected={
                    showRemovalMode
                      ? isSelectedForRemoval
                      : isSelectedForAddition
                  }
                  isAlreadyAdded={isAlreadyAdded}
                  onToggle={togglePlugin}
                  canRemove={showRemovalMode}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <SheetFooter className="w-full gap-2">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-muted-foreground">
            {showRemovalMode
              ? toRemoveCount > 0 && (
                  <span className="text-destructive">
                    {toRemoveCount} plugin{toRemoveCount !== 1 ? "s" : ""}{" "}
                    selected for removal
                  </span>
                )
              : newlySelectedCount > 0 && (
                  <span>
                    {newlySelectedCount} new plugin
                    {newlySelectedCount !== 1 ? "s" : ""} selected
                  </span>
                )}
          </div>

          {showRemovalMode ? (
            <Button
              type="button"
              variant="destructive"
              disabled={toRemoveCount === 0}
              onClick={handleRemoveSelected}
              className="min-w-[140px]"
            >
              Remove Selected ({toRemoveCount})
            </Button>
          ) : (
            <Button
              type="button"
              disabled={newlySelectedCount === 0}
              onClick={handleAddSelected}
              className="min-w-[140px]"
            >
              Add Selected ({newlySelectedCount})
            </Button>
          )}
        </div>
      </SheetFooter>
    </div>
  );
};
