import React from "react";
import RechartsBar from "../../component/chart/recharts";
import { useState, useEffect } from "react";
import { loadSites, loadAnalytics } from "../../util/util";
function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value?.toLocaleString()}</strong>
    </div>
  );
}
export default function DashboardPage({ site }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics(site).then((data) => {
      setData(data);
      setLoading(false);
    });
  }, [site]);

  if (!data || loading)
    return <div className="loading">Loading PromoMate...</div>;
  console.log("Data", data);
  return (
    <>
      <section className="stats">
        <Stat label="Visitors" value={data?.totals?.visitors} />
        <Stat label="Page Views" value={data?.totals?.pageViews} />
        <Stat label="Sessions" value={data?.totals?.sessions} />
      </section>

      <section className="grid">
        <div className="card">
          <h2>Top Pages</h2>
          <RechartsBar data={data.topPages} dataKey="views" xAxisKey="page" />
        </div>

        <div className="card">
          <h2>Traffic Sources</h2>
          {data &&
            data.sources &&
            data.sources.map((x, i) => (
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
          {data.sections && data.sections.length === 0 ? (
            <p className="muted">
              No section events yet. Add data-promomate attributes to your site
              sections.
            </p>
          ) : (
            data.sections &&
            data.sections.map((x, i) => (
              <div className="row" key={i}>
                <span>{x.section_id || x.section || x.section_title}</span>
                <b>{x.views}</b>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h2>Devices</h2>
          {data.devices &&
            data.devices.map((x, i) => (
              <div className="row" key={i}>
                <span>{x.device}</span>
                <b>{x.visits}</b>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}
