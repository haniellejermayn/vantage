import Link from 'next/link';
import { BadgeCheck, Star } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreatorCardData = {
  username: string;
  full_name: string;
  avatar_url: string | null;
  starting_price: number;
  verification_status: string;
  tiktok_tier: string | null;
  instagram_tier: string | null;
  niches: string[];
  avg_rating: number | null;
  review_count: number;
};

const TIER_LABELS: Record<string, string> = {
  nano: 'Nano · 1k–10k',
  micro: 'Micro · 10k–50k',
  mid: 'Mid · 50k–100k',
  macro: 'Macro · 100k+',
};

const NICHE_COLORS: Record<string, string> = {
  beauty: 'bg-rose-100 text-rose-700',
  tech: 'bg-sky-100 text-sky-700',
  food: 'bg-amber-100 text-amber-700',
  fashion: 'bg-purple-100 text-purple-700',
  lifestyle: 'bg-emerald-100 text-emerald-700',
  fitness: 'bg-orange-100 text-orange-700',
  travel: 'bg-teal-100 text-teal-700',
  gaming: 'bg-indigo-100 text-indigo-700',
};

function TikTokSVG() {
  return (
    <svg
      className="platform-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

function InstagramSVG() {
  return (
    <svg
      className="platform-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreatorCard({ creator }: { creator: CreatorCardData }) {
  const isVerified = creator.verification_status === 'verified';
  const initials = creator.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link href={`/creators/${creator.username}`} className="creator-card">
      <div className="card-inner">
        {/* Avatar */}
        <div className="avatar-wrap">
          {creator.avatar_url ? (
            <img
              src={creator.avatar_url}
              alt={creator.full_name}
              className="avatar-img"
            />
          ) : (
            <div className="avatar-fallback">{initials}</div>
          )}
          {isVerified && (
            <span className="verified-dot" title="Verified Creator">
              <BadgeCheck size={14} strokeWidth={2.5} />
            </span>
          )}
        </div>

        {/* Name + rating */}
        <div className="name-row">
          <span className="creator-name">{creator.full_name}</span>
          {creator.avg_rating !== null && (
            <span className="rating">
              <Star size={11} fill="currentColor" />
              {creator.avg_rating.toFixed(1)}
              <span className="review-count">({creator.review_count})</span>
            </span>
          )}
        </div>

        <p className="username">@{creator.username}</p>

        {/* Niches */}
        {creator.niches.length > 0 && (
          <div className="niches">
            {creator.niches.slice(0, 3).map((niche) => (
              <span
                key={niche}
                className={`niche-badge ${NICHE_COLORS[niche] ?? 'bg-stone-100 text-stone-600'}`}
              >
                {niche}
              </span>
            ))}
          </div>
        )}

        {/* Platforms */}
        <div className="platforms">
          {creator.tiktok_tier && (
            <div className="platform-pill">
              <TikTokSVG />
              <span>{TIER_LABELS[creator.tiktok_tier]}</span>
            </div>
          )}
          {creator.instagram_tier && (
            <div className="platform-pill">
              <InstagramSVG />
              <span>{TIER_LABELS[creator.instagram_tier]}</span>
            </div>
          )}
        </div>

        {/* Price CTA */}
        <div className="card-footer">
          <span className="price-label">starts at</span>
          <span className="price">
            ₱{creator.starting_price.toLocaleString('en-PH')}
          </span>
          <span className="book-cta">Book →</span>
        </div>
      </div>
    </Link>
  );
}
