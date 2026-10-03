import { initStorage } from "@yaad/core/lib/storage/storage-provider";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "@yaad/ui/assets/globals.css";
import "@yaad/ui/assets/app.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

void initStorage().catch((err) => {
  console.error("Failed to initialize storage:", err);
});
