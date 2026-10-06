import { useState, useEffect } from "react";
import { loadSites, addWebsite } from "../../util/util";
export default function WebsitesPage({ site }) {
  const [websites, setWebsites] = useState(site ? [site] : []);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const onSelect = (website) => {
    console.log("Selected website:", website);
  };

  console.log("Websites state:", websites, websites.length);
  return (
    <div>
      <div className="card">
        <h2>My Websites</h2>
        {websites &&
          websites.length > 0 &&
          websites.map((w) => (
            <div
              className="row"
              key={w.id}
              onClick={() => onSelect(w)}
              style={{ cursor: "pointer" }}
            >
              <span>{w.name}</span>
              <b>{w.domain}</b>
            </div>
          ))}
      </div>

      <div className="card">
        <h2>Add Website</h2>
        <div style={{ display: "grid", gap: 8 }}>
          <input
            placeholder="Name"
            className="form-control input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Domain"
            className="input"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <button
            onClick={() => {
              if (name && domain) {
                addWebsite(name, domain).then((w) => {
                  setWebsites([w]);
                });
                setName("");
                setDomain("");
              }
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
