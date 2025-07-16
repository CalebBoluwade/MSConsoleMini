import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment";
import { Timer } from "lucide-react";
import { useState } from "react";

export default function SelectDateTimeRange() {
  const [timeRange, setTimeRange] = useState("30m");

  const searchParams = useSearchParams();
  const router = useRouter();

  const paramsObject = Object.fromEntries(searchParams.entries());
  console.log(paramsObject);

  const setTimeTravel = (selectedDateTime: string) => {
    let daysToSubtract: number = moment().subtract(30, "minutes").unix();
    if (timeRange === "30m") {
      daysToSubtract = moment().subtract(30, "minutes").unix();
    } else if (timeRange === "1h") {
      daysToSubtract = moment().subtract(1, "hour").unix();
    } else if (timeRange === "2h") {
      daysToSubtract = moment().subtract(2, "hour").unix();
    } else if (timeRange === "12h") {
      daysToSubtract = moment().subtract(12, "hour").unix();
    } else if (timeRange === "today") {
      daysToSubtract = moment().subtract(1, "day").unix();
    } else {
      daysToSubtract = moment().subtract(30, "minutes").unix();
    }

    setTimeRange(selectedDateTime);
    console.log(daysToSubtract, selectedDateTime);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);

      url.searchParams.set("lookup", daysToSubtract.toString());
      router.replace(url.href, { scroll: false });
    }
  };

  return (
    //   <DateRangePicker
    //   className="my-3"
    //   placeholder="Select Time Period Range"
    //   onValueChange={(v) => console.log(v)}
    // />
    <Select
      value={timeRange}
      onValueChange={(selectedDateTime: string) => setTimeTravel(selectedDateTime)}
      // className="rounded-lg sm:ml-auto"
    >
      <SelectTrigger
        className="w-[165px] text-sm"
        aria-placeholder="Select a Value"
        aria-label="Select a Value"
      >
        <Timer size={12} className="--py-2" />
        <SelectValue className="text-sm" placeholder="Select Time Range" />
      </SelectTrigger>

      <SelectContent className="rounded-xl">
        <SelectGroup>
          <SelectItem className="rounded-lg text-md font-semibold" value="30m">
            Last 30 Minutes
          </SelectItem>
          <SelectItem className="rounded-lg text-md font-semibold" value="1h">
            Last 1 Hour
          </SelectItem>
          <SelectItem className="rounded-lg text-md font-semibold" value="2h">
            Last 2 Hours
          </SelectItem>
          <SelectItem className="rounded-lg text-md font-semibold" value="12h">
            Last 12 Hours
          </SelectItem>
          <SelectItem className="rounded-lg text-md font-semibold" value="1d">
            Today
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
