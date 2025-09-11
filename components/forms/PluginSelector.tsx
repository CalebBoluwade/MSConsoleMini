"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  CheckCircle2,
  Search,
} from "lucide-react";

import {
  useGetMonitorPluginsQuery,
  useGetSingleMonitorQuery,
} from "@/lib/helpers/api/MonitorService";
import { FormDescription, FormLabel } from "../ui/form";
import { Badge } from "../ui/badge";
import useDebouncedSearch from "@/lib/hooks/useDebouncedSearch";
import { CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import LoadingEventUI from "../LoadingUI";
import { SheetFooter } from "../ui/sheet";


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
        // role="button"
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

interface PluginSelectorProps {
  editId: string | undefined;
  createdDeviceType: string;
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

export const PluginSelector: React.FC<PluginSelectorProps> = ({
  editId,
  createdDeviceType,
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
    refetchOnMountOrArgChange: true,
    skip: !editId,
  });

  const {
    data: plugins,
    isLoading: isPluginsLoading,
    error: pluginsError,
  } = useGetMonitorPluginsQuery(null, {
    refetchOnMountOrArgChange: true,
  });

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
        : plugins.filter((x) =>
            x.compatibleDeviceTypes?.includes(createdDeviceType as ServiceType)
          );

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
    console.log("Available plugins:", plugins);
    console.log("Selected monitor device:", selectedMonitor.Device);

    // Filter by device compatibility - fallback to show all plugins if compatibility check fails
    const compatible = plugins.filter((plugin) => {
      const isCompatible = plugin.compatibleDeviceTypes?.includes(
        selectedMonitor.Device as ServiceType
      );
      console.log(
        `Plugin ${plugin.Name} compatible:`,
        isCompatible,
        "compatibleTypes:",
        plugin.compatibleDeviceTypes
      );
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

    console.log("Final search results:", searched);

    return {
      compatiblePlugins: compatible,
      searchResults: searched,
      stats: {
        total: plugins.length,
        compatible: compatible.length > 0 ? compatible.length : plugins.length,
        alreadyAdded: alreadyAddedCount,
      },
    };
  }, [
    plugins,
    selectedMonitor,
    debouncedSearchTerm,
    selectedPluginIds,
    createdDeviceType,
  ]);

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

  if (!createdDeviceType) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">
            Select a device type to view compatible plugins.
          </p>
        </div>
      </div>
    );
  }

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
