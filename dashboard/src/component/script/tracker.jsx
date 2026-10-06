export const Tracker = ({ selected }) => {
  return (
    <section className="card install">
      <h2>Install Tracker</h2>
      <p>
        Add this script to your website before <code>&lt;/head&gt;</code>:
      </p>
      <pre>{`<script src="http://localhost:3033/tracker.js"
  data-site-id="${selected?.site_key}"
  data-api="http://localhost:3033"></script>`}</pre>
    </section>
  );
};
