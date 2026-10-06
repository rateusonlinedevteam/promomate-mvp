export default function EventsPage({ site, api }) {
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => {
    if (!site) return;
    (async () => {
      const res = await fetch(
        api + "/api/v1/analytics/" + site.id + "/summary",
      );
      setAnalytics(await res.json());
    })();
  }, [site]);

  if (!site)
    return <div className="card">Select a website to view events.</div>;
  if (!analytics) return <div className="card">Loading events...</div>;

  return (
    <div>
      <div className="card">
        <h2>Top Pages</h2>
        {analytics.topPages.map((p, i) => (
          <div className="row" key={i}>
            <span>{p.page}</span>
            <b>{p.views}</b>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Top Sections</h2>
        {analytics.sections.length === 0 ? (
          <p className="muted">No section data yet.</p>
        ) : (
          analytics.sections.map((s, i) => (
            <div className="row" key={i}>
              <span>{s.section_id || s.section_title}</span>
              <b>{s.views}</b>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
