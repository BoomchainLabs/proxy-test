
import { z } from 'zod';
import { insertProxyRouteSchema, proxyRoutes } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  proxyRoutes: {
    list: {
      method: 'GET' as const,
      path: '/api/proxy-routes',
      responses: {
        200: z.array(z.custom<typeof proxyRoutes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/proxy-routes',
      input: insertProxyRouteSchema,
      responses: {
        201: z.custom<typeof proxyRoutes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/proxy-routes/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    toggle: {
      method: 'PATCH' as const,
      path: '/api/proxy-routes/:id/toggle',
      input: z.object({ enabled: z.boolean() }),
      responses: {
        200: z.custom<typeof proxyRoutes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
