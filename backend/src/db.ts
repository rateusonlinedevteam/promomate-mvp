import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "promomate",
  port: Number(process.env.MYSQL_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS websites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  site_key VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  website_id INT NOT NULL,
  visitor_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  page_url TEXT,
  page_path TEXT,
  page_title VARCHAR(1000),
  referrer TEXT,
  source VARCHAR(255),
  medium VARCHAR(255),
  campaign VARCHAR(255),
  country VARCHAR(255),
  device VARCHAR(255),
  browser VARCHAR(255),
  os VARCHAR(255),
  event_data TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(website_id) REFERENCES websites(id)
);

CREATE INDEX IF NOT EXISTS idx_events_website_time ON events(website_id, created_at);
-- index only a prefix of page_path to avoid oversized key errors on utf8mb4
CREATE INDEX IF NOT EXISTS idx_events_page ON events(website_id, page_path(255));
CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(website_id, visitor_id);
`;

await pool.query(schema);

// Compatibility wrapper so existing code can use `db.prepare(sql).get/run/all` semantics
export const db = {
  prepare(sql: string) {
    return {
      async run(...params: any[]) {
        const [result] = await pool.execute(sql, params);
        // mysql2 returns OkPacket with insertId and affectedRows
        return {
          lastInsertRowid: (result as any).insertId,
          changes: (result as any).affectedRows,
        };
      },
      async get(...params: any[]) {
        const [rows] = await pool.execute(sql, params);
        return (rows as any)[0];
      },
      async all(...params: any[]) {
        const [rows] = await pool.execute(sql, params);
        return rows as any[];
      },
    };
  },
  pool,
};

// demo user + website
const [[demoRow]] = (await pool.execute(
  "SELECT id FROM users WHERE email = ?",
  ["demo@promomate.local"],
)) as any;
if (!demoRow) {
  const [res] = await pool.execute(
    "INSERT INTO users (email,password,name) VALUES (?,?,?)",
    ["demo@promomate.local", "demo12345", "Demo User"],
  );
  const userId = (res as any).insertId;
  await pool.execute(
    "INSERT INTO websites (user_id,name,domain,site_key) VALUES (?,?,?,?)",
    [
      userId,
      "Demo Website",
      "localhost",
      "demo_" + Math.random().toString(36).slice(2, 14),
    ],
  );
}

// seed some demo events if none exist for the demo website
const [[websiteRow]] = (await pool.execute(
  "SELECT id FROM websites ORDER BY id LIMIT 1",
)) as any;
if (websiteRow) {
  const websiteId = websiteRow.id;
  const [[eventsCount]] = (await pool.execute(
    "SELECT COUNT(*) count FROM events WHERE website_id = ?",
    [websiteId],
  )) as any;
  if (Number(eventsCount.count) === 0) {
    const pages = [
      "/",
      "/pricing",
      "/features",
      "/about",
      "/blog/post-1",
      "/contact",
    ];
    const devices = ["desktop", "mobile", "tablet"];
    const countries = ["US", "GB", "IN", "DE", "CA"];
    const now = Date.now();

    function fmt(d: Date) {
      return d.toISOString().slice(0, 19).replace("T", " ");
    }

    const inserts = 150;
    for (let i = 0; i < inserts; i++) {
      const page = pages[Math.floor(Math.random() * pages.length)];
      const visitorId = "vis_" + Math.random().toString(36).slice(2, 10);
      const sessionId = "sess_" + Math.random().toString(36).slice(2, 12);
      const eventName = Math.random() < 0.9 ? "page_view" : "section_view";
      const createdAt = new Date(
        now - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 14),
      ); // last 14 days
      const eventData =
        eventName === "section_view"
          ? JSON.stringify({
              section_id: "s_" + Math.floor(Math.random() * 10),
              section_title: "Section " + Math.floor(Math.random() * 10),
            })
          : "";

      await pool.execute(
        `INSERT INTO events (
          website_id, visitor_id, session_id, event_name, page_url, page_path,
          page_title, referrer, source, medium, campaign, country, device,
          browser, os, event_data, created_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          websiteId,
          visitorId,
          sessionId,
          eventName,
          `http://localhost${page}`,
          page,
          `Demo ${page}`,
          "",
          "direct",
          "none",
          "",
          countries[Math.floor(Math.random() * countries.length)],
          devices[Math.floor(Math.random() * devices.length)],
          "Chrome",
          "Mac OS",
          eventData,
          fmt(createdAt),
        ],
      );
    }
  }
}

export async function getDemoWebsite() {
  const [rows] = await pool.execute(
    "SELECT * FROM websites ORDER BY id LIMIT 1",
  );
  return (rows as any[])[0];
}
