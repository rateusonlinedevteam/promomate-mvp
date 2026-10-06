import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Menu from "./component/menu/manu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./style.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RechartsBar from "./component/chart/recharts";
import EventsPage from "./pages/events";
import SettingsPage from "./pages/settings";

const API = "http://localhost:3033";

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
    </div>
  );
}

function App() {
  const [websites, setWebsites] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState("dashboard");

  async function loadSites() {
    const res = await fetch(API + "/api/v1/websites");
    const sites = await res.json();
    setWebsites(sites);
    if (sites[0]) setSelected(sites[0]);
  }

  async function loadAnalytics(site) {
    if (!site) return;
    setLoading(true);
    const res = await fetch(API + "/api/v1/analytics/" + site.id + "/summary");
    setData(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadSites();
  }, []);
  useEffect(() => {
    loadAnalytics(selected);
  }, [selected]);

  function go(routeName) {
    setRoute(routeName);
  }

  if (!data || loading)
    return <div className="loading">Loading PromoMate...</div>;
  console.log("Data", data);
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
      </Router>
      <div className="app">
        <Menu route={route} go={go} />
        {/* <aside>
          <div className="logo">PromoMate</div>
          <div className="muted">Website Analytics</div>
          <div
            className={`nav ${route === "dashboard" ? "active" : ""}`}
            onClick={() => go("dashboard")}
          >
            Dashboard
          </div>
          <div
            className={`nav ${route === "websites" ? "active" : ""}`}
            onClick={() => go("websites")}
          >
            Websites
          </div>
          <div
            className={`nav ${route === "events" ? "active" : ""}`}
            onClick={() => go("events")}
          >
            Events
          </div>
          <div
            className={`nav ${route === "settings" ? "active" : ""}`}
            onClick={() => go("settings")}
          >
            Settings
          </div>
        </aside> */}

        <main>
          <header>
            <div>
              <h1>
                {route === "dashboard"
                  ? "Dashboard"
                  : route === "websites"
                    ? "Websites"
                    : route === "events"
                      ? "Events"
                      : "Settings"}
              </h1>
              <p>
                {selected
                  ? `${selected.name} · ${selected.domain}`
                  : "No site selected"}
              </p>
            </div>
            <select
              value={selected.id}
              onChange={(e) =>
                setSelected(
                  websites.find((w) => w.id === Number(e.target.value)),
                )
              }
            >
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </header>
          {route === "dashboard" && (
            <>
              <section className="stats">
                <Stat label="Visitors" value={data.totals.visitors} />
                <Stat label="Page Views" value={data.totals.pageViews} />
                <Stat label="Sessions" value={data.totals.sessions} />
              </section>

              <section className="grid">
                <div className="card">
                  <h2>Top Pages</h2>
                  <RechartsBar
                    data={data.topPages}
                    dataKey="views"
                    xAxisKey="page"
                  />
                  {/* <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.topPages}>
                    <XAxis dataKey="page" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" />
                  </BarChart>
                </ResponsiveContainer> */}
                </div>

                <div className="card">
                  <h2>Traffic Sources</h2>
                  {data.sources.map((x, i) => (
                    <div className="row" key={i}>
                      <span>{x.source}</span>
                      <b>{x.visits}</b>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid">
                <div className="card">
                  <h2>Section Performance</h2>
                  {data.sections.length === 0 ? (
                    <p className="muted">
                      No section events yet. Add data-promomate attributes to
                      your site sections.
                    </p>
                  ) : (
                    data.sections.map((x, i) => (
                      <div className="row" key={i}>
                        <span>
                          {x.section_id || x.section || x.section_title}
                        </span>
                        <b>{x.views}</b>
                      </div>
                    ))
                  )}
                </div>

                <div className="card">
                  <h2>Devices</h2>
                  {data.devices.map((x, i) => (
                    <div className="row" key={i}>
                      <span>{x.device}</span>
                      <b>{x.visits}</b>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {route === "websites" && (
            <WebsitesPage
              websites={websites}
              onCreate={async (name, domain) => {
                const res = await fetch(API + "/api/v1/websites", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, domain }),
                });
                const w = await res.json();
                await loadSites();
                setSelected(w);
                setRoute("dashboard");
              }}
              onSelect={(w) => setSelected(w)}
            />
          )}

          {route === "events" && <EventsPage site={selected} api={API} />}

          {route === "settings" && <SettingsPage site={selected} />}

          <section className="card install">
            <h2>Install Tracker</h2>
            <p>
              Add this script to your website before <code>&lt;/head&gt;</code>:
            </p>
            <pre>{`<script src="http://localhost:3033/tracker.js"
  data-site-id="${selected.site_key}"
  data-api="http://localhost:3033"></script>`}</pre>
          </section>
        </main>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
