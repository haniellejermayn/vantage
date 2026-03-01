import { createClient } from '@/lib/supabase/server';
import { type CreatorCardData } from '@/components/shared/CreatorCard';

// Centralize types here or in a separate types/ database.types.ts file
export type TierValue = 'nano' | 'micro' | 'mid' | 'macro';
export type VerificationValue =
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

export async function getCreators(filters: {
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

  if (filters.maxPrice && filters.maxPrice < 100000) {
    query = query.lte('starting_price', filters.maxPrice);
  }

  if (filters.platform === 'tiktok') {
    query = query.not('tiktok_tier', 'is', null);
  } else if (filters.platform === 'instagram') {
    query = query.not('instagram_tier', 'is', null);
  }

  const { data: creatorsData, error: creatorsError } = await query;
  if (creatorsError || !creatorsData) {
    console.error('Supabase Query Error:', creatorsError);
    return [];
  }

  const typedCreators = creatorsData as unknown as RawCreator[];

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
      avatar_url: c.avatar_url,
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
