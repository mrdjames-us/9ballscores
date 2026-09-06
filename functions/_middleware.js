/**
 * Host cutover: old jamesnetworks custom domain → www canonical.
 * Pages _redirects cannot do domain-level redirects (CF docs).
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === "9ballscores.jamesnetworks.net") {
    const dest = new URL(url.pathname + url.search + url.hash, "https://www.9ballscores.com");
    return Response.redirect(dest.toString(), 301);
  }
  return context.next();
}
