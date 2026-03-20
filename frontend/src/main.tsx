// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Importing global CSS
 * Ensure src/assets/global.css exists or Vite will throw an error.
 * If the file is not yet created, you can safely comment this line out.
 */
import './assets/global.css';

/**
 * Root Element Binding
 * Selects the element with id="root" from your index.html file.
 * The '!' assertion tells TypeScript that this element will definitely exist at runtime.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Failed to find the root element. Ensure <div id="root"></div> is present in index.html'
  );
}

/**
 * Mounting the React Application
 * React.StrictMode is a development-only wrapper that helps identify potential issues.
 * It renders components twice in dev mode to catch side-effect bugs.
 */
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);