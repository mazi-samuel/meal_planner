import type { IncomingMessage, ServerResponse } from 'node:http';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export interface RequestContext {
  params: Record<string, string>;
  query: URLSearchParams;
  readJson<T = unknown>(): Promise<T>;
}

export type Handler = (ctx: RequestContext) => Promise<{ status?: number; body: unknown }> | { status?: number; body: unknown };

interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
}

const MAX_BODY_BYTES = 100_000;

function compile(path: string): { pattern: RegExp; keys: string[] } {
  const keys: string[] = [];
  const source = path.replace(/:([A-Za-z]+)/g, (_, key: string) => {
    keys.push(key);
    return '([^/]+)';
  });
  return { pattern: new RegExp(`^${source}/?$`), keys };
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = chunk as Buffer;
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, 'Request body too large');
    chunks.push(buffer);
  }
  if (size === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON');
  }
}

export class Router {
  private readonly routes: Route[] = [];

  add(method: string, path: string, handler: Handler): this {
    this.routes.push({ method, ...compile(path), handler });
    return this;
  }

  get(path: string, handler: Handler): this {
    return this.add('GET', path, handler);
  }

  post(path: string, handler: Handler): this {
    return this.add('POST', path, handler);
  }

  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const send = (status: number, body: unknown) => {
      res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      });
      res.end(JSON.stringify(body));
    };

    try {
      if (req.method === 'OPTIONS') return send(204, {});

      const url = new URL(req.url ?? '/', 'http://localhost');
      const candidates = this.routes.filter((r) => r.pattern.test(url.pathname));
      if (candidates.length === 0) throw new HttpError(404, 'Not found');

      const route = candidates.find((r) => r.method === req.method);
      if (!route) throw new HttpError(405, 'Method not allowed');

      const match = route.pattern.exec(url.pathname)!;
      const params = Object.fromEntries(route.keys.map((key, i) => [key, decodeURIComponent(match[i + 1]!)]));

      const result = await route.handler({
        params,
        query: url.searchParams,
        readJson: <T,>() => readBody(req) as Promise<T>,
      });
      send(result.status ?? 200, result.body);
    } catch (error) {
      if (error instanceof HttpError) return send(error.status, { error: error.message });
      console.error(error);
      send(500, { error: 'Internal server error' });
    }
  }
}
