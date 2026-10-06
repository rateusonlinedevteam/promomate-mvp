import React from "react";

function Menu({ route, go }) {
  return (
    <aside>
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
    </aside>
  );
}

export default Menu;
