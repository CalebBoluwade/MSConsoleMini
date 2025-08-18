"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const Documentation = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Documentation</h1>
      
      <Tabs defaultValue="getting-started" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="color-guide">Color Guide</TabsTrigger>
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
                    MS Console Mini is a powerful monitoring and management system that helps you keep track of your services,
                    agents, and system resources in real-time.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">Navigation</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Console:</strong> Real-time monitoring dashboard</li>
                    <li><strong>Services:</strong> Manage and monitor your services</li>
                    <li><strong>Monitor Groups:</strong> Organize services into logical groups</li>
                    <li><strong>Integrations:</strong> Configure third-party integrations</li>
                    <li><strong>Plugin Marketplace:</strong> Browse and install monitoring plugins</li>
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

        <TabsContent value="color-guide">
          <Card className="p-6">
            <ScrollArea className="h-[600px] w-full pr-4">
              <h2 className="text-2xl font-semibold mb-4">Color Guide</h2>
              
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-2">Status Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-green-500"></div>
                      <span className="text-muted-foreground">Healthy/Online</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-red-500"></div>
                      <span className="text-muted-foreground">Error/Offline</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
                      <span className="text-muted-foreground">Warning</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gray-500"></div>
                      <span className="text-muted-foreground">Unknown/Inactive</span>
                    </div>
                  </div>
                </section>

                <Separator className="my-4" />

                <section>
                  <h3 className="text-xl font-semibold mb-2">Chart Colors</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-blue-500"></div>
                      <span className="text-muted-foreground">CPU Usage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-purple-500"></div>
                      <span className="text-muted-foreground">Memory Usage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-orange-500"></div>
                      <span className="text-muted-foreground">Disk Usage</span>
                    </div>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card className="p-6">
            <ScrollArea className="h-[600px] w-full pr-4">
              <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <section className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">How do I add a new service to monitor?</h3>
                    <p className="text-muted-foreground">
                      Navigate to the Services page and click the &#34;Add Service&#34; button. Fill in the required information
                      about your service, including the endpoint and monitoring parameters.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">What are Monitor Groups?</h3>
                    <p className="text-muted-foreground">
                      Monitor Groups allow you to organize related services together for easier management and monitoring.
                      You can create groups based on environment, application type, or any other logical grouping.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">How do I set up alerts?</h3>
                    <p className="text-muted-foreground">
                      You can configure alerts in the Alert Rule Management section. Define thresholds for various metrics
                      and specify notification channels like email or webhooks.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">Can I extend the monitoring capabilities?</h3>
                    <p className="text-muted-foreground">
                      Yes! Visit the Plugin Marketplace to browse and install additional monitoring plugins that extend
                      the system&#39;s capabilities. You can also develop custom plugins using our plugin SDK.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">How frequently is monitoring data updated?</h3>
                    <p className="text-muted-foreground">
                      The console updates monitoring data in real-time through WebSocket connections. The specific polling
                      interval can be configured per service or globally in the settings.
                    </p>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
