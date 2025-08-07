"use client";

import React, { useLayoutEffect, useState } from "react";
import { Orbitron } from "next/font/google";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  Blocks,
  ChevronLeft,
  Cog,
  Group,
  LayoutDashboard,
  LogOut,
  Menu,
  Navigation,
  ServerCrash,
  Settings,
  SquaresIntersect,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import SelectDateTimeRange from "./SelectDayTime";
import { ThemeToggle } from "./ThemeSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ConsoleBarSearch from "./ConsoleBarSearch";
import { Dialog, DialogTitle, DialogContent, DialogTrigger } from "./ui/dialog";
import { getCurrentPageHeader } from "@/lib/config/site-map";
import Link from "next/link";
import { useGetAllMonitorsQuery } from "@/lib/helpers/api/MonitorService";

const orbitron = Orbitron({ subsets: ["latin"] });
const ConsoleBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: monitors, isLoading: isMonitorsLoading } =
    useGetAllMonitorsQuery();

  const [serviceMonitors] = useState<BaseMonitor[]>(monitors ?? []);

  function addZero(i: number) {
    let y;
    if (i < 10) {
      y = "0" + i;
    } else {
      return i;
    }
    return y;
  }

  useLayoutEffect(() => {
    const x = document.getElementById("timer")!;

    const timer = setInterval(() => {
      const d = new Date();
      const h = d.getHours();
      const m = d.getMinutes();
      const s = d.getSeconds();

      x.innerText = `${addZero(h)}:${addZero(m)}:${addZero(s)}`;
    }, 1005);

    return () => clearInterval(timer);
  }, []);

  // Logger.info(navigator.onLine);
  // absolute right-5 left-[5.9rem]

  return (
    <header className="fixed top-0 right-0 left-0 flex flex-row items-center px-5 py-1 justify-between transition-all shadow-md dark:bg-dark-tremor-brand-faint/35 backdrop-blur-sm bg-opacity-70">
      <div className="items-center inline-flex gap-3 font-bold">
        {!sideMenuOpen ? <ChevronLeft onClick={() => router.back()} /> : <></>}

        {/* <SidebarTrigger> */}
        <Menu onClick={() => setSideMenuOpen(!sideMenuOpen)} />
        {/* </SidebarTrigger> */}

        <p className="text-md capitalize">{getCurrentPageHeader(pathname)}</p>
        <ConsoleBarSearch
          isLoading={isMonitorsLoading}
          placeholder="Console Search"
          devices={serviceMonitors}
          // groups={async () => await db.getAllGroups()}
        />
      </div>

      <div className="flex flex-row items-center gap-3">
        <div className="w-28 font-extrabold text-lg tracking-wider text-right">
          <time
            dateTime="df"
            id="timer"
            className={`font-bold ${orbitron.className}`}
          ></time>
        </div>

        <SelectDateTimeRange />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              // onClick={() => setIsDialogOpen(true)}
            >
              <Navigation size={24} strokeWidth={1.5} /> Navigator
            </Button>
          </DialogTrigger>
          <DialogContent
            // side="bottom"
            // align="end"
            className="grid grid-cols-2 flex-wrap"
          >
            <DialogTitle className="mr-4 mb-3 pt-3 text-center flex items-center justify-center gap-2">
              <Navigation size={24} strokeWidth={1.5} />
              Navigator
            </DialogTitle>
            <Link
              href={"/"}
              className="cursor-pointer p-2 inline-flex gap-2 items-center hover:bg-muted rounded"
            >
              <LayoutDashboard size={28} className="mr-2" />
              <span>Real-Time Monitoring</span>
            </Link>
            <Link
              href={"/console/groups"}
              className="cursor-pointer p-2 inline-flex gap-2 items-center hover:bg-muted rounded"
            >
              <Group size={28} className="mr-2" />
              <span>Monitor Groups</span>
            </Link>
            <Link
              href={"/console/monitors"}
              className="cursor-pointer p-2 inline-flex gap-2 items-center hover:bg-muted rounded"
            >
              <ServerCrash size={28} className="mr-2" />
              <span>Manage Service Inventory</span>
            </Link>
            <Link
              href={"/console/plugins"}
              className="cursor-pointer p-2 inline-flex gap-2 items-center hover:bg-muted rounded"
            >
              <Blocks size={28} className="mr-2" />
              <span>Plugin MarketPlace</span>
            </Link>
            <Link
              href={"/console/integrations"}
              className="cursor-pointer p-2 inline-flex gap-2 items-center hover:bg-muted rounded"
            >
              <SquaresIntersect size={28} className="mr-2" />
              <span>Integrations</span>
            </Link>
            <Link
              href={"/"}
              className="cursor-pointer p-2 inline-flex gap-2 items-center hover:bg-muted rounded"
            >
              <Cog size={28} className="mr-2" />
              <span>Settings</span>
            </Link>
          </DialogContent>
        </Dialog>

        <ThemeToggle />

        <div className="relative flex items-center gap-3 p-2 cursor-pointer hover:bg-muted">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-6 w-6">
                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                <AvatarFallback>CB</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Sheet>
          <SheetTrigger>
            <Bell size={24} strokeWidth={1.5} />

            {/* {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )} */}
          </SheetTrigger>
          <SheetContent
            side="right"
            className="max-md:w-[600px] sm:w-[80%] overflow-y-scroll"
          >
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default ConsoleBar;
