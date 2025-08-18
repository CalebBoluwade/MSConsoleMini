"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, CommandInput } from "@/components/ui/command";
import { motion } from "framer-motion";
import { ChevronRight, Heart, Zap, Shield, Clock, Target, Wrench, HelpCircle, BookOpen, Palette } from "lucide-react";

type FAQItem = {
  id: string;
  q: string;
  a: string;
};

const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-8 space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
          >
            Documentation
          </motion.h1>
          <p className="text-muted-foreground mt-2">Everything you need to know about MS Console Mini</p>
        </div>
        <Command className="w-[200px]">
          <CommandInput 
            placeholder="Search docs..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
        </Command>
      </div>
      
      <Tabs defaultValue="getting-started" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="getting-started" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Getting Started
          </TabsTrigger>
          <TabsTrigger value="color-guide" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Color Guide
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started">
          <Card className="p-8">
            <ScrollArea className="h-[600px] w-full pr-4">
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-8"
              >
                <motion.section variants={item}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Zap className="w-6 h-6 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-semibold">Quick Start Guide</h2>
                  </div>
                  <div className="ml-11 space-y-4">
                    <p className="text-muted-foreground">
                      MS Console Mini is your command center for monitoring and managing system resources
                      in real-time. Get started in minutes with our intuitive interface.
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="default">Real-time Monitoring</Badge>
                      <Badge variant="default">Resource Management</Badge>
                      <Badge variant="default">Instant Alerts</Badge>
                    </div>
                  </div>
                </motion.section>

                <motion.section variants={item}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <Target className="w-6 h-6 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-semibold">Key Features</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                    <Card className="p-4 hover:shadow-lg transition-shadow">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Real-time Monitoring
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Track CPU, memory, and disk usage with millisecond precision
                      </p>
                    </Card>
                    <Card className="p-4 hover:shadow-lg transition-shadow">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Alert Management
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Set up custom alerts and get notified when metrics cross thresholds
                      </p>
                    </Card>
                    <Card className="p-4 hover:shadow-lg transition-shadow">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Plugin System
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Extend functionality with our powerful plugin ecosystem
                      </p>
                    </Card>
                    <Card className="p-4 hover:shadow-lg transition-shadow">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Health Tracking
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Monitor service health and performance metrics
                      </p>
                    </Card>
                  </div>
                </motion.section>

                <Separator className="my-8" />

                <motion.section variants={item}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                      <ChevronRight className="w-6 h-6 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-semibold">Next Steps</h2>
                  </div>
                  <div className="ml-11 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-auto py-4 px-6 flex flex-col items-center gap-2">
                        <span className="font-semibold">Add Services</span>
                        <span className="text-sm text-muted-foreground text-center">Start monitoring your first service</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 px-6 flex flex-col items-center gap-2">
                        <span className="font-semibold">Configure Alerts</span>
                        <span className="text-sm text-muted-foreground text-center">Set up your notification preferences</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 px-6 flex flex-col items-center gap-2">
                        <span className="font-semibold">Explore Plugins</span>
                        <span className="text-sm text-muted-foreground text-center">Enhance your monitoring capabilities</span>
                      </Button>
                    </div>
                  </div>
                </motion.section>
              </motion.div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="color-guide">
          <Card className="p-8">
            <ScrollArea className="h-[600px] w-full pr-4">
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-8"
              >
                <motion.section variants={item}>
                  <h2 className="text-2xl font-semibold mb-6">Status Colors & Meanings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 border-l-4 border-l-green-500">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 animate-pulse"></div>
                        <div>
                          <h3 className="font-semibold">Healthy/Online</h3>
                          <p className="text-sm text-muted-foreground">System is functioning normally</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6 border-l-4 border-l-red-500">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500 animate-pulse"></div>
                        <div>
                          <h3 className="font-semibold">Error/Offline</h3>
                          <p className="text-sm text-muted-foreground">Critical issue detected</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6 border-l-4 border-l-yellow-500">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 animate-pulse"></div>
                        <div>
                          <h3 className="font-semibold">Warning</h3>
                          <p className="text-sm text-muted-foreground">Potential issues detected</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6 border-l-4 border-l-gray-500">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-500"></div>
                        <div>
                          <h3 className="font-semibold">Inactive</h3>
                          <p className="text-sm text-muted-foreground">Service is not being monitored</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.section>

                <Separator className="my-8" />

                <motion.section variants={item}>
                  <h2 className="text-2xl font-semibold mb-6">Metric Visualizations</h2>
                  <div className="space-y-4">
                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Resource Usage Colors</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-full h-4 bg-gradient-to-r from-blue-200 to-blue-600 rounded"></div>
                          <span className="text-sm text-muted-foreground">CPU</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-full h-4 bg-gradient-to-r from-purple-200 to-purple-600 rounded"></div>
                          <span className="text-sm text-muted-foreground">Memory</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-full h-4 bg-gradient-to-r from-orange-200 to-orange-600 rounded"></div>
                          <span className="text-sm text-muted-foreground">Disk</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.section>
              </motion.div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card className="p-8">
            <ScrollArea className="h-[600px] w-full pr-4">
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {[
                  {
                    id: "service",
                    q: "How do I add a new service to monitor?",
                    a: "Navigate to the Services page and click the &apos;Add Service&apos; button. Fill in the required information about your service, including the endpoint and monitoring parameters."
                  },
                  {
                    id: "groups",
                    q: "What are Monitor Groups?",
                    a: "Monitor Groups allow you to organize related services together for easier management and monitoring. You can create groups based on environment, application type, or any other logical grouping."
                  },
                  {
                    id: "alerts",
                    q: "How do I set up alerts?",
                    a: "Configure alerts in the Alert Rule Management section. Define thresholds for various metrics and specify notification channels like email or webhooks."
                  },
                  {
                    id: "plugins",
                    q: "Can I extend the monitoring capabilities?",
                    a: "Yes! Visit the Plugin Marketplace to browse and install additional monitoring plugins that extend the system&apos;s capabilities. You can also develop custom plugins using our plugin SDK."
                  },
                  {
                    id: "updates",
                    q: "How frequently is monitoring data updated?",
                    a: "The console updates monitoring data in real-time through WebSocket connections. The specific polling interval can be configured per service or globally in the settings."
                  }
                ].filter((item: FAQItem) => 
                  searchQuery === "" || 
                  item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.a.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((item: FAQItem) => (
                  <motion.div key={item.id} variants={item} animate="show" className="group">
                    <Card className="p-6 hover:shadow-lg transition-all">
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-500 transition-colors">{item.q}</h3>
                      <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: item.a }}></p>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Documentation;
