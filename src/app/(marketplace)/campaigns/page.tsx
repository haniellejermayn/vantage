import { getCampaigns, type BudgetRange } from '@/lib/supabase/api/campaigns';
import { CampaignCard } from '@/components/shared/CampaignCard';
import { CampaignFilters } from './CampaignFilters';
import { Suspense } from 'react';
import { Search } from 'lucide-react';

type SearchParams = { budget?: string };

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters = {
    budgetRange: params.budget as BudgetRange | undefined,
  };

  const campaigns = await getCampaigns(filters);

  return (
    <div className="min-h-screen bg-bg text-text-main font-body">
      {/* Editorial Hero Section */}
      <header className="pt-12 pb-12 lg:pt-6 lg:pb-6 relative overflow-hidden border-b border-border-theme">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Side: Typography */}
          <div className="w-full lg:w-[55%]">
            <h1 className="font-head text-4xl lg:text-5xl font-extrabold tracking-tight text-text-main mb-5 leading-[1.1]">
              Find your next <br />
              <span className="text-accent italic font-serif pr-2">
                Campaign
              </span>
            </h1>
            <p className="text-base lg:text-lg text-text-muted font-body leading-relaxed max-w-lg">
              Browse open opportunities from top brands. Pitch your creative
              vision and secure high-value partnerships.
            </p>
          </div>

          {/* Right Side: Step-by-Step Process */}
          <div className="hidden lg:block w-full lg:w-[35%]">
            <div className="border-l border-border-theme pl-8 py-2">
              <h3 className="font-head text-xs font-bold text-accent tracking-[0.15em] uppercase mb-6">
                The Process
              </h3>
              <ul className="space-y-5">
                <li className="flex flex-col gap-1">
                  <span className="font-head font-bold text-text-main tracking-tight">
                    01. Browse & Pitch
                  </span>
                  <span className="font-body text-[0.82rem] text-text-muted leading-relaxed pr-4">
                    Review campaign briefs and submit tailored pitches directly
                    to brands.
                  </span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="font-head font-bold text-text-main tracking-tight">
                    02. Negotiate Terms
                  </span>
                  <span className="font-body text-[0.82rem] text-text-muted leading-relaxed pr-4">
                    Align on deliverables, timelines, and finalize the scope of
                    work.
                  </span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="font-head font-bold text-text-main tracking-tight">
                    03. Create & Earn
                  </span>
                  <span className="font-body text-[0.82rem] text-text-muted leading-relaxed pr-4">
                    Submit drafts, execute revisions, and receive direct
                    payments upon completion.
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
          <CampaignFilters />
        </Suspense>

        <main className="min-w-0">
          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 px-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent">
                <Search size={24} strokeWidth={2} />
              </div>
              <div>
                <p className="font-head font-bold text-lg text-text-main mb-1">
                  No campaigns found
                </p>
                <p className="text-sm text-text-muted">
                  Check back later or try adjusting your budget filters.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
