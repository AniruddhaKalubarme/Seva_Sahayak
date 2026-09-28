import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// React needs one DOM element as the mounting point for the entire application.
// App then renders all providers, routes, and visible screens inside this element.
createRoot(document.getElementById("root")!).render(<App />);
