import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import './lib/i18n';
import { logClientError } from './lib/utils';

// Global JS hatalarını backend'e logla
window.onerror = function (message, source, lineno, colno, error) {
  logClientError({ message, source, lineno, colno, error: error ? error.stack || error.toString() : undefined });
};
window.addEventListener('unhandledrejection', function(event) {
  logClientError({ message: event.reason ? (event.reason.message || event.reason.toString()) : 'unhandledrejection', reason: event.reason });
});

createRoot(document.getElementById("root")!).render(<App />);
