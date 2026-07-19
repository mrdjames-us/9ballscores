/**
 * GET  /api/book/:code — load scorebook { profiles, history, updatedAt }
 * PUT  /api/book/:code — merge client data into server and return merged book
 */

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

function normalizeCode(raw) {
  return String(raw || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function formatCode(norm) {
  if (norm.length === 8) return norm.slice(0, 4) + "-" + norm.slice(4);
  return norm;
}

function matchId(m) {
  if (m && m.id) return String(m.id);
  // Legacy local matches: stable fingerprint
  return [
    m.date || "",
    (m.names || []).join("|"),
    (m.scores || []).join("-"),
    (m.matchPts || []).join("-"),
    m.innings != null ? m.innings : "",
  ].join("::");
}

function mergeProfiles(server, client) {
  const map = new Map();
  function ingest(list) {
    (list || []).forEach((p) => {
      if (!p || !p.name) return;
      const key = p.name.trim().toLowerCase();
      const prev = map.get(key);
      if (!prev) {
        map.set(key, Object.assign({}, p));
        return;
      }
      // Prefer higher skill if both set? Prefer most recent lastPlayed / created.
      const prevT = Date.parse(prev.lastPlayed || prev.created || 0) || 0;
      const nextT = Date.parse(p.lastPlayed || p.created || 0) || 0;
      if (nextT >= prevT) {
        map.set(key, Object.assign({}, prev, p, {
          name: p.name.trim() || prev.name,
          sl: p.sl != null ? p.sl : prev.sl,
          created: prev.created || p.created,
          lastPlayed: (nextT >= prevT ? (p.lastPlayed || prev.lastPlayed) : (prev.lastPlayed || p.lastPlayed)) || null,
        }));
      } else {
        map.set(key, Object.assign({}, p, prev, {
          name: prev.name.trim() || p.name,
          sl: prev.sl != null ? prev.sl : p.sl,
          created: prev.created || p.created,
        }));
      }
    });
  }
  ingest(server);
  ingest(client);
  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

function mergeHistory(server, client) {
  const map = new Map();
  function ingest(list) {
    (list || []).forEach((m) => {
      if (!m) return;
      const id = matchId(m);
      const copy = Object.assign({}, m, { id: m.id || id });
      const prev = map.get(id);
      if (!prev) {
        map.set(id, copy);
        return;
      }
      // Keep the richer / later record
      const prevT = Date.parse(prev.date || 0) || 0;
      const nextT = Date.parse(copy.date || 0) || 0;
      map.set(id, nextT >= prevT ? copy : prev);
    });
  }
  ingest(server);
  ingest(client);
  return Array.from(map.values()).sort((a, b) => {
    const ta = Date.parse(a.date || 0) || 0;
    const tb = Date.parse(b.date || 0) || 0;
    return tb - ta;
  });
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestGet(context) {
  const { env, params } = context;
  if (!env.DB) return json({ error: "Database not bound" }, 500);

  const code = formatCode(normalizeCode(params.code));
  if (normalizeCode(params.code).length !== 8) {
    return json({ error: "Invalid code" }, 400);
  }

  const row = await env.DB.prepare(
    "SELECT code, profiles, history, updated_at FROM books WHERE code = ?"
  )
    .bind(code)
    .first();

  if (!row) return json({ error: "Scorebook not found" }, 404);

  let profiles = [];
  let history = [];
  try { profiles = JSON.parse(row.profiles || "[]"); } catch (_) {}
  try { history = JSON.parse(row.history || "[]"); } catch (_) {}

  return json({
    code: row.code,
    profiles,
    history,
    updatedAt: row.updated_at,
  });
}

export async function onRequestPut(context) {
  const { env, params, request } = context;
  if (!env.DB) return json({ error: "Database not bound" }, 500);

  const code = formatCode(normalizeCode(params.code));
  if (normalizeCode(params.code).length !== 8) {
    return json({ error: "Invalid code" }, 400);
  }

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const row = await env.DB.prepare(
    "SELECT code, profiles, history, updated_at FROM books WHERE code = ?"
  )
    .bind(code)
    .first();

  if (!row) return json({ error: "Scorebook not found" }, 404);

  let serverProfiles = [];
  let serverHistory = [];
  try { serverProfiles = JSON.parse(row.profiles || "[]"); } catch (_) {}
  try { serverHistory = JSON.parse(row.history || "[]"); } catch (_) {}

  // Optional: replace mode for "clear history" from client
  let profiles;
  let history;
  if (body.replace === true) {
    profiles = Array.isArray(body.profiles) ? body.profiles : [];
    history = Array.isArray(body.history) ? body.history : [];
  } else {
    profiles = mergeProfiles(serverProfiles, body.profiles);
    history = mergeHistory(serverHistory, body.history);
  }

  // Cap history growth (keep newest 500 matches)
  if (history.length > 500) history = history.slice(0, 500);

  const now = new Date().toISOString();
  await env.DB.prepare(
    "UPDATE books SET profiles = ?, history = ?, updated_at = ? WHERE code = ?"
  )
    .bind(JSON.stringify(profiles), JSON.stringify(history), now, code)
    .run();

  return json({
    code,
    profiles,
    history,
    updatedAt: now,
  });
}
