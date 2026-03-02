'use client';

import { type CampaignCardData } from '@/lib/supabase/api/campaigns';
import {
  Building2,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const BUDGET_LABELS: Record<string, string> = {
  under_5k: 'Under ₱5,000',
  '5k_10k': '₱5,000 - ₱10,000',
  '10k_20k': '₱10,000 - ₱20,000',
  '20k_50k': '₱20,000 - ₱50,000',
  '50k_above': '₱50,000+',
};

export function CampaignCard({ campaign }: { campaign: CampaignCardData }) {
  const shortDesc =
    campaign.description.length > 120
      ? campaign.description.substring(0, 120) + '...'
      : campaign.description;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="group block h-full w-full text-left outline-none">
          <div className="flex flex-col h-full bg-bg-card border border-border-theme rounded-theme p-6 shadow-theme transition-all duration-200 hover:-translate-y-1 hover:shadow-theme-hover hover:border-[#D4C8BF]">
            {/* Header: Brand Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-border-theme bg-bg flex items-center justify-center">
                {campaign.brand_avatar_url ? (
                  <img
                    src={campaign.brand_avatar_url}
                    alt={campaign.brand_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2
                    size={18}
                    className="text-text-muted"
                    strokeWidth={1.5}
                  />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-head font-bold text-sm text-text-main truncate">
                  {campaign.brand_name}
                </h3>
                {campaign.industry && (
                  <p className="font-body text-xs text-text-muted truncate">
                    {campaign.industry}
                  </p>
                )}
              </div>
            </div>

            {/* Body: Campaign Title & Description */}
            <div className="flex-1">
              <h4 className="font-head font-extrabold text-lg text-text-main leading-tight mb-2 group-hover:text-accent transition-colors">
                {campaign.title}
              </h4>
              <p className="font-body text-[0.85rem] text-text-muted leading-relaxed mb-4">
                {shortDesc}
              </p>

              {/* Deliverables Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {campaign.deliverables.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded bg-bg border border-border-theme text-[0.65rem] font-head font-bold text-text-muted uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
                {campaign.deliverables.length > 3 && (
                  <span className="px-2 py-1 rounded bg-bg border border-border-theme text-[0.65rem] font-head font-bold text-text-muted">
                    +{campaign.deliverables.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border-theme flex items-center justify-between mt-auto">
              <div>
                <p className="text-[0.65rem] font-body text-text-muted uppercase tracking-wider mb-0.5">
                  Budget
                </p>
                <p className="font-head font-bold text-accent text-sm">
                  {BUDGET_LABELS[campaign.budget_range] || 'Negotiable'}
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs font-head font-bold text-accent opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                View Brief <ChevronRight size={14} strokeWidth={2.5} />
              </span>
            </div>
          </div>
        </button>
      </SheetTrigger>

      {/* The Sliding Drawer Content */}
      <SheetContent
        className="w-full sm:max-w-xl overflow-y-auto bg-bg border-l border-border-theme p-0 sm:p-0 flex flex-col 
                   data-[state=open]:animate-in data-[state=closed]:animate-out 
                   data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right 
                   duration-500 ease-in-out"
      >
        <div className="px-8 pt-10 pb-6 border-b border-border-theme bg-bg-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border-theme bg-bg flex items-center justify-center shadow-sm">
              {campaign.brand_avatar_url ? (
                <img
                  src={campaign.brand_avatar_url}
                  alt={campaign.brand_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2
                  size={24}
                  className="text-text-muted"
                  strokeWidth={1.5}
                />
              )}
            </div>
            <div>
              <h3 className="font-head font-bold text-lg text-text-main">
                {campaign.brand_name}
              </h3>
              {campaign.industry && (
                <p className="font-body text-sm text-text-muted">
                  {campaign.industry}
                </p>
              )}
            </div>
          </div>

          <SheetTitle className="font-head text-2xl md:text-3xl font-extrabold text-text-main leading-tight mb-4">
            {campaign.title}
          </SheetTitle>

          <div className="flex items-center gap-6">
            <div>
              <p className="text-[0.65rem] font-body text-text-muted uppercase tracking-wider mb-1">
                Campaign Budget
              </p>
              <p className="font-head font-bold text-accent text-base">
                {BUDGET_LABELS[campaign.budget_range] || 'Negotiable'}
              </p>
            </div>
            <div className="w-px h-8 bg-border-theme"></div>
            <div>
              <p className="text-[0.65rem] font-body text-text-muted uppercase tracking-wider mb-1">
                Posted
              </p>
              <p className="font-body font-medium text-text-main text-sm">
                {new Date(campaign.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 flex-1">
          <div className="mb-10">
            <h4 className="font-head font-bold text-sm text-text-main uppercase tracking-[0.08em] mb-4">
              Required Deliverables
            </h4>
            <ul className="space-y-3">
              {campaign.deliverables.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-accent shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <span className="font-body text-text-main leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-head font-bold text-sm text-text-main uppercase tracking-[0.08em] mb-4">
              Campaign Brief
            </h4>
            <div className="font-body text-[0.95rem] text-text-muted leading-loose whitespace-pre-wrap">
              {campaign.description}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border-theme bg-bg-card/80 p-6">
          <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent text-white font-head font-bold text-sm rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-sm">
            Submit Pitch <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
