"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Heart, Target, Zap } from "lucide-react";
import Header from "@/components/Header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Documentation = () => {
  return (
    <div className="">


      <div className="space-x-2 py-8 px-6 space-y-6 w-full">
        <Header
          title="Getting Started"
          subTitle="New to Monitoring Sprit?"
          subTitle2=""
          image="Documentation"
          // ctaButton={
          //   <Button type="button" title="Get Started" href="/installation" />
          // }
        />

        <Card className="p-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2">
              Getting Started
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Learn how to use the MS Console Mini application effectively.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Quick Start Guide</h3>
                <p className="text-muted-foreground">
                  Get started in minutes with our intuitive interface.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Target className="w-6 h-6 text-purple-500" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold">Real-time Monitoring</h3>
                <p className="text-muted-foreground">
                  Track system performance and resource utilization in
                  real-time.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <Heart className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Instant Alerts</h3>
                <p className="text-muted-foreground">
                  Receive notifications for any service issues or anomalies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="getting-started">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started">
            <Card className="p-6">
              <ScrollArea className="h-[600px] w-full pr-4">
                <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-xl font-semibold mb-2">Overview</h3>
                    <p className="text-muted-foreground">
                      MS Console Mini is a powerful monitoring and management
                      system that helps you keep track of your services, agents,
                      and system resources in real-time.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-2">Navigation</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>
                        <strong>Console:</strong> Real-time monitoring dashboard
                      </li>
                      <li>
                        <strong>Services:</strong> Manage and monitor your
                        services
                      </li>
                      <li>
                        <strong>Monitor Groups:</strong> Organize services into
                        logical groups
                      </li>
                      <li>
                        <strong>Integrations:</strong> Configure third-party
                        integrations
                      </li>
                      <li>
                        <strong>Plugin Marketplace:</strong> Browse and install
                        monitoring plugins
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-2">Key Features</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Real-time CPU and resource monitoring</li>
                      <li>Service health tracking</li>
                      <li>Alert management</li>
                      <li>Plugin system for extensibility</li>
                      <li>Monitor grouping for better organization</li>
                    </ul>
                  </section>
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <Card className="p-6">
              <ScrollArea className="h-[600px] w-full pr-4">
                <h2 className="text-2xl font-semibold mb-4">
                  Frequently Asked Questions
                </h2>

                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  defaultValue="item-1"
                >
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      How do I add a new service to monitor?
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      <p>
                        Navigate to the Services page and click the &#34;Add
                        Service&#34; button. Fill in the required information
                        about your service, including the endpoint and
                        monitoring parameters.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger>Color Guide</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-green-500"></div>
                          <span className="text-muted-foreground">
                            Healthy/Online
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-red-500"></div>
                          <span className="text-muted-foreground">
                            Error/Offline
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
                          <span className="text-muted-foreground">Warning</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-500"></div>
                          <span className="text-muted-foreground">
                            Unknown/Inactive
                          </span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      What are Monitor Groups?
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      <p className="text-muted-foreground">
                        Monitor Groups allow you to organize related services
                        together for easier management and monitoring. You can
                        create groups based on environment, application type, or
                        any other logical grouping.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I set up alerts?</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      <p>
                        You can configure alerts in the Alert Rule Management
                        section. Define thresholds for various metrics and
                        specify notification channels like email or webhooks.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>
                      Can I extend the monitoring capabilities?
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      <p>
                        Yes! Visit the Plugin Marketplace to browse and install
                        additional monitoring plugins that extend the
                        system&#39;s capabilities. You can also develop custom
                        plugins using our plugin SDK.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>
                      How frequently is monitoring data updated?
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      <p className="text-muted-foreground">
                        The console updates monitoring data in real-time through
                        WebSocket connections. The specific polling interval can
                        be configured per service or globally in the settings.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Documentation;
