import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import './index.css';

/**
 * Routing: HashRouter (#/menu paths) works on any static host without server rewrites.
 * Set VITE_USE_HASH_ROUTER=false in .env for clean URLs (/ and /payment).
 * Your host must serve index.html for unknown paths (Vite dev/preview do; Azure SWA needs navigationFallback).
 */
const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || undefined;
const useHash = import.meta.env.VITE_USE_HASH_ROUTER !== 'false';
const Router = useHash ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router basename={base}>
      <CartProvider>
        <App />
      </CartProvider>
    </Router>
  </React.StrictMode>
);
