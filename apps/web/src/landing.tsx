import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";

import { LandingPage } from "@/components/pages/landing-page";
import "@yaad/ui/assets/globals.css";

function LandingApp() {
  const handleOpenApp = () => {
    window.location.assign("/app");
  };

  return (
    <BrowserRouter>
      <LandingPage onOpenApp={handleOpenApp} />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LandingApp />
  </React.StrictMode>,
);
