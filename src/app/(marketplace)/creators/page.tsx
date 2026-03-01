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
      {/* Editorial Hero Section */}
      <header className="pt-12 pb-12 lg:pt-6 lg:pb-6 relative overflow-hidden border-b border-border-theme">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Side: Typography */}
          <div className="w-full lg:w-[55%]">
            <h1 className="font-head text-4xl lg:text-5xl font-extrabold tracking-tight text-text-main mb-5 leading-[1.1]">
              Find the perfect <br />
              <span className="text-accent italic font-serif pr-2">
                Creator
              </span>{' '}
              for your brand
            </h1>
            <p className="text-base lg:text-lg text-text-muted font-body leading-relaxed max-w-lg">
              Browse verified professionals ready to produce high-conversion
              content. Filter by niche, platform, and budget.
            </p>
          </div>

          {/* Right Side: Step-by-Step Process */}
          <div className="hidden lg:block w-full lg:w-[35%]">
            <div className="border-l border-border-theme pl-8 py-2">
              <h3 className="font-head text-xs font-bold text-accent tracking-[0.15em] uppercase mb-6">
                How It Works
              </h3>
              <ul className="space-y-5">
                <li className="flex flex-col gap-1">
                  <span className="font-head font-bold text-text-main tracking-tight">
                    01. Discover Talent
                  </span>
                  <span className="font-body text-[0.82rem] text-text-muted leading-relaxed pr-4">
                    Find creators that perfectly match your brand&apos;s niche
                    and budget.
                  </span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="font-head font-bold text-text-main tracking-tight">
                    02. Connect & Align
                  </span>
                  <span className="font-body text-[0.82rem] text-text-muted leading-relaxed pr-4">
                    Send a campaign brief, negotiate terms, and finalize
                    deliverables directly.
                  </span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="font-head font-bold text-text-main tracking-tight">
                    03. Collaborate
                  </span>
                  <span className="font-body text-[0.82rem] text-text-muted leading-relaxed pr-4">
                    Review drafts, request revisions, and log payment
                    confirmations seamlessly.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      </header>

      {/* Body: sidebar + grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
        <Suspense fallback={null}>
          <CreatorFilters />
        </Suspense>

        <main className="min-w-0">
          {creators.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 px-8 text-center bg-bg-card border border-border-theme rounded-theme shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent">
                <Search size={24} strokeWidth={2} />
              </div>
              <div>
                <p className="font-head font-bold text-lg text-text-main mb-1">
                  No creators found
                </p>
                <p className="text-sm text-text-muted">
                  Try adjusting your niche, platform, or budget filters.
                </p>
              </div>
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
