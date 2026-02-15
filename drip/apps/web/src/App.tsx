import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@drip/core';
import { AuthGuard } from './components/auth/AuthGuard';
import { Layout } from './components/ui/Layout';
import { LoginPage } from './routes/LoginPage';
import { SignupPage } from './routes/SignupPage';
import { HomePage } from './routes/HomePage';
import { WardrobePage } from './routes/WardrobePage';
import { AddItemPage } from './routes/AddItemPage';
import { ItemDetailPage } from './routes/ItemDetailPage';
import { HistoryPage } from './routes/HistoryPage';
import { OutfitBuilderPage } from './routes/OutfitBuilderPage';
import { StatsPage } from './routes/StatsPage';
import { SettingsPage } from './routes/SettingsPage';

export function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initialize().catch((e) => {
      console.error('Init error:', e);
      setError(e instanceof Error ? e.message : 'Init failed');
    });
  }, [initialize]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600">Failed to load</h1>
          <p className="text-gray-600">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="rounded bg-primary-600 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/wardrobe" element={<WardrobePage />} />
          <Route path="/wardrobe/add" element={<AddItemPage />} />
          <Route path="/wardrobe/:id" element={<ItemDetailPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/outfit/new" element={<OutfitBuilderPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
