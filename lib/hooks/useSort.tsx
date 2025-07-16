import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusRanking } from "../helpers/utils";

const SortIcon = {
  none: ArrowUpDown,
  asc: ArrowUp,
  desc: ArrowDown,
};

type SortDirection = "none" | "asc" | "desc";
type SortField =
  | "CurrentHealthCheck"
  | "ServiceName"
  | "IPAddress"
  | "CreatedAt";

const useSort = ({
  data,
  debouncedSearchTerm,
  healthFilter,
}: {
  data: BaseMonitor[];
  debouncedSearchTerm: string;
  healthFilter: string;
}) => {
  // Sorting state
  const [sortField, setSortField] = useState<SortField>("ServiceName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through sort directions: asc -> desc -> none -> asc
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortDirection("none");
        setSortField("ServiceName"); // Reset to default sort
      } else setSortDirection("asc");
    } else {
      // New field selected, start with ascending sort
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Helper to render sort icon
  const renderSortIcon = (field: SortField) => {
    const Icon =
      sortField === field ? SortIcon[sortDirection] : SortIcon["none"];
    return (
      <Icon
        className={`ml-1 h-4 w-4 ${
          sortField === field ? "opacity-100" : "opacity-40"
        }`}
      />
    );
  };

  const filtered = useMemo(() => {
    let filtered = data.filter(
      (device) =>
        // Debounced search filter
        (debouncedSearchTerm === "" ||
          device.ServiceName.toLowerCase().includes(
            debouncedSearchTerm.toLowerCase()
          ) ||
          device.IPAddress.includes(debouncedSearchTerm) ||
          device.Device
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())) &&
        // Health filter
        (healthFilter === "All" || device.CurrentHealthCheck === healthFilter)
    );

      // Then sort them if a sort direction is specified
    if (sortDirection !== "none") {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;

        // Sort based on the selected field
        switch (sortField) {
          case "CurrentHealthCheck":
            comparison =
              StatusRanking[a.CurrentHealthCheck as StatusText] -
              StatusRanking[b.CurrentHealthCheck as StatusText];
            break;
          case "ServiceName":
          case "IPAddress":
            comparison = a[sortField].localeCompare(b[sortField]);
            break;
        //   case "responseTime":
        //   case "cpuUtilization":
        //   case "memoryUtilization":
        //     comparison = (a[sortField] ?? 0) - (b[sortField] ?? 0);
        //     break;
        }

        // Reverse for descending sort
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, debouncedSearchTerm, healthFilter, sortField, sortDirection]);

  return { filtered, renderSortIcon, handleSort };
};

export default useSort;
