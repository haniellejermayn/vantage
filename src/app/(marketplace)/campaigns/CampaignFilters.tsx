'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import { type BudgetRange } from '@/lib/supabase/queries/campaigns';

const BUDGET_TIERS: { label: string; value: BudgetRange }[] = [
  { label: 'Under ₱5,000', value: 'under_5k' },
  { label: '₱5,000 - ₱10,000', value: '5k_10k' },
  { label: '₱10,000 - ₱20,000', value: '10k_20k' },
  { label: '₱20,000 - ₱50,000', value: '20k_50k' },
  { label: '₱50,000+', value: '50k_above' },
];

export function CampaignFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Local State
  const [localBudget, setLocalBudget] = useState<string>(
    searchParams.get('budget') ?? '',
  );

  const [prevSearchStr, setPrevSearchStr] = useState(searchParams.toString());
  const currentSearchStr = searchParams.toString();

  // 2. Optimized Render-Phase Sync
  if (currentSearchStr !== prevSearchStr) {
    setPrevSearchStr(currentSearchStr);
    setLocalBudget(searchParams.get('budget') ?? '');
  }

  const hasFilters = localBudget !== '';

  // 3. Action: Apply Filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (localBudget) params.set('budget', localBudget);
    else params.delete('budget');

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => router.push(pathname, { scroll: false });

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

      {/* Budget Range Section */}
      <div className="mb-6 pb-6 border-b border-border-theme">
        <p className="font-head font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.07em] mb-3.5">
          Budget Range
        </p>
        <div className="flex flex-col gap-3">
          {BUDGET_TIERS.map((tier) => {
            const isActive = localBudget === tier.value;
            return (
              <label
                key={tier.value}
                className="flex items-center group cursor-pointer"
              >
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isActive
                      ? 'bg-accent border-accent'
                      : 'border-border-theme bg-bg group-hover:border-accent'
                  }`}
                >
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
                <input
                  type="radio"
                  name="budget"
                  className="hidden"
                  checked={isActive}
                  onChange={() => setLocalBudget(isActive ? '' : tier.value)}
                />
                <span
                  className={`ml-2.5 text-sm font-body transition-colors ${
                    isActive ? 'text-text-main font-medium' : 'text-text-muted'
                  }`}
                >
                  {tier.label}
                </span>
              </label>
            );
          })}
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
