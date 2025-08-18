// frontend/src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Import CSS for Tailwind and custom styles
import App from "./App"; // Import your actual App component

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
