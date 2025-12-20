
import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const proxyRoutes = pgTable("proxy_routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  pathPrefix: text("path_prefix").notNull().unique(),
  targetUrl: text("target_url").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
});

export const insertProxyRouteSchema = createInsertSchema(proxyRoutes).pick({
  name: true,
  pathPrefix: true,
  targetUrl: true,
  enabled: true,
});

export type InsertProxyRoute = z.infer<typeof insertProxyRouteSchema>;
export type ProxyRoute = typeof proxyRoutes.$inferSelect;
