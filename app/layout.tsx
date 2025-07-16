import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "styles/input.css";
import "styles/monitoring.css";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { SITE_MAP } from "@/lib/config/site-map";
import { Suspense } from "react";

const jetBrains_Mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  preload: true,
});

export const metadata = SITE_MAP.HOME.metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetBrains_Mono.className} antialiased`}>
        {/* <SidebarProvider> */}
          <Suspense>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </Suspense>
        {/* </SidebarProvider> */}
      </body>
    </html>
  );
}
