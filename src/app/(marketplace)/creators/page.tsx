import { createClient } from '@/lib/supabase/server';
import {
  CreatorCard,
  type CreatorCardData,
} from '@/components/shared/CreatorCard';
import { CreatorFilters } from './CreatorFilters';
import { Suspense } from 'react';
import { Search } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type TierValue = 'nano' | 'micro' | 'mid' | 'macro';
type VerificationValue =
  | 'unverified'
  | 'pending_review'
  | 'verified'
  | 'rejected';

interface RawCreator {
  username: string;
  full_name: string;
  starting_price: number;
  verification_status: VerificationValue;
  tiktok_tier: TierValue | null;
  instagram_tier: TierValue | null;
  avatar_url: string | null;
  profile_id: string;
  creator_niches: { niche: string }[] | null;
}

interface RawReview {
  reviewee_id: string;
  rating: number;
}

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function getCreators(filters: {
  niche?: string;
  platform?: string;
  maxPrice?: number;
}): Promise<CreatorCardData[]> {
  const supabase = await createClient();

  // ── Query 1: creators ──────────────────────────────────────────
  let query = supabase
    .from('creator_profiles')
    .select(
      `
      username,
      full_name,
      starting_price,
      verification_status,
      tiktok_tier,
      instagram_tier,
      profile_id,
      avatar_url,
      creator_niches ( niche )
      `,
    )
    .eq('verification_status', 'verified')
    .order('starting_price', { ascending: true });

  if (filters.maxPrice) {
    query = query.lte('starting_price', filters.maxPrice);
  }

  if (filters.platform === 'tiktok') {
    query = query.not('tiktok_tier', 'is', null);
  } else if (filters.platform === 'instagram') {
    query = query.not('instagram_tier', 'is', null);
  }

  const { data: creatorsData, error: creatorsError } = await query;

  if (creatorsError) {
    console.error('Supabase Query Error:', creatorsError);
    return [];
  }

  if (!creatorsData || creatorsData.length === 0) {
    return [];
  }

  const typedCreators = creatorsData as unknown as RawCreator[];

  // Filter by niche in JS (Added optional chaining ?.)
  const filtered = filters.niche
    ? typedCreators.filter((c) =>
        c.creator_niches?.some((n) => n.niche === filters.niche),
      )
    : typedCreators;

  if (filtered.length === 0) return [];

  // ── Query 2: ratings ───────────────────────────────────────────
  const profileIds = filtered.map((c) => c.profile_id);

  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('reviewee_id, rating')
    .in('reviewee_id', profileIds);

  const typedReviews = (reviewsData ?? []) as unknown as RawReview[];

  // Group ratings by reviewee_id for O(1) lookup
  const ratingsByProfileId = new Map<string, number[]>();
  for (const review of typedReviews) {
    const existing = ratingsByProfileId.get(review.reviewee_id) ?? [];
    existing.push(review.rating);
    ratingsByProfileId.set(review.reviewee_id, existing);
  }

  // ── Map to CreatorCardData ─────────────────────────────────────
  return filtered.map((c) => {
    const ratings = ratingsByProfileId.get(c.profile_id) ?? [];
    const sum = ratings.reduce((a, b) => a + b, 0);
    const avg_rating = ratings.length
      ? Math.round((sum / ratings.length) * 10) / 10
      : null;

    return {
      username: c.username,
      full_name: c.full_name,
      avatar_url: c.avatar_url, // <-- Mapped directly
      starting_price: c.starting_price,
      verification_status: c.verification_status,
      tiktok_tier: c.tiktok_tier,
      instagram_tier: c.instagram_tier,
      niches: c.creator_niches?.map((n) => n.niche) ?? [],
      avg_rating,
      review_count: ratings.length,
    };
  });
}

// ─── Page ──────────────────────────────────────────────────────────────────────

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
