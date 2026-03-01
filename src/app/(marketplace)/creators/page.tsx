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
  avatar_url: string | null; // <-- Directly on the object now
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
    <>
      <style>{styles}</style>
      <div className="page-root">
        {/* Header */}
        <header className="page-header">
          <div className="header-inner">
            <div>
              <h1 className="page-title">Find your Creator</h1>
              <p className="page-sub">
                {creators.length} verified creator
                {creators.length !== 1 ? 's' : ''} ready to collaborate
              </p>
            </div>
          </div>
        </header>

        {/* Body: sidebar + grid */}
        <div className="page-body">
          <Suspense fallback={null}>
            <CreatorFilters />
          </Suspense>

          <main className="grid-area">
            {creators.length === 0 ? (
              <div className="empty-state">
                <Search size={32} strokeWidth={1.5} />
                <p>No creators match your filters.</p>
                <span>Try adjusting your niche, platform, or budget.</span>
              </div>
            ) : (
              <div className="creators-grid">
                {creators.map((creator) => (
                  <CreatorCard key={creator.username} creator={creator} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  :root {
    --bg:           #FDFCF7;
    --bg-card:      #FFFFFF;
    --accent:       #3D5A80;
    --accent-light: #EBF0F7;
    --text:         #1C1917;
    --text-muted:   #78716C;
    --text-light:   #A8A29E;
    --border:       #E8E3DC;
    --shadow:       0 2px 16px rgba(28,25,23,0.07);
    --shadow-hover: 0 8px 32px rgba(28,25,23,0.13);
    --radius:       14px;
    --font-head:    'Plus Jakarta Sans', sans-serif;
    --font-body:    'DM Sans', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .page-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: var(--font-body);
    color: var(--text);
  }

  /* ── Header ── */
  .page-header {
    border-bottom: 1px solid var(--border);
    background: var(--bg);
    padding: 40px 0 32px;
  }
  .header-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }
  .page-title {
    font-family: var(--font-head);
    font-size: 2.25rem;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.03em;
    line-height: 1.1;
  }
  .page-sub {
    margin-top: 6px;
    font-size: 0.9rem;
    color: var(--text-muted);
    font-family: var(--font-body);
  }

  /* ── Layout ── */
  .page-body {
    max-width: 1280px;
    margin: 0 auto;
    padding: 40px 32px;
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 40px;
    align-items: start;
  }

  /* ── Filters ── */
  .filters-panel {
    position: sticky;
    top: 32px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    box-shadow: var(--shadow);
  }
  .filters-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .filters-title {
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: var(--font-head);
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text);
  }
  .clear-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--accent);
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
    font-weight: 500;
    padding: 0;
    transition: opacity 0.15s;
  }
  .clear-btn:hover { opacity: 0.7; }

  .filter-section {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
  }
  .filter-section:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  .filter-label {
    font-size: 0.78rem;
    font-weight: 600;
    font-family: var(--font-head);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .price-display {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.82rem;
    color: var(--accent);
    text-transform: none;
    letter-spacing: 0;
  }

  .niche-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .niche-chip {
    padding: 5px 11px;
    border-radius: 99px;
    font-size: 0.75rem;
    font-weight: 500;
    font-family: var(--font-body);
    background: var(--bg);
    border: 1.5px solid var(--border);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s;
    text-transform: capitalize;
  }
  .niche-chip:hover { border-color: var(--accent); color: var(--accent); }
  .niche-chip--active {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }

  .platform-toggle {
    display: flex;
    gap: 8px;
  }
  .platform-btn {
    flex: 1;
    padding: 8px;
    border-radius: 8px;
    font-size: 0.78rem;
    font-weight: 600;
    font-family: var(--font-head);
    background: var(--bg);
    border: 1.5px solid var(--border);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s;
  }
  .platform-btn:hover { border-color: var(--accent); color: var(--accent); }
  .platform-btn--active {
    background: var(--accent-light);
    border-color: var(--accent);
    color: var(--accent);
  }

  .price-range {
    width: 100%;
    accent-color: var(--accent);
    cursor: pointer;
    margin-bottom: 8px;
  }
  .price-range-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
    color: var(--text-light);
    font-family: var(--font-body);
  }

  /* ── Grid ── */
  .grid-area { min-width: 0; }

  .creators-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }

  /* ── Creator Card ── */
  .creator-card { display: block; text-decoration: none; color: inherit; }

  .card-inner {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 22px 20px 18px;
    box-shadow: var(--shadow);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    height: 100%;
  }
  .creator-card:hover .card-inner {
    transform: translateY(-3px);
    box-shadow: var(--shadow-hover);
    border-color: #D4C8BF;
  }

  .avatar-wrap {
    position: relative;
    width: 54px;
    height: 54px;
    margin-bottom: 14px;
  }
  .avatar-img {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border);
  }
  .avatar-fallback {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6B8FB5, #3D5A80);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-head);
    font-weight: 800;
    font-size: 1rem;
    color: #fff;
    letter-spacing: -0.02em;
  }
  .verified-dot {
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 20px;
    height: 20px;
    background: var(--accent);
    border-radius: 50%;
    border: 2px solid var(--bg-card);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .name-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 2px;
  }
  .creator-name {
    font-family: var(--font-head);
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--text);
    line-height: 1.2;
  }
  .rating {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 0.72rem;
    font-weight: 600;
    color: #D97706;
    font-family: var(--font-body);
  }
  .review-count {
    color: var(--text-light);
    font-weight: 400;
    margin-left: 1px;
  }

  .username {
    font-size: 0.75rem;
    color: var(--text-light);
    margin-bottom: 12px;
    font-family: var(--font-body);
  }

  .niches {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 11px;
  }
  .niche-badge {
    padding: 3px 9px;
    border-radius: 99px;
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: capitalize;
    font-family: var(--font-head);
    letter-spacing: 0.01em;
  }

  .platforms {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 16px;
  }
  .platform-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    color: var(--text-muted);
    font-family: var(--font-body);
    font-weight: 500;
  }
  .platform-icon {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }
  .tiktok-icon { color: var(--text); }
  .ig-icon { color: #C13584; }

  .card-footer {
    display: flex;
    align-items: baseline;
    gap: 5px;
    padding-top: 14px;
    border-top: 1px solid var(--border);
  }
  .price-label {
    font-size: 0.68rem;
    color: var(--text-light);
    font-family: var(--font-body);
  }
  .price {
    font-family: var(--font-head);
    font-weight: 800;
    font-size: 1rem;
    color: var(--text);
    flex: 1;
    letter-spacing: -0.02em;
  }
  .book-cta {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--accent);
    font-family: var(--font-head);
    opacity: 0;
    transform: translateX(-4px);
    transition: all 0.18s ease;
  }
  .creator-card:hover .book-cta {
    opacity: 1;
    transform: translateX(0);
  }

  /* ── Empty state ── */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 80px 32px;
    color: var(--text-muted);
    text-align: center;
  }
  .empty-state p {
    font-family: var(--font-head);
    font-weight: 600;
    font-size: 1.05rem;
    color: var(--text);
  }
  .empty-state span {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .page-body {
      grid-template-columns: 1fr;
      padding: 24px 20px;
    }
    .filters-panel { position: static; }
    .page-title { font-size: 1.75rem; }
    .header-inner { padding: 0 20px; }
  }
`;
