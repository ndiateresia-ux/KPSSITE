import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";

// Import styles directly (better for Vite)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './theme.css'; // Your custom CSS

// Initialize AOS with better performance
const initAOS = async () => {
  try {
    const AOS = await import("aos");
    AOS.default.init({ 
      duration: 800, 
      once: true, 
      disable: window.innerWidth < 768,
      startEvent: 'DOMContentLoaded',
      throttleDelay: 99
    });
  } catch (error) {
    console.error('Failed to load AOS:', error);
  }
};

// Use requestIdleCallback for non-critical initialization
const initNonCritical = () => {
  // Initialize AOS when browser is idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initAOS(), { timeout: 2000 });
  } else {
    setTimeout(initAOS, 1000);
  }
};

// Initialize after page load or immediately if already loaded
if (document.readyState === 'complete') {
  initNonCritical();
} else {
  window.addEventListener('load', initNonCritical, { once: true });
}

// Preconnect to critical domains (optimized)
const domains = [
  { href: 'https://fonts.googleapis.com', crossorigin: false },
  { href: 'https://fonts.gstatic.com', crossorigin: true },
  // Remove cdn.jsdelivr.net if you're now loading Bootstrap locally
  // Only keep external domains you actually use
];

domains.forEach(({ href, crossorigin }) => {
  // Check if preconnect already exists
  if (!document.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    if (crossorigin) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  }
});

// Add dns-prefetch as fallback for older browsers
const dnsDomains = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

dnsDomains.forEach(href => {
  if (!document.querySelector(`link[rel="dns-prefetch"][href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
});

// Error boundary for the root render
const renderApp = () => {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
};

// Execute render
renderApp();

// Enable Hot Module Replacement (HMR) in development
if (import.meta.hot) {
  import.meta.hot.accept();
}