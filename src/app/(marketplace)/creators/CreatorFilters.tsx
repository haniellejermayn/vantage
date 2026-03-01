'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

const NICHES = [
  'beauty',
  'tech',
  'food',
  'fashion',
  'lifestyle',
  'fitness',
  'travel',
  'gaming',
];
const PRICE_STEPS = [5000, 10000, 20000, 50000, 100000];
const MAX_VAL = PRICE_STEPS[PRICE_STEPS.length - 1];

export function CreatorFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Local State
  // Fixed: Replaced the missing DEFAULT_MAX_PRICE with MAX_VAL
  const [localNiche, setLocalNiche] = useState(searchParams.get('niche') ?? '');
  const [localPlatform, setLocalPlatform] = useState(
    searchParams.get('platform') ?? '',
  );
  const [localMaxPrice, setLocalMaxPrice] = useState(
    Number(searchParams.get('maxPrice') ?? MAX_VAL),
  );

  // Track the previous URL string to know when we need to sync
  const [prevSearchStr, setPrevSearchStr] = useState(searchParams.toString());

  // 2. Optimized Render-Phase Sync
  // This ensures that if the user clicks "Back" in their browser,
  // the UI components snap back to the correct URL state.
  const currentSearchStr = searchParams.toString();
  if (currentSearchStr !== prevSearchStr) {
    setPrevSearchStr(currentSearchStr);
    setLocalNiche(searchParams.get('niche') ?? '');
    setLocalPlatform(searchParams.get('platform') ?? '');
    setLocalMaxPrice(Number(searchParams.get('maxPrice') ?? MAX_VAL));
  }

  // Determine if any filters are active (for the "Clear all" button)
  const hasFilters = localNiche || localPlatform || localMaxPrice < MAX_VAL;

  // 3. Action: Apply Filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (localNiche) params.set('niche', localNiche);
    else params.delete('niche');

    if (localPlatform) params.set('platform', localPlatform);
    else params.delete('platform');

    // If at 100k, we remove the filter to show "100k+" (unlimited)
    if (localMaxPrice < MAX_VAL) {
      params.set('maxPrice', localMaxPrice.toString());
    } else {
      params.delete('maxPrice');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <aside className="sticky top-8 bg-bg-card border border-border-theme rounded-theme p-6 shadow-theme">
      <div className="flex items-center justify-between mb-6">
        <span className="flex items-center gap-1.5 font-head font-bold text-[0.85rem] tracking-[0.06em] uppercase text-text-main">
          <SlidersHorizontal size={15} />
          Filters
        </span>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[0.75rem] text-accent font-body font-medium transition-opacity hover:opacity-70"
          >
            <X size={13} /> Clear all
          </button>
        )}
      </div>

      {/* Niche Selection */}
      <div className="mb-6 pb-6 border-b border-border-theme">
        <p className="font-head font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.07em] mb-3">
          Niche
        </p>
        <div className="flex flex-wrap gap-1.5">
          {NICHES.map((n) => (
            <button
              key={n}
              onClick={() => setLocalNiche(localNiche === n ? '' : n)}
              className={`px-3 py-1 rounded-full text-[0.75rem] font-medium border-[1.5px] transition-all capitalize ${
                localNiche === n
                  ? 'bg-accent border-accent text-white'
                  : 'bg-bg border-border-theme text-text-muted hover:border-accent'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Toggle */}
      <div className="mb-6 pb-6 border-b border-border-theme">
        <p className="font-head font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.07em] mb-3">
          Platform
        </p>
        <div className="flex gap-2">
          {['tiktok', 'instagram'].map((p) => (
            <button
              key={p}
              onClick={() => setLocalPlatform(localPlatform === p ? '' : p)}
              className={`flex-1 py-2 rounded-lg font-head font-semibold text-[0.78rem] border-[1.5px] transition-all ${
                localPlatform === p
                  ? 'bg-accent-light border-accent text-accent'
                  : 'bg-bg border-border-theme text-text-muted hover:border-accent'
              }`}
            >
              {p === 'tiktok' ? 'TikTok' : 'Instagram'}
            </button>
          ))}
        </div>
      </div>

      {/* Max Budget Slider */}
      <div className="mb-8">
        <p className="flex justify-between items-center font-head font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.07em] mb-3">
          Max Budget
          <span className="font-body font-semibold text-[0.82rem] text-accent normal-case tracking-normal">
            ₱{localMaxPrice.toLocaleString('en-PH')}
            {localMaxPrice === MAX_VAL ? '+' : ''}
          </span>
        </p>
        <input
          type="range"
          min={PRICE_STEPS[0]}
          max={MAX_VAL}
          step={5000}
          value={localMaxPrice}
          onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
          className="w-full accent-accent cursor-pointer mb-2"
        />
        <div className="flex justify-between text-[0.72rem] text-text-light font-body">
          <span>₱5k</span>
          <span>₱100k+</span>
        </div>
      </div>

      {/* Primary Action */}
      <button
        onClick={applyFilters}
        className="w-full py-3 bg-accent text-white font-head font-bold text-sm rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"
      >
        Apply Filters
      </button>
    </aside>
  );
}
