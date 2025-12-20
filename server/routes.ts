
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { createProxyServer } from "http-proxy-3";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- API Routes ---
  app.get(api.proxyRoutes.list.path, async (req, res) => {
    const routes = await storage.getProxyRoutes();
    res.json(routes);
  });

  app.post(api.proxyRoutes.create.path, async (req, res) => {
    try {
      const input = api.proxyRoutes.create.input.parse(req.body);
      const route = await storage.createProxyRoute(input);
      res.status(201).json(route);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.proxyRoutes.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteProxyRoute(id);
    res.status(204).send();
  });

  app.patch(api.proxyRoutes.toggle.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const { enabled } = req.body;
    const route = await storage.toggleProxyRoute(id, enabled);
    res.json(route);
  });

  // --- Proxy Logic ---
  const proxy = createProxyServer({
    secure: false, // allow self-signed certs if needed
    changeOrigin: true, // needed for virtual hosted sites
  });

  // Middleware to handle proxying
  // Placed after API routes so it doesn't intercept them
  app.use(async (req, res, next) => {
    // Skip if it matches an API route (already handled, but good safety check)
    if (req.path.startsWith('/api')) {
      return next();
    }

    try {
      const routes = await storage.getProxyRoutes();
      // Find a route where the request path starts with the prefix
      const matchingRoute = routes.find(r => 
        r.enabled && req.path.startsWith(r.pathPrefix)
      );

      if (matchingRoute) {
        console.log(`[Proxy] Forwarding ${req.path} -> ${matchingRoute.targetUrl}`);
        
        // We proxy to the target. 
        // Note: http-proxy-3 by default appends the path.
        // If pathPrefix is /api/google and target is google.com
        // and req is /api/google/foo, it goes to google.com/api/google/foo
        // Often we want to strip the prefix. 
        // Let's try to be smart: if the targetUrl ends with slash, maybe we don't need to strip?
        // For now, let's strictly forward to the targetUrl.
        // To implement path rewriting properly is complex without more config.
        // We will just pass it through as is. 
        
        proxy.web(req, res, {
          target: matchingRoute.targetUrl,
          // Optional: ignorePath: true // if we wanted to ignore the path
        }, (err) => {
          console.error("[Proxy] Error:", err);
          if (!res.headersSent) {
            res.status(502).json({ message: "Proxy Error", error: err.message });
          }
        });
        return;
      }
    } catch (error) {
      console.error("[Proxy] Middleware error:", error);
    }
    
    next();
  });

  return httpServer;
}
