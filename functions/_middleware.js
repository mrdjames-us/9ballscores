/**
 * Host cutover: old jamesnetworks custom domain → www canonical.
 * Pages _redirects cannot do domain-level redirects (CF docs).
 */
const HSTS = "max-age=31536000; includeSubDomains";

async function handleRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === "9ballscores.jamesnetworks.net") {
    const dest = new URL(url.pathname + url.search + url.hash, "https://www.9ballscores.com");
    return Response.redirect(dest.toString(), 301);
  }
  return context.next();
}

/**
 * HSTS on every Function response (the host 301 above and /api/*).
 * Pages does not apply _headers to Function responses; static files get
 * the same header from _headers. No preload.
 */
export async function onRequest(context) {
  const res = await handleRequest(context);
  if (res.headers.get("Strict-Transport-Security") === HSTS) return res;
  const headers = new Headers(res.headers);
  headers.set("Strict-Transport-Security", HSTS);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
