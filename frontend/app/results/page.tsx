"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

const BACKEND_URL = "http://localhost:8000";

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

const platformColors: Record<string, string> = {
  "99acres": "text-blue-400 border-blue-400/30 bg-blue-400/10",
  NoBroker: "text-green-400 border-green-400/30 bg-green-400/10",
  MagicBricks: "text-purple-400 border-purple-400/30 bg-purple-400/10",
};

export default function ResultsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BACKEND_URL}/results`)
      .then((r) => r.json())
      .then((data) => {
        setListings(data.results ?? data.listings ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-orange-500/30 border-t-orange-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              TrueNest AI
            </p>
            <h1 className="text-lg font-bold text-white">Your Best Matches</h1>
          </div>
          <Link
            href="/call"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:border-orange-500/30 hover:text-orange-400"
          >
            ← New Search
          </Link>
        </div>
      </header>

      {/* Listings grid */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {listings.length === 0 ? (
          <div className="py-24 text-center text-gray-500">
            No results found. <Link href="/call" className="text-orange-400 underline">Try a new search.</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, i) => (
              <ListingCard
                key={listing.id ?? i}
                listing={listing}
                expanded={expanded === listing.id}
                onToggle={() => setExpanded(expanded === listing.id ? null : listing.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ListingCard({
  listing,
  expanded,
  onToggle,
}: {
  listing: Listing;
  expanded: boolean;
  onToggle: () => void;
}) {
  const platformClass =
    platformColors[listing.platform] ??
    "text-orange-400 border-orange-400/30 bg-orange-400/10";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
    >
      <div className="p-5 space-y-4">
        {/* Platform + score */}
        <div className="flex items-center justify-between">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${platformClass}`}
          >
            {listing.platform}
          </span>
          {listing.match_score != null && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all"
                  style={{ width: `${listing.match_score}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-orange-400">
                {listing.match_score}%
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <h2 className="font-semibold text-white">{listing.title}</h2>
          <p className="text-sm text-gray-400">{listing.society}</p>
          <p className="mt-0.5 text-xs text-gray-500">{listing.address}</p>
        </div>

        {/* Price */}
        <div>
          <p className="text-2xl font-bold text-white">
            ₹{listing.rent?.toLocaleString("en-IN")}
            <span className="text-sm font-normal text-gray-400">/mo</span>
          </p>
          {(listing.maintenance || listing.deposit) && (
            <p className="text-xs text-gray-500">
              {listing.maintenance
                ? `₹${listing.maintenance.toLocaleString("en-IN")} maint · `
                : ""}
              {listing.deposit
                ? `₹${listing.deposit.toLocaleString("en-IN")} deposit`
                : ""}
            </p>
          )}
        </div>

        {/* Details row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
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
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Owner contact */}
        {listing.owner && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Owner</p>
              <p className="text-sm font-semibold text-white">{listing.owner.name}</p>
            </div>
            <a
              href={`tel:${listing.owner.phone}`}
              className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition"
            >
              {listing.owner.phone}
            </a>
          </div>
        )}

        {/* Locality Intel toggle */}
        {listing.locality_intel && (
          <button
            type="button"
            onClick={onToggle}
            className="w-full text-left text-xs font-semibold text-orange-400 hover:text-orange-300 transition"
          >
            {expanded ? "▲ Hide Locality Intel" : "▼ View Locality Intel"}
          </button>
        )}
      </div>

      {/* Locality Intel panel */}
      {expanded && listing.locality_intel && (
        <LocalityPanel intel={listing.locality_intel} />
      )}
    </motion.article>
  );
}

function LocalityPanel({
  intel,
}: {
  intel: NonNullable<Listing["locality_intel"]>;
}) {
  return (
    <div className="border-t border-white/10 bg-black/40 p-5 space-y-4 text-sm">
      {/* Rating */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Overall Rating</span>
        <span className="font-bold text-orange-400">{intel.overall_rating} / 5</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: "AQI", value: intel.aqi },
          { label: "Noise", value: intel.noise_db ? `${intel.noise_db} dB` : null },
          { label: "Traffic", value: intel.traffic_delay },
          { label: "Water", value: intel.water_supply },
          { label: "Internet", value: intel.internet },
          { label: "Power Backup", value: intel.power_backup },
          { label: "Safety", value: intel.safety },
        ]
          .filter((s) => s.value != null)
          .map((stat) => (
            <div key={stat.label} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
              <p className="text-gray-500">{stat.label}</p>
              <p className="font-semibold text-white">{stat.value}</p>
            </div>
          ))}
      </div>

      {/* Pros */}
      {intel.pros && intel.pros.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-green-400">Pros</p>
          <ul className="space-y-1">
            {intel.pros.map((p) => (
              <li key={p} className="flex gap-1.5 text-xs text-gray-300">
                <span className="text-green-400">✓</span> {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Red flags */}
      {intel.red_flags && intel.red_flags.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-red-400">Red Flags</p>
          <ul className="space-y-1">
            {intel.red_flags.map((f) => (
              <li key={f} className="flex gap-1.5 text-xs text-gray-300">
                <span className="text-red-400">⚠</span> {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
