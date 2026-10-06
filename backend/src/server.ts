import fastifyStatic from "@fastify/static";
import cors from "@fastify/cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import Fastify from "fastify";
import { UAParser } from "ua-parser-js";
import { nanoid } from "nanoid";
import { db, getDemoWebsite } from "./db.js";

const app = Fastify({ logger: true });
await app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
});
// await app.register(cors, { origin: true });
await app.register(fastifyStatic, {
  root: path.resolve(__dirname, "../../tracker"),
  prefix: "/tracker/",
});

function cleanUrl(value: unknown) {
  if (typeof value !== "string") return "";
  return value.slice(0, 4000);
}

function sourceFromReferrer(referrer: string) {
  if (!referrer) return { source: "direct", medium: "none" };
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host.includes("google."))
      return { source: "google", medium: "organic" };
    if (host.includes("facebook.com"))
      return { source: "facebook", medium: "social" };
    if (host.includes("instagram.com"))
      return { source: "instagram", medium: "social" };
    if (host.includes("youtube.com"))
      return { source: "youtube", medium: "social" };
    return { source: host, medium: "referral" };
  } catch {
    return { source: "unknown", medium: "referral" };
  }
}

async function websiteByKey(siteKey: string) {
  return (await db
    .prepare("SELECT * FROM websites WHERE site_key = ?")
    .get(siteKey)) as any;
}

app.get("/health", async () => ({ ok: true, service: "promomate-api" }));

app.get("/api/v1/websites", async () => {
  return await db
    .prepare(
      "SELECT id,name,domain,site_key,created_at FROM websites ORDER BY id DESC",
    )
    .all();
});

app.post("/api/v1/websites", async (request, reply) => {
  const body = request.body as any;
  if (!body?.name || !body?.domain) {
    return reply.code(400).send({ error: "name and domain are required" });
  }
  const siteKey = "site_" + nanoid(18);
  const result = await db
    .prepare(
      "INSERT INTO websites (user_id,name,domain,site_key) VALUES (?,?,?,?)",
    )
    .run(1, String(body.name), String(body.domain), siteKey);
  return await db
    .prepare("SELECT * FROM websites WHERE id = ?")
    .get(result.lastInsertRowid);
});

app.post("/api/v1/track", async (request, reply) => {
  const body = request.body as any;
  const siteKey = String(body?.siteKey || "");
  const website = await websiteByKey(siteKey);
  if (!website) return reply.code(404).send({ error: "Unknown site key" });

  const ua = String(request.headers["user-agent"] || "");
  const parsed = UAParser(ua);
  const referrer = cleanUrl(body?.referrer);
  const derived = sourceFromReferrer(referrer);
  const eventData =
    typeof body?.eventData === "object"
      ? JSON.stringify(body.eventData)
      : String(body?.eventData || "");

  await db
    .prepare(
      `
    INSERT INTO events (
      website_id, visitor_id, session_id, event_name, page_url, page_path,
      page_title, referrer, source, medium, campaign, country, device,
      browser, os, event_data
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `,
    )
    .run(
      website.id,
      String(body?.visitorId || "anonymous").slice(0, 100),
      String(body?.sessionId || "unknown").slice(0, 100),
      String(body?.eventName || "page_view").slice(0, 100),
      cleanUrl(body?.url),
      String(body?.path || "").slice(0, 1000),
      String(body?.title || "").slice(0, 500),
      referrer,
      String(body?.source || derived.source).slice(0, 200),
      String(body?.medium || derived.medium).slice(0, 100),
      String(body?.campaign || "").slice(0, 200),
      String(body?.country || "").slice(0, 100),
      String(body?.device || parsed.device.type || "desktop").slice(0, 100),
      String(body?.browser || parsed.browser.name || "Unknown").slice(0, 100),
      String(body?.os || parsed.os.name || "Unknown").slice(0, 100),
      eventData.slice(0, 5000),
    );

  return reply.send({ ok: true });
});

app.get("/api/v1/analytics/:websiteId/summary", async (request, reply) => {
  const { websiteId } = request.params as { websiteId: string };
  const id = Number(websiteId);
  const website = await db
    .prepare("SELECT * FROM websites WHERE id = ?")
    .get(id);
  if (!website) return reply.code(404).send({ error: "Website not found" });
  const pageViews = (await db
    .prepare(
      "SELECT COUNT(*) count FROM events WHERE website_id=? AND event_name='page_view'",
    )
    .get(id)) as any;

  const visitors = (await db
    .prepare(
      "SELECT COUNT(DISTINCT visitor_id) count FROM events WHERE website_id=?",
    )
    .get(id)) as any;

  const sessions = (await db
    .prepare(
      "SELECT COUNT(DISTINCT session_id) count FROM events WHERE website_id=?",
    )
    .get(id)) as any;

  const topPages = await db
    .prepare(
      `
    SELECT COALESCE(NULLIF(page_path,''), '/') page,
           COUNT(*) views,
           COUNT(DISTINCT visitor_id) visitors
    FROM events
    WHERE website_id=? AND event_name='page_view'
    GROUP BY page_path
    ORDER BY views DESC
    LIMIT 10
  `,
    )
    .all(id);

  const sources = await db
    .prepare(
      `
    SELECT COALESCE(NULLIF(source,''),'direct') source,
           COUNT(*) visits
    FROM events
    WHERE website_id=? AND event_name='page_view'
    GROUP BY source
    ORDER BY visits DESC
    LIMIT 10
  `,
    )
    .all(id);

  const devices = await db
    .prepare(
      `
    SELECT COALESCE(NULLIF(device,''),'unknown') device, COUNT(*) visits
    FROM events WHERE website_id=?
    GROUP BY device ORDER BY visits DESC
  `,
    )
    .all(id);

  const sections = await db
    .prepare(
      `
   SELECT
  COALESCE(
    JSON_UNQUOTE(JSON_EXTRACT(event_data,'$.section_id')),
    JSON_UNQUOTE(JSON_EXTRACT(event_data,'$.sectionId'))
  ) AS section_id,
  COALESCE(
    JSON_UNQUOTE(JSON_EXTRACT(event_data,'$.section_title')),
    JSON_UNQUOTE(JSON_EXTRACT(event_data,'$.sectionTitle'))
  ) AS section_title,
  COUNT(*) AS views,
  COUNT(DISTINCT visitor_id) AS visitors
FROM events
WHERE website_id = ?
  AND event_name = 'section_view'
GROUP BY
  COALESCE(
    JSON_UNQUOTE(JSON_EXTRACT(event_data,'$.section_id')),
    JSON_UNQUOTE(JSON_EXTRACT(event_data,'$.sectionId'))
  ),
  COALESCE(
    JSON_UNQUOTE(JSON_EXTRACT(event_data,'$.section_title')),
    JSON_UNQUOTE(JSON_EXTRACT(event_data,'$.sectionTitle'))
  )
ORDER BY views DESC;
    
  `,
    )
    .all(id);

  return {
    website,
    totals: {
      pageViews: Number(pageViews.count),
      visitors: Number(visitors.count),
      sessions: Number(sessions.count),
    },
    topPages,
    sources,
    devices,
    sections,
  };
});

const port = Number(process.env.PORT || 3033);
await app.listen({ port, host: "0.0.0.0" });
