import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProxyRouteSchema, type InsertProxyRoute } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProxyRoute } from "@/hooks/use-proxy-routes";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface RouteFormProps {
  onSuccess?: () => void;
}

export function RouteForm({ onSuccess }: RouteFormProps) {
  const { mutate, isPending } = useCreateProxyRoute();
  
  const form = useForm<InsertProxyRoute>({
    resolver: zodResolver(insertProxyRouteSchema),
    defaultValues: {
      name: "",
      pathPrefix: "/",
      targetUrl: "http://localhost:3000",
      enabled: true,
    },
  });

  const onSubmit = (data: InsertProxyRoute) => {
    mutate(data, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Route Name</Label>
        <Input 
          id="name" 
          placeholder="My API Service" 
          {...form.register("name")}
          className="focus-visible:ring-primary"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pathPrefix">Path Prefix</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground font-mono text-sm">/</span>
            <Input 
              id="pathPrefix" 
              placeholder="api/v1" 
              {...form.register("pathPrefix")} 
              className="pl-6 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground">Incoming requests starting with this path</p>
          {form.formState.errors.pathPrefix && (
            <p className="text-sm text-destructive">{form.formState.errors.pathPrefix.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetUrl">Target URL</Label>
          <Input 
            id="targetUrl" 
            placeholder="http://localhost:8080" 
            {...form.register("targetUrl")} 
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">Where to forward the request</p>
          {form.formState.errors.targetUrl && (
            <p className="text-sm text-destructive">{form.formState.errors.targetUrl.message}</p>
          )}
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md transition-all hover:translate-y-[-1px]"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Creating Route..." : "Create Route"}
        </Button>
      </DialogFooter>
    </form>
  );
}
