
import { proxyRoutes, type InsertProxyRoute, type ProxyRoute } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProxyRoutes(): Promise<ProxyRoute[]>;
  getProxyRoute(id: number): Promise<ProxyRoute | undefined>;
  createProxyRoute(route: InsertProxyRoute): Promise<ProxyRoute>;
  deleteProxyRoute(id: number): Promise<void>;
  toggleProxyRoute(id: number, enabled: boolean): Promise<ProxyRoute>;
}

export class DatabaseStorage implements IStorage {
  async getProxyRoutes(): Promise<ProxyRoute[]> {
    return await db.select().from(proxyRoutes);
  }

  async getProxyRoute(id: number): Promise<ProxyRoute | undefined> {
    const [route] = await db.select().from(proxyRoutes).where(eq(proxyRoutes.id, id));
    return route;
  }

  async createProxyRoute(insertRoute: InsertProxyRoute): Promise<ProxyRoute> {
    const [route] = await db.insert(proxyRoutes).values(insertRoute).returning();
    return route;
  }

  async deleteProxyRoute(id: number): Promise<void> {
    await db.delete(proxyRoutes).where(eq(proxyRoutes.id, id));
  }

  async toggleProxyRoute(id: number, enabled: boolean): Promise<ProxyRoute> {
    const [route] = await db.update(proxyRoutes)
      .set({ enabled })
      .where(eq(proxyRoutes.id, id))
      .returning();
    return route;
  }
}

export const storage = new DatabaseStorage();
