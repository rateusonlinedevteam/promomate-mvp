import React, { useEffect, useState } from "react";
import Layout from "./component/layout/layout";
import "./style.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EventsPage from "./pages/events";
import SettingsPage from "./pages/settings";
import WebsitesPage from "./pages/websites";
import DashboardPage from "./pages/dashboad";

function App() {
  const [site, setSite] = useState(null);
  useEffect(() => {
    console.log("Selected site:", site);
  }, [site]);

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/websites"
            element={
              <Layout selectsite={setSite} site={site}>
                <WebsitesPage site={site} />
              </Layout>
            }
          />
          <Route
            path="/events"
            element={
              <Layout selectsite={setSite} site={site}>
                <EventsPage site={site} />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout selectsite={setSite} site={site}>
                <SettingsPage site={site} />
              </Layout>
            }
          />
          <Route
            path="/"
            element={
              <Layout selectsite={setSite} site={site}>
                <DashboardPage site={site} />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
