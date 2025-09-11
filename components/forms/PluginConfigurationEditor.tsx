/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { z } from "zod";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { Input } from "../ui/input";
import {
  FormField,
  PLUGIN_CONFIGS,
  PluginGenericProps,
} from "@/lib/helpers/schema/plugins";
import { Textarea } from "../ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Save,
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
import { Badge } from "../ui/badge";
import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { useUpdatePluginConfigurationMutation } from "@/lib/helpers/api/MonitorService";
import ActionConfirmation from "../ActionConfirmation";

export interface PluginEditorProps {
  selectedMonitor: BaseMonitor;
}

type ValidationErrors = {
  [pluginId: string]: {
    [propertyKey: string]: string[] | undefined;
  };
};

const PluginConfigurationEditor: React.FC<PluginEditorProps> = ({
  selectedMonitor,
}) => {
  const [updatePluginConfig] = useUpdatePluginConfigurationMutation();
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
  const [showPasswordFields, setShowPasswordFields] = useState<
    Record<string, boolean>
  >({});

  const [editPluginDialogOpen, setEditPluginDialogOpen] = useState(false);

  const selectedPlugin =
    selectedMonitor?.PluginDetails?.find(
      (plugin: MonitorPlugin) => plugin.Id === selectedPluginId
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
            const monitorConfig = selectedMonitor.Configuration
              ? JSON.parse(selectedMonitor.Configuration)
              : {};
            existingConfig = monitorConfig[plugin.Id] || {};
          } catch (err) {
            console.error(
              `Invalid JSON in plugin ${plugin.Id} configuration:`,
              err
            );
          }

          // Initialize with defaults and existing values
          Object.entries(config.fields).forEach(([key, propConfig]) => {
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

    console.log(key, value);

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

        // Parse configuration with error handling
        let updatedPluginDetails;
        try {
          updatedPluginDetails = JSON.parse(selectedMonitor.Configuration);
        } catch (parseError) {
          console.error("Failed to parse monitor configuration:", parseError);
          throw new Error("Invalid JSON configuration format");
        }

        // Ensure configuration is an object
        if (
          typeof updatedPluginDetails !== "object" ||
          updatedPluginDetails === null
        ) {
          console.warn(
            "Configuration is not an object, initializing as empty object"
          );
          updatedPluginDetails = {};
        }

        // Update plugin configuration
        updatedPluginDetails[selectedPlugin.Id] = validatedData;

        await updatePluginConfig({
          monitorId: selectedMonitor.SystemMonitorId,
          configuration: updatedPluginDetails,
        })
          .unwrap()
          .then(() => {
            // Handle successful update
            console.log("Plugin configuration updated successfully");
          })
          .catch((error) => {
            console.error("Failed to update plugin configuration:", error);
          });

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
      Object.entries(pluginConfig.fields).forEach(([key, config]) => {
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
  function hasExistingPluginConfig(
    selectedMonitor: { Configuration?: string },
    selectedPlugin: { Id: string }
  ): boolean {
    try {
      // Validate inputs
      if (!selectedMonitor?.Configuration || !selectedPlugin?.Id) {
        return false;
      }

      // Parse configuration
      const configObj = JSON.parse(selectedMonitor.Configuration);

      // Get plugin-specific configuration
      const pluginConfig = configObj[selectedPlugin.Id];

      // Check if configuration exists and has meaningful content
      if (!pluginConfig) {
        return false;
      }

      // Handle different configuration types
      if (typeof pluginConfig === "string") {
        return pluginConfig.trim() !== "" && pluginConfig !== "{}";
      }

      if (typeof pluginConfig === "object") {
        return Object.keys(pluginConfig).length > 0;
      }

      // For other types (numbers, booleans), consider them as existing config
      return true;
    } catch (jsonError) {
      console.warn("Invalid JSON in monitor configuration:", jsonError);
      return false;
    }
  }

  const hasExistingConfig = hasExistingPluginConfig(selectedMonitor, selectedPlugin);

  const handleCreateConfig = () => {
    if (selectedPlugin && pluginConfig) {
      const defaultConfig: PluginGenericProps = {};
      Object.entries(pluginConfig.fields).forEach(([key, config]) => {
        defaultConfig[key] = config.default;
      });

      setPluginConfigurations((prev) => ({
        ...prev,
        [selectedPlugin.Id]: defaultConfig,
      }));
      setHasChanges((prev) => ({ ...prev, [selectedPlugin.Id]: true }));
    }
  };

  // Check if a field should be visible based on dependencies
  const shouldShowField = (field: FormField, config: any): boolean => {
    if (!field.dependsOn) return true;

    if (typeof field.dependsOn === "string") {
      return !!config[field.dependsOn];
    }

    const dependentValue = config[field.dependsOn.field];
    if (Array.isArray(field.dependsOn.value)) {
      return field.dependsOn.value.includes(dependentValue);
    }
    return dependentValue === field.dependsOn.value;
  };

  const renderPropertyInput = (
    key: string,
    field: FormField,
    disabled: boolean = false
  ) => {
    const value = currentPluginConfig[key];
    const errors = validationErrors[selectedPlugin?.Id]?.[key] as Array<string>;
    const hasError = errors && errors.length > 0;

    const showPassword = showPasswordFields[key] ?? false;
    const togglePasswordVisibility = () => {
      setShowPasswordFields((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    };

    const commonClasses = `w-full px-3 py-4 border rounded-md transition-colors ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
        : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-200"
    } focus:outline-none focus:ring-2`;

    switch (field.type) {
      case "text":
        return (
          <div className="space-y-1">
            <Input
              type="text"
              value={(value as string | number) || ""}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
              className={commonClasses}
              placeholder={field.label}
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

      case "password":
        return (
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={value || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handlePropertyChange(key, e.target.value)
              }
              placeholder={field.label}
              disabled={disabled}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-keyus:border-emerald-500 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-1">
            <Textarea
              value={(value as string | number) || ""}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
              className={`${commonClasses} h-20 resize-vertical`}
              placeholder={field.label}
              disabled={disabled}
              rows={4}
            />
            keyrror && (
            <div className="space-y-1">
              {(errors ?? []).map((error, index) => (
                <div
                  key={index + 1}
                  className="flex items-center text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  {error}
                </div>
              ))}
            </div>
            )
          </div>
        );

      case "key-value":
        const pairs = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {pairs.map((pair, index) => (
              <div key={index + 1} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Header name"
                  value={pair.key || ""}
                  onChange={(e) => {
                    const newPairs = [...pairs];
                    newPairs[index] = { ...pair, key: e.target.value };
                    handlePropertyChange(key, newPairs);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Header value"
                  value={pair.value || ""}
                  onChange={(e) => {
                    const newPairs = [...pairs];
                    newPairs[index] = { ...pair, value: e.target.value };
                    handlePropertyChange(key, newPairs);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    handlePropertyChange(
                      key,
                      pairs.filter((_, i) => i !== index)
                    )
                  }
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  ✕ key{" "}
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                handlePropertyChange(key, [...pairs, { key: "", value: "" }])
              }
              className="text-emerald-600 hover:text-emerald-800 text-sm"
            >
              + Add Header
            </button>
          </div>
        );

      case "number":
        return (
          <div className="space-y-1">
            <Input
              type="number"
              value={(value as string | number) || field.default}
              onChange={(e) => {
                const numValue =
                  e.target.value === "" ? "" : Number(e.target.value);
                handlePropertyChange(key, numValue);
              }}
              className={commonClasses}
              min={field.min}
              max={field.max}
              disabled={disabled}
              placeholder={field.label}
            />
            {hasError && (
              <div className="space-y-1">
                {(errors ?? []).map((error, index) => (
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
            {field.unit && (
              <span className="text-sm text-gray-500">{field.unit}</span>
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
              disabled={disabled}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
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
              value={(value as string) || field.default}
              onValueChange={(e) => handlePropertyChange(key, e)}

              // className={commonClasses}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose interval" />
              </SelectTrigger>
              <SelectContent>
                {(field.options ?? []).map((option) => {
                  if (typeof option === "string") {
                    return (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    );
                  }
                  return (
                    <SelectItem
                      key={option.value.toString()}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  );
                })}
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

      case "multi-select":
        const selectedValues = Array.isArray(value)
          ? value
          : value
          ? [value]
          : field.default || [];
        return (
          <div className="border border-gray-300 rounded-md p-2 overflow-y-auto">
            {(field.options ?? []).map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 py-1"
              >
                <Input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(
                          (v: string) => v !== option.value
                        );
                    handlePropertyChange(key, newValues);
                  }}
                  disabled={disabled}
                  className={commonClasses + " h-4 w-4"}
                />
                <span className="text-sm w-full">{option.label}</span>
              </label>
            ))}
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
            {selectedMonitor.PluginDetails.map((plugin: MonitorPlugin) => {
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
                      ? "bg-emerald-50 border-emerald-300"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {config?.title || plugin.Id}
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
                    {pluginConfig.title} Configuration
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500">
                      Plugin ID: {selectedPlugin.Id}
                    </span>
                    {hasExistingConfig ? (
                      <Badge
                        variant="outline"
                        className="text-xs text-green-600"
                      >
                        Configured
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs text-amber-600"
                      >
                        No Configuration
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {!hasExistingConfig &&
              Object.keys(currentPluginConfig).length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">
                    No Configuration Found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    This plugin doesn&apos;t have a configuration yet. Create
                    one to get started.
                  </p>
                  <Button onClick={handleCreateConfig} className="px-6 py-2">
                    Create Configuration
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(pluginConfig.fields).map(
                    ([key, config]) =>
                      shouldShowField(config, currentPluginConfig) && (
                        <div key={key} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {config.label}
                            {/* Check if field is required from Zod schema */}
                            {pluginConfig.schema instanceof z.ZodObject &&
                              (pluginConfig.schema as z.ZodObject<any>).shape[
                                key
                              ] &&
                              !(pluginConfig.schema as z.ZodObject<any>).shape[
                                key
                              ].isOptional() && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                          </label>
                          {renderPropertyInput(key, config)}
                          {config.type === "number" &&
                            config.min !== undefined && (
                              <div className="text-xs text-gray-500">
                                Range: {config.min ?? "∞"} - {config.max ?? "∞"}
                              </div>
                            )}
                        </div>
                      )
                  )}
                  {(hasExistingConfig ||
                    Object.keys(currentPluginConfig).length > 0) && (
                    <div className="mt-8 flex items-center justify-between pt-6 border-t">
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => setEditPluginDialogOpen(true)}
                          disabled={
                            !currentPluginHasChanges ||
                            hasValidationErrors ||
                            isValidating ||
                            isSaving
                          }
                          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
                          <div className="text-sm text-emerald-600 flex items-center">
                            <div className="animate-spin w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full mr-1"></div>
                            Saving...
                          </div>
                        )}
                        {isValidating && (
                          <div className="text-sm text-emerald-600 flex items-center">
                            <div className="animate-spin w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full mr-1"></div>
                            Validating...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 p-4 bg-gray-200 dark:bg-black-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">
                      Configuration Preview
                    </h3>

                    <SyntaxHighlighter
                      language="sql"
                      style={coldarkDark}
                      wrapLongLines
                      showLineNumbers
                      className="p-3 rounded border overflow-auto max-h-64 text-sm"
                    >
                      {JSON.stringify(currentPluginConfig, null, 2)}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <ActionConfirmation
          triggerButtonLabel={""}
          triggerButtonIcon={<></>}
          dialogTitle={`Modify Plugin Configuration For ${selectedPlugin.Name} on ${selectedMonitor.ServiceName}`}
          dialogDescription="Are you sure you want to modify plugin configuration on this Service?"
          onConfirm={handleSave}
          open={editPluginDialogOpen}
          onOpenChange={setEditPluginDialogOpen}
          onCancel={() => {
            setEditPluginDialogOpen(false);
          }}
          customTrigger={<span></span>}
        />
      </div>
    </div>
  );
};

export default PluginConfigurationEditor;
