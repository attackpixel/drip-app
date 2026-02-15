import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { App } from './App';

const globalScope = globalThis as { process?: { env?: Record<string, string> } };
globalScope.process ??= {};
globalScope.process.env ??= {};
globalScope.process.env.EXPO_PUBLIC_SUPABASE_URL ??= import.meta.env.VITE_SUPABASE_URL ?? '';
globalScope.process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??= import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
globalScope.process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ??= import.meta.env.VITE_OPENWEATHER_API_KEY ?? '';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
