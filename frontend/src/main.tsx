import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { SupabaseSessionProvider } from "./auth/SupabaseSession";
import "./styles.css";
import "./cyber-workspace.css";
import "./components/AssetPulse/asset-pulse.css";

createRoot(document.getElementById("root")!).render(<React.StrictMode><SupabaseSessionProvider><App /></SupabaseSessionProvider></React.StrictMode>);
