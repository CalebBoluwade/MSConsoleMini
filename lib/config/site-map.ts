import { Metadata } from "next";

export enum PageNameEnum {
  HOME = "HOME",
  CONSOLE = "CONSOLE",
  SERVICE_TRACKER = "SERVICE_TRACKER",
  SERVICE_MONITOR = "SERVICE_MONITOR",
  OBSERVABILITY = "OBSERVABILITY",
  ALERTS = "ALERTS",
  SETTINGS = "SETTINGS",
  DOCUMENTATION = "DOCUMENTATION",
  GROUPS = "GROUPS",
  INTEGRATIONS = "INTEGRATIONS",
  PLUGINS = "PLUGINS",
  RULES = "RULES",
}

type PageMap = {
  [key in PageNameEnum]: {
    metadata: Metadata;
    path: string;
    header?: string | ((params?: object) => string);
  };
};

export const SITE_MAP: PageMap = {
  [PageNameEnum.HOME]: {
    metadata: {
      title: "MS | APM | Observability",
      description: "Automation & Monitoring for the Future.",
    },
    path: "/",
    header: "Service Board",
  },
  [PageNameEnum.CONSOLE]: {
    metadata: {
      title: "Dashboard | MS APM",
      description: "Overview of your monitoring metrics and analytics.",
    },
    path: "/console",
    header: "Observability",
  },
  [PageNameEnum.SERVICE_TRACKER]: {
    metadata: {
      title: "Service Tracker | MS APM",
      description: "Track the status and performance of your services.",
    },
    path: "/console/monitors/services",
    header: "Service Tracker",
  },
  [PageNameEnum.SERVICE_MONITOR]: {
    metadata: {
      title: "Service Tracker | MS APM",
      description: "Manage Services.",
    },
    path: "/console/monitors",
    header: "Service Tracker",
  },
  [PageNameEnum.OBSERVABILITY]: {
    metadata: {
      title: "Observability | MS APM",
      description: "Full-stack observability for your applications.",
    },
    path: "/observability",
  },
  [PageNameEnum.ALERTS]: {
    metadata: {
      title: "Alerts | MS APM",
      description: "Configure and manage your alerting systems.",
    },
    path: "/alerts",
  },
  [PageNameEnum.SETTINGS]: {
    metadata: {
      title: "Settings | MS APM",
      description: "Configure your account and application preferences.",
    },
    path: "/settings",
  },
  [PageNameEnum.DOCUMENTATION]: {
    metadata: {
      title: "Documentation | MS APM",
      description:
        "Learn how to use the MS Console Mini application effectively.",
    },
    path: "/docs",
    header: "Documentation",
  },
  [PageNameEnum.GROUPS]: {
    metadata: {
      title: "Groups | MS APM",
      description: "Manage monitoring groups and device collections.",
    },
    path: "/console/groups",
    header: "Groups",
  },
  [PageNameEnum.INTEGRATIONS]: {
    metadata: {
      title: "Integrations | MS APM",
      description: "Configure third-party integrations and connections.",
    },
    path: "/console/integrations",
    header: "Integrations",
  },
  [PageNameEnum.PLUGINS]: {
    metadata: {
      title: "Plugins | MS APM",
      description: "Manage monitoring plugins and extensions.",
    },
    path: "/console/plugins",
    header: "Plugins",
  },
    [PageNameEnum.RULES]: {
    metadata: {
      title: "Rules | MS APM",
      description: "Manage monitoring rules.",
    },
    path: "/console/rules",
    header: "Plugins",
  },
};

// Utility function to get metadata for a page
export const getPageMetadata = (pageKey: PageNameEnum): Metadata => {
  return SITE_MAP[pageKey].metadata;
};

// Utility function to get path for a page
export const getPagePath = (pageKey: PageNameEnum): string => {
  return SITE_MAP[pageKey].path;
};

export const getCurrentPageConfig = (pathname: string) => {
  return Object.values(SITE_MAP).find((config) => {
    // Handle dynamic routes
    if (config.path.includes("[")) {
      const pathRegex = new RegExp(
        `^${config.path.replace(/\[.*?\]/g, "([^/]+)")}$`
      );
      return pathRegex.test(pathname);
    }
    return config.path === pathname;
  });
};

// Utility function to get page header
export const getPageHeader = (
  pageKey: PageNameEnum,
  params?: object
): string => {
  const header = SITE_MAP[pageKey]?.header;

  if (!header) return "";

  return typeof header === "function" ? header(params) : header;
};

export const getCurrentPageHeader = (
  pathname: string,
  params?: object
): string => {
  const pageConfig = getCurrentPageConfig(pathname);
  if (!pageConfig?.header) return "";

  return typeof pageConfig.header === "function"
    ? pageConfig.header(params)
    : pageConfig.header;
};
