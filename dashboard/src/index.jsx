import React from "react";
import { createRoot } from "react-dom/client";
// import App from "./App";

const App = React.lazy(() => import("./app.jsx"));

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.Suspense fallback={<div>Loading...</div>}>
    <App />
  </React.Suspense>,
);
