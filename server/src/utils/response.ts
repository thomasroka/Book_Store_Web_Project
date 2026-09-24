import type { Request, Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const URL_KEY = /coverimage|image|imageurl|image_url/i;

function buildOrigin(req: Request): string {
  const proto = req.get('x-forwarded-proto')?.split(',')[0].trim() || req.protocol || 'http';
  return `${proto}://${req.get('host')}`;
}

function normalizeUrl(value: string, origin: string): string {
  if (/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(value)) {
    return value.replace(/^https?:\/\/[^/]+/, origin);
  }
  if (value.startsWith('/')) {
    return `${origin}${value}`;
  }
  return value;
}

function walk<T>(value: T, origin: string): T {
  if (Array.isArray(value)) {
    return value.map((item) => walk(item, origin)) as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (typeof val === 'string' && URL_KEY.test(key)) {
        out[key] = normalizeUrl(val, origin);
      } else {
        out[key] = walk(val, origin);
      }
    }
    return out as T;
  }
  return value;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  meta?: PaginationMeta,
  statusCode = 200
): void {
  const origin = buildOrigin(res.req);
  res.status(statusCode).json({
    success: true,
    data: walk(data, origin),
    ...(meta ? { meta } : {}),
  });
}