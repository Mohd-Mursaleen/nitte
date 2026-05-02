"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const BACKEND_URL = "http://localhost:8000";

type SortKey = "match" | "rent_asc" | "rent_desc";

interface Listing {
  id: string;
  title: string;
  society: string;
  address: string;
  bhk: string;
  area_sqft: number;
  floor: string;
  rent: number;
  maintenance: number;
  deposit: number;
  furnishing: string;
  platform: string;
  match_score: number;
  tags?: string[];
  owner?: { name: string; phone: string };
  locality_intel?: {
    overall_rating: number;
    aqi: number;
    noise_db: number;
    traffic_delay: string;
    water_supply: string;
    internet: string;
    power_backup: string;
    safety: string;
    pros?: string[];
    red_flags?: string[];
  };
}

const platformStyle: Record<string, string> = {
  "99acres": "text-blue-700 bg-blue-50 border-blue-200",
  NoBroker: "text-emerald-700 bg-emerald-50 border-emerald-200",
  MagicBricks: "text-violet-700 bg-violet-50 border-violet-200",
};

function matchLabel(score: number): { text: string; color: string } {
  if (score >= 90) return { text: "Excellent match", color: "text-emerald-600" };
  if (score >= 75) return { text: "Strong match", color: "text-[#c8a96e]" };
  if (score >= 60) return { text: "Good match", color: "text-blue-600" };
  return { text: "Fair match", color: "text-[#9ca3af]" };
}

export default function ResultsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("match");

  useEffect(() => {
    fetch(`${BACKEND_URL}/results`)
      .then((r) => r.json())
      .then((data) => {
        setListings(data.results ?? data.listings ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sorted = [...listings].sort((a, b) => {
    if (sort === "match") return (b.match_score ?? 0) - (a.match_score ?? 0);
    if (sort === "rent_asc") return (a.rent ?? 0) - (b.rent ?? 0);
    if (sort === "rent_desc") return (b.rent ?? 0) - (a.rent ?? 0);
    return 0;
  });

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ef]">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-[#e8e3db] border-t-[#c8a96e]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#1a1714]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#e8e3db] bg-[#f7f4ef]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
          <div>
            <span
              style={{ fontFamily: "var(--font-display), sans-serif" }}
              className="text-xs font-bold uppercase tracking-[0.24em] text-[#c8a96e] block mb-0.5"
            >
              Ghosla
            </span>
            <h1
              style={{ fontFamily: "var(--font-display), sans-serif" }}
              className="text-base font-bold tracking-tight"
            >
              Your matches
            </h1>
          </div>
          <Link
            href="/call"
            className="text-sm text-[#9ca3af] hover:text-[#1a1714] transition-colors underline underline-offset-4 decoration-[#e8e3db]"
          >
            ← New search
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-8 py-8 space-y-8">
        {listings.length === 0 ? (
          <div className="py-32 text-center text-[#9ca3af]">
            No results found.{" "}
            <Link href="/call" className="text-[#c8a96e] underline underline-offset-2">
              Try a new search.
            </Link>
          </div>
        ) : (
          <>
            {/* Sort strip */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9ca3af] mr-2">{listings.length} homes found</span>
              {(
                [
                  { key: "match", label: "Best match" },
                  { key: "rent_asc", label: "Lowest rent" },
                  { key: "rent_desc", label: "Highest rent" },
                ] as { key: SortKey; label: string }[]
              ).map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSort(s.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    sort === s.key
                      ? "bg-[#1a1714] text-[#f7f4ef] border-[#1a1714]"
                      : "bg-white/60 text-[#6b635a] border-[#e8e3db] hover:border-[#1a1714]/20"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {sorted.map((listing, i) => (
                <ListingCard
                  key={listing.id ?? i}
                  listing={listing}
                  index={i}
                  expanded={expanded === listing.id}
                  onToggle={() =>
                    setExpanded(expanded === listing.id ? null : listing.id)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ListingCard({
  listing,
  index,
  expanded,
  onToggle,
}: {
  listing: Listing;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const pStyle =
    platformStyle[listing.platform] ??
    "text-[#6b635a] bg-[#f7f4ef] border-[#e8e3db]";
  const match = listing.match_score != null ? matchLabel(listing.match_score) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-[#e8e3db] bg-white overflow-hidden"
    >
      <div className="p-6 space-y-5">
        {/* Platform + match */}
        <div className="flex items-center justify-between">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${pStyle}`}
          >
            {listing.platform}
          </span>
          {match && (
            <span className={`text-xs font-semibold ${match.color}`}>
              {match.text}
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h2
            style={{ fontFamily: "var(--font-display), sans-serif" }}
            className="font-bold text-[#1a1714] leading-snug tracking-tight"
          >
            {listing.title}
          </h2>
          {listing.society && (
            <p className="text-sm text-[#6b635a] mt-0.5">{listing.society}</p>
          )}
          {listing.address && (
            <p className="text-xs text-[#9ca3af] mt-0.5">{listing.address}</p>
          )}
        </div>

        {/* Rent */}
        <div>
          <p
            style={{ fontFamily: "var(--font-display), sans-serif" }}
            className="text-2xl font-bold tracking-tight"
          >
            ₹{listing.rent?.toLocaleString("en-IN")}
            <span className="text-sm font-normal text-[#9ca3af]">/mo</span>
          </p>
          {(listing.maintenance || listing.deposit) && (
            <p className="text-xs text-[#9ca3af] mt-0.5">
              {listing.maintenance
                ? `₹${listing.maintenance.toLocaleString("en-IN")} maint · `
                : ""}
              {listing.deposit
                ? `₹${listing.deposit.toLocaleString("en-IN")} deposit`
                : ""}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#6b635a]">
          {listing.bhk && <span>{listing.bhk}</span>}
          {listing.area_sqft && <span>{listing.area_sqft} sqft</span>}
          {listing.floor && <span>Floor {listing.floor}</span>}
          {listing.furnishing && <span>{listing.furnishing}</span>}
        </div>

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {listing.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#e8e3db] bg-[#f7f4ef] px-2.5 py-0.5 text-xs text-[#6b635a]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Owner */}
        {listing.owner && (
          <div className="rounded-xl border border-[#e8e3db] bg-[#f7f4ef] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                Owner
              </p>
              <p className="text-sm font-semibold text-[#1a1714]">
                {listing.owner.name}
              </p>
            </div>
            <a
              href={`tel:${listing.owner.phone}`}
              className="px-4 py-2 rounded-full bg-[#1a1714] text-[#f7f4ef] text-xs font-semibold hover:bg-[#2d2925] transition-colors"
            >
              {listing.owner.phone}
            </a>
          </div>
        )}

        {/* Locality intel toggle */}
        {listing.locality_intel && (
          <button
            type="button"
            onClick={onToggle}
            className="w-full text-left text-xs font-semibold text-[#9ca3af] hover:text-[#1a1714] transition-colors flex items-center gap-1"
          >
            <span>{expanded ? "▲" : "▼"}</span>
            {expanded ? "Hide locality intel" : "View locality intel"}
          </button>
        )}
      </div>

      {/* Locality intel panel */}
      <AnimatePresence>
        {expanded && listing.locality_intel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <LocalityPanel intel={listing.locality_intel} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function LocalityPanel({
  intel,
}: {
  intel: NonNullable<Listing["locality_intel"]>;
}) {
  return (
    <div className="border-t border-[#e8e3db] bg-[#f7f4ef] p-5 space-y-5 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
          Locality Rating
        </span>
        <span
          style={{ fontFamily: "var(--font-display), sans-serif" }}
          className="font-bold text-[#c8a96e]"
        >
          {intel.overall_rating} / 5
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: "AQI", value: intel.aqi },
          { label: "Noise", value: intel.noise_db ? `${intel.noise_db} dB` : null },
          { label: "Traffic", value: intel.traffic_delay },
          { label: "Water", value: intel.water_supply },
          { label: "Internet", value: intel.internet },
          { label: "Power backup", value: intel.power_backup },
          { label: "Safety", value: intel.safety },
        ]
          .filter((s) => s.value != null)
          .map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[#e8e3db] bg-white px-3 py-2"
            >
              <p className="text-[#9ca3af] text-[10px] uppercase tracking-wide mb-0.5">
                {stat.label}
              </p>
              <p className="font-semibold text-[#1a1714]">{stat.value}</p>
            </div>
          ))}
      </div>

      {intel.pros && intel.pros.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Pros
          </p>
          <ul className="space-y-1.5">
            {intel.pros.map((p) => (
              <li key={p} className="flex gap-2 text-xs text-[#6b635a]">
                <span className="text-emerald-500 shrink-0">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {intel.red_flags && intel.red_flags.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-500">
            Red flags
          </p>
          <ul className="space-y-1.5">
            {intel.red_flags.map((f) => (
              <li key={f} className="flex gap-2 text-xs text-[#6b635a]">
                <span className="text-red-400 shrink-0">⚠</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
