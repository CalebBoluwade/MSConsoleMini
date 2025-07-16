import { Metadata } from "next";

type PageMap = {
  [key: string]: {
    metadata: Metadata;
    path: string;
     header?: string | ((params?: object) => string); // Added header support
  };
};

export const SITE_MAP: PageMap = {
  HOME: {
    metadata: {
      title: "MS | APM | Observability",
      description: "Automation & Monitoring for the Future.",
    },
    path: "/",
    header: "Service Board",
  },
  CONSOLE: {
    metadata: {
      title: "Dashboard | MS APM",
      description: "Overview of your monitoring metrics and analytics.",
    },
    path: "/console",
    header: "Observability"
  },
  OBSERVABILITY: {
    metadata: {
      title: "Observability | MS APM",
      description: "Full-stack observability for your applications.",
    },
    path: "/observability",
  },
  ALERTS: {
    metadata: {
      title: "Alerts | MS APM",
      description: "Configure and manage your alerting systems.",
    },
    path: "/alerts",
  },
  SETTINGS: {
    metadata: {
      title: "Settings | MS APM",
      description: "Configure your account and application preferences.",
    },
    path: "/settings",
  },
  // Add more pages as needed
};

// Utility function to get metadata for a page
export const getPageMetadata = (pageKey: keyof typeof SITE_MAP): Metadata => {
  return SITE_MAP[pageKey].metadata;
};

// Utility function to get path for a page
export const getPagePath = (pageKey: keyof typeof SITE_MAP): string => {
  return SITE_MAP[pageKey].path;
};

export const getCurrentPageConfig = (pathname: string) => {
  return Object.values(SITE_MAP).find(
    (config) => {
      // Handle dynamic routes
      if (config.path.includes('[')) {
        const pathRegex = new RegExp(
          `^${config.path.replace(/\[.*?\]/g, '([^/]+)')}$`
        );
        return pathRegex.test(pathname);
      }
      return config.path === pathname;
    }
  );
};

// Utility function to get page header
export const getPageHeader = (
  pageKey: keyof typeof SITE_MAP, 
  params?: object
): string => {
    console.log(pageKey)
  const header = SITE_MAP[pageKey]?.header;
  
  if (!header) return "";
  
  return typeof header === 'function' 
    ? header(params) 
    : header;
};

export const getCurrentPageHeader = (pathname: string, params?: object): string => {
  const pageConfig = getCurrentPageConfig(pathname);
  if (!pageConfig?.header) return "";
  
  return typeof pageConfig.header === 'function'
    ? pageConfig.header(params)
    : pageConfig.header;
};
