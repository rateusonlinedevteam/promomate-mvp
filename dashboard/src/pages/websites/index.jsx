import { useState } from "react";

export default function WebsitesPage({ websites, onCreate, onSelect }) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

  return (
    <div>
      <div className="card">
        <h2>My Websites</h2>
        {websites.map((w) => (
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
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <button
            onClick={() => {
              if (name && domain) {
                onCreate(name, domain);
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
