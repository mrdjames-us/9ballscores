/**
 * POST /api/book — create a new cloud scorebook, returns { code }.
 * The code is the secret: anyone who has it can read/write that book.
 */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function makeCode(len) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  // XXXX-XXXX for readability
  return out.slice(0, 4) + "-" + out.slice(4, 8);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, PUT, POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestPost(context) {
  const { env } = context;
  if (!env.DB) return json({ error: "Database not bound" }, 500);

  // Rare collision: retry a few times
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeCode(8);
    const now = new Date().toISOString();
    try {
      await env.DB.prepare(
        "INSERT INTO books (code, profiles, history, updated_at) VALUES (?, '[]', '[]', ?)"
      )
        .bind(code, now)
        .run();
      return json({ code, profiles: [], history: [], updatedAt: now });
    } catch (e) {
      // unique constraint → try again
      if (String(e).includes("UNIQUE") || String(e).includes("constraint")) continue;
      return json({ error: "Create failed", detail: String(e) }, 500);
    }
  }
  return json({ error: "Could not allocate a unique code" }, 500);
}
