import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Copy, Share2, Shirt } from 'lucide-react';
import type { OutfitWithItems } from '@drip/core';
import { formatDate, getColorHex } from '@drip/core';
import { Button } from '../ui/Button';

interface ShareCardProps {
  outfit: OutfitWithItems;
}

export function ShareCard({ outfit }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const exportPng = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `drip-outfit-${outfit.worn_on}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* The card itself */}
      <div
        ref={cardRef}
        className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-6 text-white"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg font-bold">drip</span>
          <span className="text-sm opacity-80">{formatDate(outfit.worn_on)}</span>
        </div>

        <div className="flex justify-center gap-3">
          {outfit.items.map((oi) => (
            <div key={oi.clothing_item_id} className="flex flex-col items-center gap-1">
              {oi.clothing_item?.image_url ? (
                <img
                  src={oi.clothing_item.image_url}
                  alt={oi.clothing_item.name}
                  className="h-20 w-20 rounded-xl object-cover ring-2 ring-white/30"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/10">
                  <Shirt size={24} className="text-white/50" />
                </div>
              )}
              <span className="max-w-[80px] truncate text-xs opacity-80">{oi.clothing_item?.name}</span>
            </div>
          ))}
        </div>

        {outfit.name && (
          <p className="mt-4 text-center text-sm font-medium opacity-90">{outfit.name}</p>
        )}

        {outfit.occasion && (
          <p className="mt-1 text-center text-xs uppercase tracking-wider opacity-60">
            {outfit.occasion}
          </p>
        )}
      </div>

      {/* Export actions */}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={exportPng} loading={exporting} className="flex-1">
          <Download size={16} />
          Download
        </Button>
        <Button variant="secondary" onClick={copyToClipboard} loading={exporting} className="flex-1">
          <Copy size={16} />
          Copy
        </Button>
      </div>
    </div>
  );
}
