'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SlidersHorizontal, X, Check } from 'lucide-react';

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

  // 1. Local State (Arrays for multiselect)
  const [localNiches, setLocalNiches] = useState<string[]>(
    searchParams.get('niche')?.split(',').filter(Boolean) ?? [],
  );
  const [localPlatforms, setLocalPlatforms] = useState<string[]>(
    searchParams.get('platform')?.split(',').filter(Boolean) ?? [],
  );
  const [localMaxPrice, setLocalMaxPrice] = useState(
    Number(searchParams.get('maxPrice') ?? MAX_VAL),
  );

  const [prevSearchStr, setPrevSearchStr] = useState(searchParams.toString());
  const currentSearchStr = searchParams.toString();

  // 2. Optimized Render-Phase Sync
  if (currentSearchStr !== prevSearchStr) {
    setPrevSearchStr(currentSearchStr);
    setLocalNiches(searchParams.get('niche')?.split(',').filter(Boolean) ?? []);
    setLocalPlatforms(
      searchParams.get('platform')?.split(',').filter(Boolean) ?? [],
    );
    setLocalMaxPrice(Number(searchParams.get('maxPrice') ?? MAX_VAL));
  }

  const hasFilters =
    localNiches.length > 0 ||
    localPlatforms.length > 0 ||
    localMaxPrice < MAX_VAL;

  // Helper for toggling values in arrays
  const toggleValue = (list: string[], val: string) =>
    list.includes(val) ? list.filter((i) => i !== val) : [...list, val];

  // 3. Action: Apply Filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (localNiches.length > 0) params.set('niche', localNiches.join(','));
    else params.delete('niche');

    if (localPlatforms.length > 0)
      params.set('platform', localPlatforms.join(','));
    else params.delete('platform');

    if (localMaxPrice < MAX_VAL)
      params.set('maxPrice', localMaxPrice.toString());
    else params.delete('maxPrice');

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => router.push(pathname, { scroll: false });

  return (
    <aside className="sticky top-[4vh] w-full max-h-[90vh] overflow-y-auto overscroll-contain bg-bg-card border border-border-theme rounded-theme p-6 shadow-theme [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex items-center justify-between mb-6">
        <span className="flex items-center gap-1.5 font-head font-bold text-[0.85rem] tracking-[0.06em] uppercase text-text-main">
          <SlidersHorizontal size={14} />
          Filters
        </span>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[0.75rem] text-accent font-body font-medium transition-opacity hover:opacity-70"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Niche Section - Organized Checkbox List */}
      <div className="mb-6 pb-6 border-b border-border-theme">
        <p className="font-head font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.07em] mb-4">
          Niches
        </p>
        {/* Changed to a 2-column grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          {NICHES.map((n) => {
            const isActive = localNiches.includes(n);
            return (
              <label key={n} className="flex items-center group cursor-pointer">
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    isActive
                      ? 'bg-accent border-accent'
                      : 'border-border-theme bg-bg group-hover:border-accent'
                  }`}
                >
                  {isActive && (
                    <Check size={10} className="text-white" strokeWidth={4} />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isActive}
                  onChange={() => setLocalNiches(toggleValue(localNiches, n))}
                />
                <span
                  className={`ml-2.5 text-sm font-body capitalize truncate transition-colors ${
                    isActive ? 'text-text-main font-medium' : 'text-text-muted'
                  }`}
                >
                  {n}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Platform Section - Pill Toggle */}
      <div className="mb-6 pb-6 border-b border-border-theme">
        <p className="font-head font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.07em] mb-4">
          Platforms
        </p>
        <div className="flex gap-2">
          {['tiktok', 'instagram'].map((p) => {
            const isActive = localPlatforms.includes(p);
            return (
              <button
                key={p}
                onClick={() =>
                  setLocalPlatforms(toggleValue(localPlatforms, p))
                }
                className={`flex-1 py-2 rounded-lg font-head font-semibold text-[0.78rem] border-[1.5px] transition-all capitalize ${
                  isActive
                    ? 'bg-accent-light border-accent text-accent'
                    : 'bg-bg border-border-theme text-text-muted hover:border-accent'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget Slider */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <p className="font-head font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.07em]">
            Max Budget
          </p>
          <span className="font-body font-semibold text-[0.82rem] text-accent">
            ₱{localMaxPrice.toLocaleString('en-PH')}
            {localMaxPrice === MAX_VAL ? '+' : ''}
          </span>
        </div>
        <input
          type="range"
          min={PRICE_STEPS[0]}
          max={MAX_VAL}
          step={5000}
          value={localMaxPrice}
          onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
          className="w-full accent-accent cursor-pointer h-1.5 rounded-lg appearance-none bg-border-theme"
        />
        <div className="flex justify-between mt-2 text-[0.72rem] text-text-light font-body">
          <span>₱5k</span>
          <span>₱100k+</span>
        </div>
      </div>

      <button
        onClick={applyFilters}
        className="w-full py-3 bg-accent text-white font-head font-bold text-sm rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-sm"
      >
        Apply Filters
      </button>
    </aside>
  );
}
