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

  const toggleValue = (list: string[], val: string) =>
    list.includes(val) ? list.filter((i) => i !== val) : [...list, val];

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

  const pricePercent =
    ((localMaxPrice - PRICE_STEPS[0]) / (MAX_VAL - PRICE_STEPS[0])) * 100;

  return (
    <aside className="sticky top-24 w-full h-fit bg-bg-card border border-border-theme rounded-theme p-6 shadow-theme">
      <div className="flex items-center justify-between mb-5">
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

      {/* Niche Section - Slightly tighter margins */}
      <div className="mb-5 pb-5 border-b border-border-theme">
        <p className="font-head font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.07em] mb-3.5">
          Niches
        </p>
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
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
                  className={`ml-2.5 text-sm font-body capitalize truncate transition-colors ${isActive ? 'text-text-main font-medium' : 'text-text-muted'}`}
                >
                  {n}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Platform Section */}
      <div className="mb-5 pb-5 border-b border-border-theme">
        <p className="font-head font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.07em] mb-3.5">
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
                className={`flex-1 py-1.5 rounded-lg font-head font-semibold text-[0.78rem] border-[1.5px] transition-all capitalize ${
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
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
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
          className="w-full h-1.5 appearance-none rounded-lg cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-none"
          style={{
            background: `linear-gradient(to right, var(--color-accent) ${pricePercent}%, var(--color-border-theme) ${pricePercent}%)`,
          }}
        />

        <div className="flex justify-between mt-2 text-[0.72rem] text-text-light font-body">
          <span>₱5k</span>
          <span>₱100k+</span>
        </div>
      </div>

      <button
        onClick={applyFilters}
        className="w-full py-2.5 bg-accent text-white font-head font-bold text-sm rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-sm"
      >
        Apply Filters
      </button>
    </aside>
  );
}
