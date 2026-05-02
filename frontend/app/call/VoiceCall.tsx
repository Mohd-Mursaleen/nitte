"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || "http://localhost:8000";

type Stage = "idle" | "recording" | "analyzing";
type SessionData = Record<string, string>;

// Hardcoded session — used when mic is tapped (mimics a real voice session)
const HARDCODED_SESSION: SessionData = {
  name: "Mohammed Mursaleen",
  age: "28",
  gender: "male",
  locality: "Electronic City",
  suggested_locality_choice: "Electronic City Phase 1 or Phase 2",
  budget_range: "20000-25000",
  bhk_type: "2 BHK",
  furnishing_type: "fully-furnished",
  lifestyle_preference: "active healthy fitness-focused",
  workplace_location: "Electronic City",
  max_commute_time: "30 minutes",
  amenities_required: "gym swimming pool jogging track",
  deal_breakers: "high AQI no gym far from office",
  priorities: "gym access low AQI short commute to Electronic City",
  user_type: "working professional",
  living_type: "bachelor",
  primary_priority: "health and fitness infrastructure",
  nearby_requirements: "gym hospital pharmacy supermarket",
  occupancy_type: "single",
  kids: "no",
  has_locality: "yes",
};

const WAVE_HEIGHTS = Array.from(
  { length: 28 },
  () => Math.floor(Math.random() * 34) + 8,
);

const lightBg: React.CSSProperties = {
  backgroundColor: "#e2ded7",
  backgroundImage: [
    "radial-gradient(ellipse 70% 55% at 0% 0%, rgba(214,166,63,0.20) 0%, transparent 55%)",
    "radial-gradient(ellipse 60% 50% at 100% 100%, rgba(214,166,63,0.14) 0%, transparent 55%)",
    "radial-gradient(rgba(26,23,20,0.10) 1.2px, transparent 1.2px)",
  ].join(", "),
  backgroundSize: "100% 100%, 100% 100%, 24px 24px",
};

const inputBase: React.CSSProperties = {
  width: "100%",
  backgroundColor: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(26,23,20,0.13)",
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 14,
  color: "#1a1714",
  outline: "none",
  transition: "border-color 0.15s",
  fontFamily: "inherit",
};

function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function VoiceCall() {
  const [stage, setStage] = useState<Stage>("idle");
  const [session, setSession] = useState<SessionData>(HARDCODED_SESSION);
  const router = useRouter();

  return (
    <main className="min-h-screen text-[#1a1714]" style={lightBg}>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 border-b backdrop-blur-md"
        style={{
          backgroundColor: "rgba(226,222,215,0.92)",
          borderColor: "rgba(26,23,20,0.1)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            background: "linear-gradient(120deg, #d6a63f, #f4cf77)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          className="font-bold text-lg tracking-tight"
        >
          Ghosla
        </span>
        <a
          href="/"
          className="text-sm text-[#6b635a] hover:text-[#1a1714] transition-colors underline underline-offset-4"
          style={{ textDecorationColor: "rgba(26,23,20,0.2)" }}
        >
          ← Back
        </a>
      </header>

      <AnimatePresence mode="wait">
        {stage === "idle" && (
          <IdleView
            key="idle"
            onStartRecording={() => setStage("recording")}
            onFormSubmit={(data) => {
              setSession(data);
              setStage("analyzing");
            }}
          />
        )}
        {stage === "recording" && (
          <RecordingView
            key="recording"
            onStop={() => {
              setSession(HARDCODED_SESSION);
              setStage("analyzing");
            }}
          />
        )}
        {stage === "analyzing" && (
          <AnalyzingView
            key="analyzing"
            session={session}
            onDone={() => router.push("/results")}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

// ── Idle view ─────────────────────────────────────────────────────────────────

function IdleView({
  onStartRecording,
  onFormSubmit,
}: {
  onStartRecording: () => void;
  onFormSubmit: (data: SessionData) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    locality: "",
    workplace: "",
    budgetMin: "",
    budgetMax: "",
    bhk: "",
    furnishing: "",
    lifestyle: "",
    amenities: "",
    dealBreakers: "",
    commute: "",
  });

  const set =
    (k: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const focusStyle = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => (e.target.style.borderColor = "#d6a63f");
  const blurStyle = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => (e.target.style.borderColor = "rgba(26,23,20,0.13)");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const session: SessionData = {
      ...HARDCODED_SESSION,
      name: form.name || HARDCODED_SESSION.name,
      locality: form.locality || HARDCODED_SESSION.locality,
      workplace_location:
        form.workplace || HARDCODED_SESSION.workplace_location,
      budget_range:
        form.budgetMin && form.budgetMax
          ? `${form.budgetMin}-${form.budgetMax}`
          : HARDCODED_SESSION.budget_range,
      bhk_type: form.bhk ? `${form.bhk} BHK` : HARDCODED_SESSION.bhk_type,
      furnishing_type: form.furnishing || HARDCODED_SESSION.furnishing_type,
      lifestyle_preference:
        form.lifestyle || HARDCODED_SESSION.lifestyle_preference,
      amenities_required:
        form.amenities || HARDCODED_SESSION.amenities_required,
      deal_breakers: form.dealBreakers || HARDCODED_SESSION.deal_breakers,
      max_commute_time: form.commute || HARDCODED_SESSION.max_commute_time,
    };
    onFormSubmit(session);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg mx-auto px-6 pt-32 pb-20 space-y-14"
    >
      {/* Mic section */}
      <div className="flex flex-col items-center gap-7 text-center">
        <p
          style={{ fontFamily: "var(--font-serif)" }}
          className="italic text-[#d6a63f] text-xl"
        >
          Talk to Ghosla
        </p>
        <motion.button
          type="button"
          onClick={onStartRecording}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 128,
            height: 128,
            background: "linear-gradient(135deg, #d6a63f 0%, #f4cf77 100%)",
            boxShadow: "0 20px 56px -16px rgba(214,166,63,0.65)",
          }}
        >
          <MicIcon size={44} color="#1a1714" />
        </motion.button>
        <div className="space-y-1.5">
          <p
            style={{ fontFamily: "var(--font-display)" }}
            className="font-bold text-lg tracking-tight"
          >
            Tap the mic to start talking
          </p>
          <p className="text-sm text-[#6b635a] leading-relaxed">
            Just speak naturally — Ghosla will find your perfect home.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div
          className="flex-1 h-px"
          style={{ backgroundColor: "rgba(26,23,20,0.13)" }}
        />
        <span
          className="text-[11px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "#9ca3af" }}
        >
          or
        </span>
        <div
          className="flex-1 h-px"
          style={{ backgroundColor: "rgba(26,23,20,0.13)" }}
        />
      </div>

      {/* Form */}
      <div className="space-y-7">
        <div className="text-center space-y-1.5">
          <p
            style={{ fontFamily: "var(--font-display)" }}
            className="font-bold text-lg tracking-tight"
          >
            Fill in your requirements
          </p>
          <p className="text-sm text-[#6b635a]">
            Not a fan of talking? Tell us what you need.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name + Locality */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">
                Your name
              </label>
              <input
                type="text"
                placeholder="e.g. Priya"
                value={form.name}
                onChange={set("name")}
                style={inputBase}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">
                Area / locality
              </label>
              <input
                type="text"
                placeholder="e.g. Electronic City"
                value={form.locality}
                onChange={set("locality")}
                style={inputBase}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
          </div>

          {/* Workplace */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">
              Workplace location
            </label>
            <input
              type="text"
              placeholder="e.g. Whitefield, Electronic City Phase 1"
              value={form.workplace}
              onChange={set("workplace")}
              style={inputBase}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">
              Monthly budget (₹)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min — e.g. 15000"
                value={form.budgetMin}
                onChange={set("budgetMin")}
                style={inputBase}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
              <input
                type="number"
                placeholder="Max — e.g. 30000"
                value={form.budgetMax}
                onChange={set("budgetMax")}
                style={inputBase}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
          </div>

          {/* BHK + Furnishing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">
                BHK
              </label>
              <select
                value={form.bhk}
                onChange={set("bhk")}
                style={inputBase}
                onFocus={focusStyle}
                onBlur={blurStyle}
              >
                <option value="">Any</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">
                Furnishing
              </label>
              <select
                value={form.furnishing}
                onChange={set("furnishing")}
                style={inputBase}
                onFocus={focusStyle}
                onBlur={blurStyle}
              >
                <option value="">Any</option>
                <option value="fully-furnished">Fully furnished</option>
                <option value="semi-furnished">Semi-furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>

          {/* Lifestyle + Commute */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">
                Lifestyle
              </label>
              <select
                value={form.lifestyle}
                onChange={set("lifestyle")}
                style={inputBase}
                onFocus={focusStyle}
                onBlur={blurStyle}
              >
                <option value="">Any</option>
                <option value="active healthy fitness-focused">
                  Active & fitness
                </option>
                <option value="peaceful quiet">Peaceful & quiet</option>
                <option value="premium luxury">Premium</option>
                <option value="balanced community">Balanced</option>
                <option value="vibrant social">Vibrant & social</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">
                Max commute
              </label>
              <select
                value={form.commute}
                onChange={set("commute")}
                style={inputBase}
                onFocus={focusStyle}
                onBlur={blurStyle}
              >
                <option value="">Any</option>
                <option value="15 minutes">15 min</option>
                <option value="30 minutes">30 min</option>
                <option value="45 minutes">45 min</option>
                <option value="60 minutes">1 hour</option>
              </select>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">
              Must-have amenities
            </label>
            <input
              type="text"
              placeholder="e.g. gym, pool, parking, lift"
              value={form.amenities}
              onChange={set("amenities")}
              style={inputBase}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Deal-breakers */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">
              Deal-breakers
            </label>
            <input
              type="text"
              placeholder="e.g. high AQI, no gym, far from metro"
              value={form.dealBreakers}
              onChange={set("dealBreakers")}
              style={inputBase}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl font-bold text-sm transition-colors"
            style={{
              background: "linear-gradient(120deg, #d6a63f 0%, #f4cf77 100%)",
              color: "#1a1714",
              boxShadow: "0 8px 28px -8px rgba(214,166,63,0.55)",
            }}
          >
            Find my home →
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}

// ── Recording view ─────────────────────────────────────────────────────────────

function RecordingView({ onStop }: { onStop: () => void }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-screen gap-10 text-center px-6"
    >
      <p
        style={{ fontFamily: "var(--font-display)" }}
        className="text-xs font-bold uppercase tracking-[0.28em] text-[#d6a63f]"
      >
        Ghosla
      </p>
      <div className="space-y-2">
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="text-3xl font-bold tracking-tight"
        >
          Listening…
        </h2>
        <p className="text-sm text-[#6b635a]">
          Speak your requirements — locality, budget, BHK, preferences
        </p>
      </div>

      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            backgroundColor: "rgba(214,166,63,0.12)",
          }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
          transition={{
            duration: 2.4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            backgroundColor: "rgba(214,166,63,0.16)",
          }}
          animate={{ scale: [1, 1.22, 1], opacity: [0.7, 0, 0.7] }}
          transition={{
            duration: 2.4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <div
          className="relative z-10 flex items-center justify-center rounded-full"
          style={{
            width: 120,
            height: 120,
            background: "linear-gradient(135deg, #d6a63f 0%, #f4cf77 100%)",
            boxShadow: "0 20px 56px -12px rgba(214,166,63,0.60)",
          }}
        >
          <MicIcon size={42} color="#1a1714" />
          <motion.div
            className="absolute top-3 right-3 rounded-full"
            style={{ width: 11, height: 11, backgroundColor: "#ef4444" }}
            animate={{ opacity: [1, 0.1, 1] }}
            transition={{
              duration: 1.1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-[3px]" style={{ height: 52 }}>
        {WAVE_HEIGHTS.map((h, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 3, backgroundColor: "#d6a63f" }}
            animate={{ height: [4, h, 4] }}
            transition={{
              duration: 0.65 + i * 0.015,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.04,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <p className="font-mono text-sm text-[#6b635a] tracking-widest">
        {formatTime(time)}
      </p>

      <motion.button
        type="button"
        onClick={onStop}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="px-9 py-4 rounded-full font-bold text-sm"
        style={{
          backgroundColor: "#1a1714",
          color: "#f7f4ef",
          boxShadow: "0 8px 24px -8px rgba(26,23,20,0.4)",
        }}
      >
        Stop &amp; Search
      </motion.button>
    </motion.div>
  );
}

// ── Analyzing view ─────────────────────────────────────────────────────────────

const PLATFORMS = [
  { name: "NoBroker", logo: "/nobroker.png", color: "#e11d48", delay: 0 },
  { name: "99acres", logo: "/99acres.png", color: "#2563eb", delay: 5 },
  {
    name: "MagicBricks",
    logo: "/magicbricks.png",
    color: "#7c3aed",
    delay: 10,
  },
];

type PlatformState = "waiting" | "active" | "done";

function AnalyzingView({
  session,
  onDone,
}: {
  session: SessionData;
  onDone: () => void;
}) {
  const [logs, setLogs] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [aiDone, setAiDone] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  // Platform states based on elapsed time
  const getPlatformState = (delay: number): PlatformState => {
    if (elapsed < delay) return "waiting";
    if (aiDone) return "done";
    return "active";
  };

  // Fake progress: 0→85% over 90s, then jump to 100 on done
  const progress = aiDone ? 100 : Math.min(85, (elapsed / 90) * 85);

  useEffect(() => {
    // POST session to backend
    fetch(`${BACKEND_URL}/session/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    }).catch(() => {});

    // Timer
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);

    // Poll results — navigate as soon as source === "ai"
    const resultsInterval = setInterval(async () => {
      try {
        const data = (await fetch(`${BACKEND_URL}/results`).then((r) =>
          r.json(),
        )) as { source?: string };
        if (data.source === "ai" && !doneRef.current) {
          doneRef.current = true;
          setAiDone(true);
          setTimeout(() => onDone(), 1200);
        }
      } catch {}
    }, 4000);

    // Theater status fallback
    const statusInterval = setInterval(async () => {
      try {
        const { status } = (await fetch(`${BACKEND_URL}/theater/status`).then(
          (r) => r.json(),
        )) as { status: string };
        if (status === "complete" && !doneRef.current) {
          doneRef.current = true;
          setAiDone(true);
          setTimeout(() => onDone(), 1500);
        }
      } catch {}
    }, 3000);

    // Poll logs
    const logInterval = setInterval(async () => {
      try {
        const { logs: incoming } = (await fetch(
          `${BACKEND_URL}/theater/logs`,
        ).then((r) => r.json())) as { logs: string[] };
        if (Array.isArray(incoming)) setLogs(incoming);
      } catch {}
    }, 1500);

    return () => {
      clearInterval(timer);
      clearInterval(resultsInterval);
      clearInterval(statusInterval);
      clearInterval(logInterval);
    };
  }, [onDone, session]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-2xl mx-auto px-6 pt-28 pb-20 space-y-10"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <p
          style={{ fontFamily: "var(--font-display)" }}
          className="text-xs font-bold uppercase tracking-[0.28em] text-[#d6a63f]"
        >
          Ghosla
        </p>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="text-3xl font-bold tracking-tight"
        >
          {aiDone ? "Found your matches!" : "Searching for your home…"}
        </h2>
        <p className="text-sm text-[#6b635a]">
          {aiDone
            ? "Preparing your results"
            : "Scanning 3 platforms + AI research simultaneously"}
        </p>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-3 gap-4">
        {PLATFORMS.map((p) => {
          const state = getPlatformState(p.delay);
          return (
            <PlatformCard
              key={p.name}
              platform={p}
              state={state}
            />
          );
        })}
      </div>

      {/* AI research bar */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{
          backgroundColor: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(26,23,20,0.10)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: aiDone ? "#10b981" : "#d6a63f" }}
              animate={aiDone ? {} : { scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              {aiDone ? (
                <span className="text-white text-[10px]">✓</span>
              ) : (
                <motion.div
                  className="w-2 h-2 rounded-full bg-white"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
            </motion.div>
            <span className="text-sm font-semibold text-[#1a1714]">
              AI Research Engine
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d6a63f] bg-[#d6a63f]/10 px-2 py-0.5 rounded-full">
              Powered by Exa
            </span>
          </div>
          <span className="text-xs text-[#9ca3af] font-mono">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(26,23,20,0.1)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #d6a63f, #f4cf77)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <p className="text-xs text-[#6b635a]">
          {aiDone
            ? "Research complete — 6 AI-matched properties found"
            : elapsed < 15
              ? "Querying property databases and locality intelligence…"
              : elapsed < 40
                ? "Analysing AQI, commute times, and neighbourhood data…"
                : "Cross-referencing results and computing match scores…"}
        </p>
      </div>

      {/* Live log feed */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "rgba(26,23,20,0.04)",
          border: "1px solid rgba(26,23,20,0.10)",
        }}
      >
        <div
          className="px-4 py-2.5 border-b text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] flex items-center gap-2"
          style={{ borderColor: "rgba(26,23,20,0.08)" }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: aiDone ? "#10b981" : "#d6a63f" }}
            animate={aiDone ? {} : { opacity: [1, 0.2, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          />
          Live activity
        </div>
        <div className="p-4 max-h-44 overflow-y-auto font-mono text-xs space-y-0.5">
          {logs.length > 0 ? (
            logs.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className={`leading-relaxed py-0.5 ${logColor(line)}`}
              >
                {line}
              </motion.p>
            ))
          ) : (
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
              className="text-[#d6a63f]"
            >
              Initialising engines…
            </motion.span>
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      <p className="text-center text-xs text-[#9ca3af]">
        This typically takes 30–90 seconds. Sit back.
      </p>
    </motion.div>
  );
}

// ── Platform card ──────────────────────────────────────────────────────────────

function PlatformCard({
  platform,
  state,
}: {
  platform: (typeof PLATFORMS)[number];
  state: PlatformState;
}) {
  const isActive = state === "active";
  const isDone = state === "done";
  const isWaiting = state === "waiting";

  const cardStyle: React.CSSProperties = {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    border: isDone
      ? "1.5px solid #10b981"
      : isActive
        ? `1.5px solid ${platform.color}`
        : "1.5px solid rgba(26,23,20,0.10)",
    boxShadow: isDone
      ? "0 0 20px rgba(16,185,129,0.18)"
      : isActive
        ? `0 0 24px ${platform.color}30`
        : "none",
    transition: "all 0.4s ease",
    opacity: isWaiting ? 0.55 : 1,
  };

  const statusText = isDone
    ? "Listings found"
    : isActive
      ? "Searching…"
      : "Waiting…";

  const statusColor = isDone
    ? "#10b981"
    : isActive
      ? platform.color
      : "#9ca3af";

  return (
    <div
      className="p-4 flex flex-col items-center gap-3 text-center"
      style={cardStyle}
    >
      {/* Logo */}
      <div className="relative w-16 h-10 flex items-center justify-center">
        <img
          src={platform.logo}
          alt={platform.name}
          className="max-w-full max-h-full object-contain"
          style={{
            filter: isWaiting ? "grayscale(0.6)" : "none",
            transition: "filter 0.4s",
          }}
        />
        {isDone && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
          >
            <span className="text-white text-[9px] font-bold">✓</span>
          </motion.div>
        )}
      </div>

      {/* Status dot + text */}
      <div className="flex items-center gap-1.5">
        {isActive && (
          <motion.div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: platform.color }}
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY }}
          />
        )}
        <span
          className="text-[11px] font-semibold"
          style={{ color: statusColor }}
        >
          {statusText}
        </span>
      </div>

      {/* Mini progress bar when active */}
      {isActive && (
        <div
          className="w-full h-0.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(26,23,20,0.08)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: platform.color }}
            animate={{ width: ["0%", "90%"] }}
            transition={{ duration: 80, ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function logColor(line: string): string {
  if (line.includes("[NoBroker]")) return "text-rose-600";
  if (line.includes("[99Acres]") || line.includes("[99acres]"))
    return "text-blue-600";
  if (line.includes("[MagicBricks]")) return "text-violet-600";
  if (line.includes("[Runner]")) return "text-[#d6a63f]";
  if (line.includes("[Research]")) return "text-purple-600";
  return "text-[#6b635a]";
}

function MicIcon({
  size = 24,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
