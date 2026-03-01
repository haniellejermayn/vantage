import { getCreators } from '@/lib/supabase/queries/creators';
import { CreatorCard } from '@/components/shared/CreatorCard';
import { CreatorFilters } from './CreatorFilters';
import { Suspense } from 'react';
import { Search } from 'lucide-react';

type SearchParams = { niche?: string; platform?: string; maxPrice?: string };

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters = {
    niche: params.niche,
    platform: params.platform,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
  };

  const creators = await getCreators(filters);

  return (
    <div className="min-h-screen bg-bg text-text-main font-body">
      {/* Header */}
      <header className="border-b border-border-theme bg-bg py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-end justify-between">
          <div>
            <h1 className="font-head text-3xl lg:text-4xl font-extrabold tracking-tight text-text-main">
              Find your Creator
            </h1>
            <p className="mt-2 text-sm text-text-muted font-body">
              {creators.length} verified creator
              {creators.length !== 1 ? 's' : ''} ready to collaborate
            </p>
          </div>
        </div>
      </header>

      {/* Body: sidebar + grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 items-start">
        <Suspense fallback={null}>
          <CreatorFilters />
        </Suspense>

        <main className="min-w-0">
          {creators.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-8 text-center text-text-muted">
              <Search size={32} strokeWidth={1.5} />
              <p className="font-head font-semibold text-lg text-text-main">
                No creators match your filters.
              </p>
              <span className="text-sm">
                Try adjusting your niche, platform, or budget.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {creators.map((creator) => (
                <CreatorCard key={creator.username} creator={creator} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
