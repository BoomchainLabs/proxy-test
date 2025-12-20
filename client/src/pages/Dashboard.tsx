import { useState } from "react";
import { useProxyRoutes } from "@/hooks/use-proxy-routes";
import { RouteCard } from "@/components/RouteCard";
import { RouteForm } from "@/components/RouteForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Server } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: routes, isLoading, error } = useProxyRoutes();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredRoutes = routes?.filter(route => 
    route.name.toLowerCase().includes(search.toLowerCase()) ||
    route.pathPrefix.toLowerCase().includes(search.toLowerCase()) ||
    route.targetUrl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Server className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">HTTP Proxy Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">v3.0.0</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Routes</h2>
            <p className="text-muted-foreground mt-1">Manage your reverse proxy configurations and endpoints.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                <Plus className="mr-2 h-5 w-5" />
                Add New Route
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Proxy Route</DialogTitle>
                <DialogDescription>
                  Configure a new endpoint to forward traffic to an upstream service.
                </DialogDescription>
              </DialogHeader>
              <RouteForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 animate-fade-in delay-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search routes by name, path, or target..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors rounded-xl"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in delay-200">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-10 rounded-full" />
                  </div>
                  <div className="space-y-3 pt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center max-w-lg mx-auto mt-12">
              <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load routes</h3>
              <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry Connection</Button>
            </div>
          ) : filteredRoutes?.length === 0 ? (
            <div className="text-center py-24 bg-muted/20 border-2 border-dashed border-border/60 rounded-2xl">
              <div className="bg-muted/40 p-4 rounded-full w-fit mx-auto mb-4">
                <Network className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No routes found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                {search ? "Try adjusting your search terms." : "Get started by creating your first proxy route."}
              </p>
              {!search && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  Create Route
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes?.map((route, idx) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 + 0.2 }}
                >
                  <RouteCard route={route} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
