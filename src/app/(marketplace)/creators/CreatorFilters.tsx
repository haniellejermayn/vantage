'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
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

export function CreatorFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const niche = searchParams.get('niche') ?? '';
  const platform = searchParams.get('platform') ?? '';
  const maxPrice = Number(
    searchParams.get('maxPrice') ?? PRICE_STEPS[PRICE_STEPS.length - 1],
  );

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const hasFilters =
    niche || platform || maxPrice < PRICE_STEPS[PRICE_STEPS.length - 1];

  const clearAll = () => router.push(pathname, { scroll: false });

  return (
    <aside className="filters-panel">
      <div className="filters-header">
        <span className="filters-title">
          <SlidersHorizontal size={15} />
          Filters
        </span>
        {hasFilters && (
          <button onClick={clearAll} className="clear-btn">
            <X size={13} /> Clear all
          </button>
        )}
      </div>

      {/* Niche */}
      <div className="filter-section">
        <p className="filter-label">Niche</p>
        <div className="niche-grid">
          {NICHES.map((n) => (
            <button
              key={n}
              onClick={() => updateParam('niche', niche === n ? '' : n)}
              className={`niche-chip ${niche === n ? 'niche-chip--active' : ''}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Platform */}
      <div className="filter-section">
        <p className="filter-label">Platform</p>
        <div className="platform-toggle">
          {['tiktok', 'instagram'].map((p) => (
            <button
              key={p}
              onClick={() => updateParam('platform', platform === p ? '' : p)}
              className={`platform-btn ${platform === p ? 'platform-btn--active' : ''}`}
            >
              {p === 'tiktok' ? 'TikTok' : 'Instagram'}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price */}
      <div className="filter-section">
        <p className="filter-label">
          Max Budget
          <span className="price-display">
            ₱{maxPrice.toLocaleString('en-PH')}
          </span>
        </p>
        <input
          type="range"
          min={PRICE_STEPS[0]}
          max={PRICE_STEPS[PRICE_STEPS.length - 1]}
          step={1000}
          value={maxPrice}
          onChange={(e) => updateParam('maxPrice', e.target.value)}
          className="price-range"
        />
        <div className="price-range-labels">
          <span>₱5k</span>
          <span>₱100k</span>
        </div>
      </div>
    </aside>
  );
}
