export interface Env {
  ENVIRONMENT: string;
  API_ORIGIN: string;
  WEB_ORIGIN: string;
  LEGALOS_R2_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // 1. Resolve Tenant Slug from Subdomain (e.g. alharthi.legalos.sa -> alharthi)
    const hostParts = hostname.split('.');
    let tenantSlug = '';
    if (hostParts.length > 2 && !hostname.startsWith('www.')) {
      tenantSlug = hostParts[0];
    }

    const reqHeaders = new Headers(request.headers);
    if (tenantSlug) {
      reqHeaders.set('X-Tenant-Slug', tenantSlug);
    }
    reqHeaders.set('X-Forwarded-Host', hostname);

    // 2. Handle Edge Document Proxying from Cloudflare R2 Storage (/storage/*)
    if (url.pathname.startsWith('/storage/')) {
      const objectKey = url.pathname.replace('/storage/', '');
      const object = await env.LEGALOS_R2_BUCKET.get(objectKey);

      if (!object) {
        return new Response('المستند غير موجود في التخزين السحابي Cloudflare R2', { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('Access-Control-Allow-Origin', '*');

      return new Response(object.body, { headers });
    }

    // 3. Proxy API Requests (/v1/* or /api/*) to NestJS Backend Origin
    if (url.pathname.startsWith('/v1/') || url.pathname.startsWith('/api/')) {
      const targetUrl = new URL(url.pathname + url.search, env.API_ORIGIN);
      return fetch(new Request(targetUrl.toString(), {
        method: request.method,
        headers: reqHeaders,
        body: request.body,
      }));
    }

    // 4. Proxy Web & PWA Requests to Next.js Web Origin
    const webTargetUrl = new URL(url.pathname + url.search, env.WEB_ORIGIN);
    return fetch(new Request(webTargetUrl.toString(), {
      method: request.method,
      headers: reqHeaders,
      body: request.body,
    }));
  },
};
