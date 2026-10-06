import { loadSites } from "../../util/util";
import { useEffect, useState } from "react";
import React from "react";
import { useLocation } from "react-router-dom";

const Header = ({ selectsite, site }) => {
  const location = useLocation();
  const route = location.pathname.slice(1);
  const [websitelist, setWebsitelist] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);

  useEffect(() => {
    loadSites().then((site) => {
      setWebsitelist(site);
      setSelectedSite(site[0] || null);
      selectsite(site[0] || null);
    });
  }, []);

  console.log("Websitelist state:", websitelist);

  return (
    <header>
      <div>
        <h1>
          {route === ""
            ? "Dashboard"
            : route === "websites"
              ? "Websites"
              : route === "events"
                ? "Events"
                : "Settings"}
        </h1>
        <p>{site ? `${site.name} · ${site.domain}` : "No site selected"}</p>
      </div>
      <select
        value={selectedSite?.id || ""}
        onChange={(e) => {
          const site = websitelist.find((w) => w.id === Number(e.target.value));
          setSelectedSite(site);
          selectsite(site);
        }}
      >
        {websitelist.map((w) => (
          <option key={w.id} selected={selectedSite?.id === w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
    </header>
  );
};

export default Header;
