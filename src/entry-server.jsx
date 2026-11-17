// Build-time only. Renders the single-page app to static HTML so crawlers
// and link unfurlers that do not execute JavaScript still see the content.
// The client (src/main.jsx) still mounts with createRoot, which replaces this
// markup on load, so there is no hydration contract to keep in sync.
import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";

export function render() {
  return renderToString(<App />);
}
