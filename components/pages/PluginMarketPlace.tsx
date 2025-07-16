import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Star, Download, Zap, Shield, Palette, Code, Database, Globe, Settings } from 'lucide-react';

// Plugin data type
interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  rating: number;
  downloads: string;
  author: string;
  featured: boolean;
  tags: string[];
}

// Mock plugin data
const plugins: Plugin[] = [
  {
    id: '1',
    name: 'Authentication Pro',
    description: 'Advanced authentication system with OAuth, 2FA, and custom providers',
    category: 'Security',
    icon: <Shield className="w-6 h-6" />,
    rating: 4.8,
    downloads: '15.2k',
    author: 'SecureAuth',
    featured: true,
    tags: ['auth', 'security', 'oauth']
  },
  {
    id: '2',
    name: 'UI Components Plus',
    description: 'Premium component library with 200+ customizable components',
    category: 'Design',
    icon: <Palette className="w-6 h-6" />,
    rating: 4.9,
    downloads: '32.1k',
    author: 'DesignCorp',
    featured: true,
    tags: ['components', 'ui', 'design']
  },
  {
    id: '3',
    name: 'Code Generator',
    description: 'Generate boilerplate code, APIs, and database schemas automatically',
    category: 'Development',
    icon: <Code className="w-6 h-6" />,
    rating: 4.7,
    downloads: '8.7k',
    author: 'DevTools',
    featured: false,
    tags: ['generator', 'api', 'productivity']
  },
  {
    id: '4',
    name: 'Database Manager',
    description: 'Visual database management with migrations and query builder',
    category: 'Database',
    icon: <Database className="w-6 h-6" />,
    rating: 4.6,
    downloads: '12.3k',
    author: 'DataSoft',
    featured: false,
    tags: ['database', 'migration', 'query']
  },
  {
    id: '5',
    name: 'Analytics Dashboard',
    description: 'Real-time analytics with custom charts and reporting',
    category: 'Analytics',
    icon: <Zap className="w-6 h-6" />,
    rating: 4.8,
    downloads: '19.5k',
    author: 'AnalyticsPro',
    featured: true,
    tags: ['analytics', 'charts', 'reporting']
  },
  {
    id: '6',
    name: 'SEO Optimizer',
    description: 'Complete SEO toolkit with meta management and sitemap generation',
    category: 'Marketing',
    icon: <Globe className="w-6 h-6" />,
    rating: 4.5,
    downloads: '6.8k',
    author: 'SEOTools',
    featured: false,
    tags: ['seo', 'meta', 'sitemap']
  }
];

// Zod schema for form validation
const formSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(50, 'Project name must be less than 50 characters'),
  plugins: z.array(z.string()).min(1, 'At least one plugin must be selected'),
  budget: z.number().min(0, 'Budget must be positive'),
  description: z.string().optional(),
subscription: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function PluginMarketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSheetOpen, setIsSheetOpen] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      plugins: [],
      budget: 0,
      description: ''
    }
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const selectedPlugins = watch('plugins');

  // Filter plugins based on search and category
  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(plugins.map(p => p.category)))];

  const handlePluginToggle = (pluginId: string) => {
    const current = selectedPlugins || [];
    const updated = current.includes(pluginId)
      ? current.filter(id => id !== pluginId)
      : [...current, pluginId];
    setValue('plugins', updated);
  };

//   const calculateTotalCost = () => {
//     return selectedPlugins.reduce((total, pluginId) => {
//       const plugin = plugins.find(p => p.id === pluginId);
//       return total + (plugin ? parseInt(plugin.price.replace('$', '')) : 0);
//     }, 0);
//   };

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    console.log('Selected plugins:', selectedPlugins.map(id => plugins.find(p => p.id === id)?.name));
    setIsSheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Plugin Marketplace
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover and integrate powerful plugins to supercharge your Next.js projects
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search plugins..."
                className="pl-10 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8">
                  <Settings className="w-5 h-5 mr-2" />
                  Configure Project
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Configure Your Project</SheetTitle>
                  <SheetDescription>
                    Set up your project details and select plugins
                  </SheetDescription>
                </SheetHeader>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Project Name</label>
                    <Input
                      {...register('projectName')}
                      placeholder="Enter project name"
                      className={errors.projectName ? 'border-red-500' : ''}
                    />
                    {errors.projectName && (
                      <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Budget ($)</label>
                    <Input
                      type="number"
                      {...register('budget', { valueAsNumber: true })}
                      placeholder="Enter budget"
                      className={errors.budget ? 'border-red-500' : ''}
                    />
                    {errors.budget && (
                      <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                    <textarea
                      {...register('description')}
                      placeholder="Project description"
                      className="w-full p-3 border border-gray-300 rounded-md resize-none h-20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block">Selected Plugins</label>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {plugins.map(plugin => (
                          <div key={plugin.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                            <Checkbox
                              checked={selectedPlugins.includes(plugin.id)}
                              onCheckedChange={() => handlePluginToggle(plugin.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{plugin.name}</p>
                              <p className="text-xs text-gray-500">{plugin.rating}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    {errors.plugins && (
                      <p className="text-red-500 text-sm mt-1">{errors.plugins.message}</p>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Cost:</span>
                      <span className="text-2xl font-bold text-blue-600">${500}</span>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {selectedPlugins.length} plugin{selectedPlugins.length !== 1 ? 's' : ''} selected
                    </div>
                  </div>

                  <SheetFooter>
                    <Button type="submit" className="w-full">
                      Create Project
                    </Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Featured Plugins */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Featured Plugins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plugins.filter(p => p.featured).map(plugin => (
              <Card key={plugin.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                        {plugin.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{plugin.name}</CardTitle>
                        <p className="text-sm text-slate-500">{plugin.author}</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      Featured
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 mb-4 leading-relaxed">
                    {plugin.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plugin.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{plugin.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>{plugin.downloads}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {/* <span className="text-2xl font-bold text-slate-900">{plugin.price}</span> */}
                    <Button 
                      onClick={() => handlePluginToggle(plugin.id)}
                      variant={selectedPlugins.includes(plugin.id) ? "default" : "outline"}
                      className="group-hover:shadow-lg transition-all duration-300"
                    >
                      {selectedPlugins.includes(plugin.id) ? 'Added' : 'Add to Project'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Plugins */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">All Plugins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.map(plugin => (
              <Card key={plugin.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                      {plugin.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      <p className="text-sm text-slate-500">{plugin.author}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 mb-4">
                    {plugin.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plugin.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{plugin.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>{plugin.downloads}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {/* <span className="text-xl font-bold text-slate-900">{plugin.price}</span> */}
                    <Button 
                      onClick={() => handlePluginToggle(plugin.id)}
                      variant={selectedPlugins.includes(plugin.id) ? "default" : "outline"}
                      size="sm"
                    >
                      {selectedPlugins.includes(plugin.id) ? 'Added' : 'Add'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// export default function PluginMarketplace() {
//   const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
//   const [isSheetOpen, setIsSheetOpen] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useForm<FormData>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       plugins: [],
//       subscription: false,
//     },
//   });

//   // Watch the plugins array
//   const selectedPluginsWatch = watch('plugins');

//   // Handle plugin selection
//   const handlePluginSelect = (pluginId: string) => {
//     if (selectedPluginsWatch.includes(pluginId)) {
//       setValue(
//         'plugins',
//         selectedPluginsWatch.filter((id) => id !== pluginId)
//       );
//     } else {
//       setValue('plugins', [...selectedPluginsWatch, pluginId]);
//     }
//   };

//   // Handle form submission
//   const onSubmit = (data: FormData) => {
//     console.log('Selected plugins:', data.plugins);
//     console.log('Subscribe to newsletter:', data.subscription);
//     setIsSheetOpen(false);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex justify-between items-center">
//             <h1 className="text-3xl font-bold text-gray-900">Plugin Marketplace</h1>
//             <div className="flex items-center space-x-4">
//               <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
//                 <SheetTrigger asChild>
//                   <Button variant="default">
//                     Cart ({selectedPluginsWatch.length})
//                   </Button>
//                 </SheetTrigger>
//                 <SheetContent className="w-full sm:max-w-md">
//                   <SheetHeader>
//                     <SheetTitle>Your Selected Plugins</SheetTitle>
//                     <SheetDescription>
//                       Review your selections and enter your email to complete installation
//                     </SheetDescription>
//                   </SheetHeader>
//                   <div className="space-y-4 py-4">
//                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//                       <div className="space-y-3">
//                         {selectedPluginsWatch.length > 0 ? (
//                           selectedPluginsWatch.map((pluginId) => {
//                             const plugin = plugins.find((p) => p.id === pluginId);
//                             return (
//                               <div
//                                 key={pluginId}
//                                 className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
//                               >
//                                 <span className="text-sm font-medium">
//                                   {plugin?.name}
//                                 </span>
                
//                               </div>
//                             );
//                           })
//                         ) : (
//                           <p className="text-sm text-gray-500">
//                             No plugins selected yet
//                           </p>
//                         )}
//                       </div>
//                       <div>
//                         <Input
//                           placeholder="your@email.com"
//                           {...register('projectName')}
//                           className="w-full"
//                         />
//                         {errors.projectName && (
//                           <p className="mt-1 text-sm text-red-600">
//                             {errors.projectName.message}
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <Checkbox
//                           id="subscription"
//                           {...register('subscription')}
//                         />
//                         <label
//                           htmlFor="subscription"
//                           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                         >
//                           Subscribe to our newsletter
//                         </label>
//                       </div>
//                       {errors.plugins && (
//                         <p className="text-sm text-red-600">
//                           {errors.plugins.message}
//                         </p>
//                       )}
//                       <Button type="submit" className="w-full">
//                         Complete Installation
//                       </Button>
//                     </form>
//                   </div>
//                 </SheetContent>
//               </Sheet>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Categories */}
//         <div className="mb-8">
//           <h2 className="text-xl font-semibold mb-4">Categories</h2>
//           <div className="flex flex-wrap gap-2">
//             {['All', 'Analytics', 'UI', 'Performance', 'SEO', 'Developer Tools'].map(
//               (category) => (
//                 <Button key={category} variant="outline">
//                   {category}
//                 </Button>
//               )
//             )}
//           </div>
//         </div>

//         {/* Featured Plugins */}
//         <section className="mb-12">
//           <h2 className="text-xl font-semibold mb-6">Featured Plugins</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {plugins
//               .filter((plugin) => plugin.featured)
//               .map((plugin) => (
//                 <PluginCard
//                   key={plugin.id}
//                   plugin={plugin}
//                   isSelected={selectedPluginsWatch.includes(plugin.id)}
//                   onSelect={handlePluginSelect}
//                 />
//               ))}
//           </div>
//         </section>

//         {/* All Plugins */}
//         <section>
//           <h2 className="text-xl font-semibold mb-6">All Plugins</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {plugins.map((plugin) => (
//               <PluginCard
//                 key={plugin.id}
//                 plugin={plugin}
//                 isSelected={selectedPluginsWatch.includes(plugin.id)}
//                 onSelect={handlePluginSelect}
//               />
//             ))}
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }



// type PluginCardProps = {
//   plugin: {
//     id: string;
//     name: string;
//     description: string;
//     category: string;
//     isFeatured?: boolean;
//   };
//   isSelected: boolean;
//   onSelect: (pluginId: string) => void;
// };

// function PluginCard({ plugin, isSelected, onSelect }: PluginCardProps) {
//   return (
//     <Card
//       className={`hover:shadow-lg transition-shadow ${
//         isSelected ? 'ring-2 ring-primary border-primary' : ''
//       }`}
//     >
//       <CardHeader>
//         <div className="flex justify-between items-start">
//           <CardTitle>{plugin.name}</CardTitle>
//           <Badge variant="outline">{plugin.category}</Badge>
//         </div>
//         {plugin.isFeatured && (
//           <div className="mt-2">
//             <Badge className="bg-green-100 text-green-800">Featured</Badge>
//           </div>
//         )}
//       </CardHeader>
//       <CardContent>
//         <p className="text-sm text-gray-600">{plugin.description}</p>
//       </CardContent>
//       <CardFooter className="flex justify-between items-center">
//         {/* <span className="font-semibold">
//           {plugin.price > 0 ? `$${plugin.price}` : 'Free'}
//         </span> */}
//         <Checkbox
//           checked={isSelected}
//           onCheckedChange={() => onSelect(plugin.id)}
//         />
//       </CardFooter>
//     </Card>
//   );
// }

