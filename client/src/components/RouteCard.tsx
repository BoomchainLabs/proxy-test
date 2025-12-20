import { ProxyRoute } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useDeleteProxyRoute, useToggleProxyRoute } from "@/hooks/use-proxy-routes";
import { Trash2, ExternalLink, ArrowRight, Network } from "lucide-react";
import { cn } from "@/lib/utils";

interface RouteCardProps {
  route: ProxyRoute;
}

export function RouteCard({ route }: RouteCardProps) {
  const { mutate: deleteRoute, isPending: isDeleting } = useDeleteProxyRoute();
  const { mutate: toggleRoute, isPending: isToggling } = useToggleProxyRoute();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this route?")) {
      deleteRoute(route.id);
    }
  };

  const handleToggle = (checked: boolean) => {
    toggleRoute({ id: route.id, enabled: checked });
  };

  const handleTest = () => {
    window.open(route.pathPrefix, '_blank');
  };

  return (
    <Card className={cn(
      "overflow-hidden border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20",
      !route.enabled && "opacity-75 grayscale-[0.5]"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            route.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Network className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">{route.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={route.enabled ? "default" : "secondary"} className="text-[10px] px-1.5 h-5">
                {route.enabled ? "Active" : "Disabled"}
              </Badge>
            </div>
          </div>
        </div>
        <Switch 
          checked={route.enabled} 
          onCheckedChange={handleToggle}
          disabled={isToggling}
          aria-label="Toggle route"
        />
      </CardHeader>
      
      <CardContent className="pt-4 pb-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 border border-border/50">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</span>
            <code className="text-sm font-mono text-foreground font-semibold bg-background px-1.5 py-0.5 rounded border border-border">
              {route.pathPrefix}
            </code>
          </div>
          
          <div className="flex justify-center text-muted-foreground/40">
            <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 border border-border/50">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target</span>
            <code className="text-sm font-mono text-foreground font-semibold truncate max-w-[180px]" title={route.targetUrl}>
              {route.targetUrl}
            </code>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 flex items-center justify-between border-t bg-muted/20">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={handleTest}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Test Route
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs h-8 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
