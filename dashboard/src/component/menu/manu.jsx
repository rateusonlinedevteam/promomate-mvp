import React from "react";
import { Link } from "react-router-dom";
const menuItems = [
  { name: "Dashboard", route: "/" },
  { name: "Websites", route: "/websites" },
  { name: "Events", route: "/events" },
  { name: "Settings", route: "/settings" },
];

function Menu() {
  const route = window.location.pathname;
  return (
    <aside>
      <div className="logo">PromoMate</div>
      <div className="muted">Website Analytics</div>
      {menuItems.map((item) => (
        <div
          key={item.route}
          className={`nav ${route === item.route ? "active" : ""}`}
        >
          <Link
            key={item.route}
            className={`nav ${route === item.route ? "active" : ""}`}
            to={item.route}
          >
            {item.name}
          </Link>
        </div>
      ))}
    </aside>
  );
}

export default Menu;
