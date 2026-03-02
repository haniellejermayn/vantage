import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export type TikTokTier = Database['public']['Enums']['tiktok_tier'];
export type InstagramTier = Database['public']['Enums']['instagram_tier'];
export type VerificationStatus =
  Database['public']['Enums']['verification_status'];

// Export this so the component can use it!
export interface CreatorCardData {
  username: string;
  full_name: string;
  avatar_url: string | null;
  starting_price: number;
  verification_status: VerificationStatus;
  tiktok_tier: TikTokTier | null;
  instagram_tier: InstagramTier | null;
  niches: string[];
  avg_rating: number | null;
  review_count: number;
}

type CreatorProfile = Database['public']['Tables']['creator_profiles']['Row'];
type CreatorNiche = Database['public']['Tables']['creator_niches']['Row'];

type QueryCreator = Pick<
  CreatorProfile,
  | 'username'
  | 'full_name'
  | 'starting_price'
  | 'verification_status'
  | 'tiktok_tier'
  | 'instagram_tier'
  | 'profile_id'
  | 'avatar_url'
> & {
  creator_niches: Pick<CreatorNiche, 'niche'>[] | null;
};

export async function getCreators(filters: {
  niche?: string;
  platform?: string;
  maxPrice?: number;
}): Promise<CreatorCardData[]> {
  const supabase = await createClient();

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

  const typedCreators = creatorsData as unknown as QueryCreator[];
  const nicheParam = filters.niche;
  const selectedNiches = nicheParam ? nicheParam.split(',') : [];

  const filtered =
    selectedNiches.length > 0
      ? typedCreators.filter((c) =>
          c.creator_niches?.some((n) => selectedNiches.includes(n.niche)),
        )
      : typedCreators;

  if (filtered.length === 0) return [];

  const profileIds = filtered.map((c) => c.profile_id);
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('reviewee_id, rating')
    .in('reviewee_id', profileIds);

  const ratingsByProfileId = new Map<string, number[]>();
  for (const review of reviewsData ?? []) {
    const existing = ratingsByProfileId.get(review.reviewee_id) ?? [];
    existing.push(review.rating);
    ratingsByProfileId.set(review.reviewee_id, existing);
  }

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
