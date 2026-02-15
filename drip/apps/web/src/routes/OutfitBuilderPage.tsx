import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore, useWardrobeStore } from '@drip/core';
import { OutfitBuilder } from '@/components/outfit/OutfitBuilder';

export function OutfitBuilderPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const fetchItems = useWardrobeStore((s) => s.fetchItems);

  useEffect(() => {
    if (user) fetchItems(user.id);
  }, [user, fetchItems]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Build Outfit</h1>
      </div>
      <OutfitBuilder />
    </div>
  );
}
