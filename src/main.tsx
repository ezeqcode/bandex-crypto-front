import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App.tsx";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./contexts/Theme.tsx";
import "@/global/css/tailwind.css";
import "@/global/css/reset.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);
