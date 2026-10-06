export default function SettingsPage({ site }) {
  if (!site)
    return <div className="card">Select a website to edit settings.</div>;
  return (
    <div>
      <div className="card">
        <h2>Site Details</h2>
        <div className="row">
          <span>Name</span>
          <b>{site.name}</b>
        </div>
        <div className="row">
          <span>Domain</span>
          <b>{site.domain}</b>
        </div>
        <div className="row">
          <span>Site Key</span>
          <b>{site.site_key}</b>
        </div>
      </div>
      <div className="card">
        <h2>Install Tracker</h2>
        <pre>{`<script src="http://localhost:3033/tracker/tracker.js" data-site-id="${site.site_key}" data-api="http://localhost:3033"></script>`}</pre>
      </div>
    </div>
  );
}
