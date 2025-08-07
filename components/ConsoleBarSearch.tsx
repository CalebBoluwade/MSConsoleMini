"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Command,
  // CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import useDebouncedSearch from "@/lib/hooks/useDebouncedSearch";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import LoadingEventUI from "./LoadingUI";

type SearchResult = {
  id: string;
  category: "device" | "group" | "service" | "documentation";
  title: string;
  description?: string;
  metadata?: {
    status?: string;
    ipAddress?: string;
    group?: string;
    tags?: string[];
  };
  href: string;
};

interface ConsoleSearchProps {
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  isLoading: boolean;
  // Injected data sources
  devices?: BaseMonitor[];
  groups?: MonitorGroup[];
}

const ConsoleBarSearch = ({
  placeholder,
  isLoading,
  emptyMessage = "No results found.",
  disabled = false,
  className,
  devices = [],
  groups = [],
}: Readonly<ConsoleSearchProps>) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedSearch(searchQuery, 300);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Mock search function - replace with your actual API call
  // const mockSearchAPI = useCallback(async (query: string): Promise<SearchResult[]> => {
  //   // Simulate API delay
  //   await new Promise(resolve => setTimeout(resolve, 200));

  //   const mockData: SearchResult[] = [
  //     // Devices
  //     { id: '1', title: 'EC2-Web-Server-01', description: 'Production web server', href: '/devices/ec2-web-01', category: 'device', tags: ['ec2', 'web', 'production'] },
  //     { id: '2', title: 'DB-Server-Primary', description: 'Primary database server', href: '/devices/db-primary', category: 'devices', tags: ['database', 'primary'] },
  //     { id: '3', title: 'Load-Balancer-Main', description: 'Main application load balancer', href: '/devices/lb-main', category: 'devices', tags: ['load-balancer', 'networking'] },

  //     // Groups
  //     { id: '4', title: 'DevOps Team', description: '12 members', href: '/groups/devops', category: 'groups', tags: ['team', 'devops'] },
  //     { id: '5', title: 'Backend Developers', description: '8 members', href: '/groups/backend-dev', category: 'groups', tags: ['developers', 'backend'] },
  //     { id: '6', title: 'Security Group', description: '5 members', href: '/groups/security', category: 'groups', tags: ['security', 'admin'] },

  //     // Users
  //     { id: '7', title: 'john.doe@company.com', description: 'Senior DevOps Engineer', href: '/users/john-doe', category: 'users', tags: ['devops', 'engineer'] },
  //     { id: '8', title: 'admin@company.com', description: 'System Administrator', href: '/users/admin', category: 'users', tags: ['admin', 'system'] },

  //     // Policies
  //     { id: '9', title: 'EC2FullAccess', description: 'Full access to EC2 instances', href: '/policies/ec2-full', category: 'policies', tags: ['ec2', 'full-access'] },
  //     { id: '10', title: 'ReadOnlyAccess', description: 'Read-only access policy', href: '/policies/readonly', category: 'policies', tags: ['readonly', 'security'] },

  //     // Networks
  //     { id: '11', title: 'VPC-Production', description: 'Production VPC network', href: '/networks/vpc-prod', category: 'networks', tags: ['vpc', 'production'] },
  //     { id: '12', title: 'Subnet-Public-1A', description: 'Public subnet in AZ 1A', href: '/networks/subnet-pub-1a', category: 'networks', tags: ['subnet', 'public'] },
  //   ];

  //   return mockData.filter(item =>
  //     item.title.toLowerCase().includes(query.toLowerCase()) ||
  //     item.description?.toLowerCase().includes(query.toLowerCase()) ||
  //     item.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  //   );
  // }, []);

  // Generate mock search results based on the query
  const generateResults = useCallback(
    (query: string): SearchResult[] => {
      if (!query) return [];

      const lowerQuery = query.toLowerCase();
      const results: SearchResult[] = [];

      // Search devices
      if (!activeCategory || activeCategory === "devices") {
        devices.forEach((device) => {
          if (
            device.ServiceName.toLowerCase().includes(lowerQuery) ||
            device.IPAddress.toLowerCase().includes(lowerQuery) ||
            device.SystemMonitorId.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: device.SystemMonitorId,
              category: "device",
              title: device.ServiceName,
              description: device.IPAddress,
              metadata: {
                status: device.CurrentHealthCheck,
                ipAddress: device.IPAddress,
              },
              href: `/console/monitors/${device.SystemMonitorId}`,
            });
          }
        });
      }

      // Search groups
      if (!activeCategory || activeCategory === "groups") {
        groups.forEach((group) => {
          if (
            group.name.toLowerCase().includes(lowerQuery) ||
            group.description?.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: group.id,
              category: "group",
              title: group.name,
              description: group.description,
              metadata: {
                tags: [],
                group: `${group.deviceIds.length} devices`,
              },
              href: `/console/groups/${group.id}`,
            });
          }
        });
      }

      // Add documentation results (example)
      if (!activeCategory || activeCategory === "documentation") {
        const docs = [
          { title: "Getting Started", path: "/docs/getting-started" },
          { title: "API Reference", path: "/docs/api" },
          { title: "Troubleshooting", path: "/docs/troubleshooting" },
        ];

        docs.forEach((doc) => {
          if (doc.title.toLowerCase().includes(lowerQuery)) {
            results.push({
              id: doc.title,
              category: "documentation",
              title: doc.title,
              href: doc.path,
            });
          }
        });
      }

      return results;
    },
    [devices, groups, activeCategory]
  );

  // Memoized search results
  const searchResults = useMemo(() => {
    return generateResults(debouncedQuery);
  }, [debouncedQuery, generateResults]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {
      devices: [],
      groups: [],
      documentation: [],
    };

    searchResults.forEach((result) => {
      groups[result.category] = groups[result.category] || [];
      groups[result.category].push(result);
    });

    return Object.entries(groups)
      .filter(([_, items]) => {
        if (!_) {
          console.log(_);
        }
        return items.length > 0;
      })
      .map(([type, items]) => ({
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        items,
      }));
  }, [searchResults]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.href);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "relative h-9 w-full justify-between px-3 text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-96",
            className
          )}
        >
          <span className="hidden lg:inline-flex">{placeholder}</span>
          <span className="inline-flex lg:hidden">Search...</span>
          <div className="pointer-events-none absolute right-1.5 top-1.5 hidden items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘K</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 sm:w-[32rem]"
        align="start"
        sideOffset={10}
      >
        <Command
          className="--w-full rounded-lg border shadow-md"
          shouldFilter={false}
          loop
        >
          <div className="flex items-center justify-between border-b px-3">
            <CommandInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder={placeholder}
              disabled={isLoading}
              className="h-11 w-full border-none focus:ring-0 focus-visible:ring-0"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => setIsOpen(false)}
            >
              Esc
            </Button>
          </div>

          {isLoading && <LoadingEventUI />}

          {searchQuery && !isLoading && (
            <CommandList className="max-h-[60vh] overflow-auto">
              <CommandEmpty className="py-6 text-center text-sm">
                {emptyMessage}
              </CommandEmpty>

              {groupedResults.map((group, i) => (
                <React.Fragment key={group.type}>
                  <CommandGroup heading={group.label}>
                    {group.items.map((result) => (
                      <CommandItem
                        key={`${result.category}-${result.id}`}
                        value={`${result.category}-${result.id}`}
                        onSelect={() => handleSelectResult(result)}
                        className="cursor-pointer gap-2"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className="mr-2">{result.title}</span>
                            {result.metadata?.status && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs capitalize"
                              >
                                {result.metadata.status}
                              </Badge>
                            )}
                          </div>
                          {result.description && (
                            <span className="text-xs text-muted-foreground">
                              {result.description}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {i < groupedResults.length - 1 && <CommandSeparator />}
                </React.Fragment>
              ))}
            </CommandList>
          )}

          {!searchQuery && (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Type to search across devices, groups, and documentation
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveCategory("devices")}
                >
                  Devices
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveCategory("groups")}
                >
                  Groups
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveCategory("documentation")}
                >
                  Documentation
                </Button>
                {activeCategory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveCategory(null)}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ConsoleBarSearch;
