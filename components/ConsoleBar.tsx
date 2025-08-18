"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  BellRing,
  Blocks,
  Cog,
  UsersRound,
  LayoutDashboard,
  LogOut,
  Navigation as NavigationIcon,
  ServerCrash,
  Settings,
  Combine,
  WifiOff,
} from "lucide-react";
import { webSocketService } from "@/lib/helpers/service/websocket.service";
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
import useTimer from "@/lib/hooks/useTimer";
import { sanitizeContent } from "@/lib/helpers/utils";
import { toast } from "sonner";

// const orbitron = Orbitron({ subsets: ["latin"] });
const ConsoleBar = () => {
  const pathname = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(webSocketService.isConnected);
  const timer = useTimer();

  const [connectionAttempts] = useState(
    webSocketService.connectionAttempts
  );

  const { data: monitors, isLoading: isMonitorsLoading } =
    useGetAllMonitorsQuery(null, {
      refetchOnMountOrArgChange: true,
    });

  const handleConnectionChange = useCallback(
    (connected: boolean) => {
      setIsConnected(connected);
      if (!connected && connectionAttempts > 4) {
        toast("Dashboard is disconnected. Attempting to reconnect...", {
          action: {
            label: "Reconnect Now",
            onClick: () => webSocketService.handleReconnect(),
          },
          dismissible: false,
          icon: <WifiOff color="red" />,
          duration: 315000,
        });
      }
    },
    [connectionAttempts]
  );

  useEffect(() => {
    const connectionInterval = setInterval(() => {
      setIsConnected(webSocketService.isConnected);
    }, 2000); // Check every 2 seconds instead of 1

    // const unsubscribeConnection = webSocketService.subscribe(
    //   "connectionChange",
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   (data: any) => {
    //     setIsConnected(data.connected);
    //   }
    // );

    return () => {
      clearInterval(connectionInterval);
    };
  }, [handleConnectionChange]);

  const unreadCount = 0;

  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex flex-col md:flex-row items-center px-2 md:px-3 pl-1 py-1 justify-between gap-2 transition-all shadow-md dark:bg-dark-tremor-brand-faint/35 backdrop-blur-sm bg-opacity-70">
      <div className="items-center flex flex-col md:flex-row gap-2 md:gap-3 font-bold w-full md:max-w-[50%]">
        <p className="text-sm md:text-md capitalize whitespace-nowrap">
          {sanitizeContent(getCurrentPageHeader(pathname))}
        </p>
        <div className="w-full max-w-full">
          <ConsoleBarSearch
            isLoading={isMonitorsLoading}
            className="w-full min-w-0"
            placeholder="Console Search"
            devices={monitors ?? []}
            // groups={async () => await db.getAllGroups()}
          />
        </div>
      </div>

      <div className="--w-full flex flex-row justify-evenly items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0">
        <div className="hidden sm:block mx-2 pl-2 font-extrabold text-lg tracking-wider text-right">
          {timer}
        </div>

        <SelectDateTimeRange />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <NavigationIcon size={20} strokeWidth={1.5} className="md:mr-2" />
              <span className="hidden md:inline">Navigator</span>
            </Button>
          </DialogTrigger>
          <DialogContent
            // side="bottom"
            // align="end"
            className="grid grid-cols-2 flex-wrap"
          >
            <DialogTitle className="mr-4 mb-3 pt-3 text-center flex items-center justify-center gap-2">
              <NavigationIcon size={24} strokeWidth={1.5} /> Navigator
            </DialogTitle>
            <Link
              href={"/"}
              onClick={() => setIsDialogOpen(false)}
              className="cursor-pointer p-2 inline-flex gap-2 items-center hover:bg-muted rounded"
            >
              <LayoutDashboard size={28} className="mr-2" />
              <span>Real-Time Monitoring</span>
            </Link>
            <Link
              href={"/console/groups"}
              onClick={() => setIsDialogOpen(false)}
              className="cursor-pointer p-2 inline-flex gap-2 items-center hover:bg-muted rounded"
            >
              <UsersRound size={28} className="mr-2" />
              <span>Monitor Groups</span>
            </Link>
            <Link
              href={"/console/monitors"}
              onClick={() => setIsDialogOpen(false)}
              className="cursor-pointer p-2 inline-flex gap-2 items-center hover:bg-muted rounded"
            >
              <ServerCrash size={28} className="mr-2" />
              <span>Manage Service Inventory</span>
            </Link>
            <Link
              href={"/console/plugins"}
              onClick={() => setIsDialogOpen(false)}
              className="cursor-pointer p-2 inline-flex gap-2 items-center hover:bg-muted rounded"
            >
              <Blocks size={28} className="mr-2" />
              <span>Plugin MarketPlace</span>
            </Link>
            <Link
              href={"/console/integrations"}
              onClick={() => setIsDialogOpen(false)}
              className="cursor-pointer p-2 inline-flex gap-2 items-center hover:bg-muted rounded"
            >
              <Combine size={28} className="mr-2" />
              <span>Integrations</span>
            </Link>
            <Link
              href={"/console/alerts"}
              onClick={() => setIsDialogOpen(false)}
              className="cursor-pointer p-2 inline-flex gap-2 items-center hover:bg-muted rounded"
            >
              <BellRing size={28} className="mr-2" />
              <span>Alerts</span>
            </Link>
            <Link
              href={"/"}
              onClick={() => setIsDialogOpen(false)}
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
              <div
                className={`rounded-full p-1 ${
                  isConnected ? "active bg-green-500" : "inactive bg-red-500"
                } transition-colors duration-300`}
              >
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                    alt="Avatar"
                  />
                  <AvatarFallback>CB</AvatarFallback>
                </Avatar>
              </div>
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
            <div className="relative">
              <Bell size={20} strokeWidth={1.5} className="md:w-6 md:h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] md:text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[90vw] md:w-[600px] lg:w-[800px] overflow-y-scroll"
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
