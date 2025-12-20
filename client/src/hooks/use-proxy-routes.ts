import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertProxyRoute, ProxyRoute } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useProxyRoutes() {
  return useQuery({
    queryKey: [api.proxyRoutes.list.path],
    queryFn: async () => {
      const res = await fetch(api.proxyRoutes.list.path);
      if (!res.ok) throw new Error("Failed to fetch routes");
      return api.proxyRoutes.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateProxyRoute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertProxyRoute) => {
      const validated = api.proxyRoutes.create.input.parse(data);
      const res = await fetch(api.proxyRoutes.create.path, {
        method: api.proxyRoutes.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.proxyRoutes.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Failed to create route');
      }
      return api.proxyRoutes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.proxyRoutes.list.path] });
      toast({
        title: "Route created",
        description: "Your new proxy route is active.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProxyRoute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.proxyRoutes.delete.path, { id });
      const res = await fetch(url, { method: api.proxyRoutes.delete.method });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error('Route not found');
        throw new Error('Failed to delete route');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.proxyRoutes.list.path] });
      toast({
        title: "Route deleted",
        description: "The proxy route has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useToggleProxyRoute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      const url = buildUrl(api.proxyRoutes.toggle.path, { id });
      const res = await fetch(url, {
        method: api.proxyRoutes.toggle.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error('Route not found');
        throw new Error('Failed to update status');
      }
      return api.proxyRoutes.toggle.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.proxyRoutes.list.path] });
      toast({
        title: data.enabled ? "Route enabled" : "Route disabled",
        description: `Traffic will ${data.enabled ? "now" : "no longer"} be proxied.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
