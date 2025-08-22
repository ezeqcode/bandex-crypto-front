import "@/global/css/reset.css";
import "@/global/css/tailwind.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./app/App.tsx";
import { ThemeProvider } from "./contexts/Theme.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <div className="font-gilroy w-screen h-screen overflow-x-hidden overflow-y-auto">
          <App />
        </div>
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);
