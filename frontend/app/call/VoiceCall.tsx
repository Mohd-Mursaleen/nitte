"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || "http://localhost:8000";

type Stage = "idle" | "recording" | "analyzing";
type TheaterStatusResponse = { status: string };
type TheaterLogsResponse = { logs: string[] };

// Pre-compute stable waveform bar heights (module-level = no flicker on re-render)
const WAVE_HEIGHTS = Array.from({ length: 28 }, () => Math.floor(Math.random() * 34) + 8);

const lightBg: React.CSSProperties = {
  backgroundColor: "#e2ded7",
  backgroundImage: [
    "radial-gradient(ellipse 70% 55% at 0% 0%, rgba(196,148,61,0.18) 0%, transparent 55%)",
    "radial-gradient(ellipse 60% 50% at 100% 100%, rgba(196,148,61,0.12) 0%, transparent 55%)",
    "radial-gradient(rgba(26,23,20,0.11) 1.2px, transparent 1.2px)",
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
  const router = useRouter();

  return (
    <main className="min-h-screen text-[#1a1714]" style={lightBg}>
      {/* Nav */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 border-b backdrop-blur-md"
        style={{
          backgroundColor: "rgba(226,222,215,0.92)",
          borderColor: "rgba(26,23,20,0.1)",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)" }} className="font-bold text-lg tracking-tight">
          Nest
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
            onFormSubmit={() => setStage("analyzing")}
          />
        )}
        {stage === "recording" && (
          <RecordingView
            key="recording"
            onStop={() => setStage("analyzing")}
          />
        )}
        {stage === "analyzing" && (
          <AnalyzingView
            key="analyzing"
            onDone={() => router.push("/results")}
            onBack={() => setStage("idle")}
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
  onFormSubmit: () => void;
}) {
  const [form, setForm] = useState({
    locality: "",
    budgetMin: "",
    budgetMax: "",
    bhk: "",
    furnishing: "",
    notes: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFormSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg mx-auto px-6 pt-32 pb-20 space-y-14"
    >
      {/* ── Mic section ── */}
      <div className="flex flex-col items-center gap-7 text-center">
        <p
          style={{ fontFamily: "var(--font-serif)" }}
          className="italic text-[#c4943d] text-xl"
        >
          Talk to Nest
        </p>

        {/* Mic button */}
        <motion.button
          type="button"
          onClick={onStartRecording}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 128,
            height: 128,
            backgroundColor: "#c4943d",
            boxShadow: "0 20px 56px -16px rgba(196,148,61,0.70)",
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
            Describe your locality, budget, BHK, and what matters most to you.
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(26,23,20,0.13)" }} />
        <span
          className="text-[11px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "#9ca3af" }}
        >
          or
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(26,23,20,0.13)" }} />
      </div>

      {/* ── Form section ── */}
      <div className="space-y-7">
        <div className="text-center space-y-1.5">
          <p
            style={{ fontFamily: "var(--font-display)" }}
            className="font-bold text-lg tracking-tight"
          >
            Fill this form instead
          </p>
          <p className="text-sm text-[#6b635a]">
            Not a fan of talking? Tell us what you need — we'll find the best match either way.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Locality */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">
              Preferred area / locality
            </label>
            <input
              type="text"
              placeholder="e.g. Whitefield, Bangalore"
              value={form.locality}
              onChange={set("locality")}
              style={inputBase}
              onFocus={(e) => (e.target.style.borderColor = "#c4943d")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(26,23,20,0.13)")}
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
                onFocus={(e) => (e.target.style.borderColor = "#c4943d")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(26,23,20,0.13)")}
              />
              <input
                type="number"
                placeholder="Max — e.g. 35000"
                value={form.budgetMax}
                onChange={set("budgetMax")}
                style={inputBase}
                onFocus={(e) => (e.target.style.borderColor = "#c4943d")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(26,23,20,0.13)")}
              />
            </div>
          </div>

          {/* BHK + Furnishing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">BHK</label>
              <select
                value={form.bhk}
                onChange={set("bhk")}
                style={inputBase}
                onFocus={(e) => (e.target.style.borderColor = "#c4943d")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(26,23,20,0.13)")}
              >
                <option value="">Any</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">Furnishing</label>
              <select
                value={form.furnishing}
                onChange={set("furnishing")}
                style={inputBase}
                onFocus={(e) => (e.target.style.borderColor = "#c4943d")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(26,23,20,0.13)")}
              >
                <option value="">Any</option>
                <option value="furnished">Furnished</option>
                <option value="semi">Semi-furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6b635a]">
              Anything else? (lift, parking, pet-friendly…)
            </label>
            <textarea
              placeholder="e.g. Need lift, covered parking, near metro"
              value={form.notes}
              onChange={set("notes")}
              rows={3}
              style={{ ...inputBase, resize: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "#c4943d")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(26,23,20,0.13)")}
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl font-bold text-sm transition-colors"
            style={{
              backgroundColor: "#c4943d",
              color: "#1a1714",
              boxShadow: "0 8px 28px -8px rgba(196,148,61,0.55)",
            }}
          >
            Find my home →
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}

// ── Recording view ────────────────────────────────────────────────────────────

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
      {/* Brand */}
      <p
        style={{ fontFamily: "var(--font-display)" }}
        className="text-xs font-bold uppercase tracking-[0.28em] text-[#c4943d]"
      >
        Nest
      </p>

      {/* Heading */}
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

      {/* Pulsing orb */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse ring */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: 200, height: 200, backgroundColor: "rgba(196,148,61,0.12)" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        {/* Mid pulse ring */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: 200, height: 200, backgroundColor: "rgba(196,148,61,0.16)" }}
          animate={{ scale: [1, 1.22, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Orb */}
        <div
          className="relative z-10 flex items-center justify-center rounded-full"
          style={{
            width: 120,
            height: 120,
            backgroundColor: "#c4943d",
            boxShadow: "0 20px 56px -12px rgba(196,148,61,0.65)",
          }}
        >
          <MicIcon size={42} color="#1a1714" />
          {/* Blinking recording dot */}
          <motion.div
            className="absolute top-3 right-3 rounded-full"
            style={{ width: 11, height: 11, backgroundColor: "#ef4444" }}
            animate={{ opacity: [1, 0.1, 1] }}
            transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Waveform */}
      <div className="flex items-center gap-[3px]" style={{ height: 52 }}>
        {WAVE_HEIGHTS.map((h, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 3, backgroundColor: "#c4943d" }}
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

      {/* Timer */}
      <p className="font-mono text-sm text-[#6b635a] tracking-widest">
        {formatTime(time)}
      </p>

      {/* Stop */}
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

// ── Analyzing view ────────────────────────────────────────────────────────────

function AnalyzingView({
  onDone,
  onBack,
}: {
  onDone: () => void;
  onBack: () => void;
}) {
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let statusInterval: ReturnType<typeof setInterval> | null = null;
    let logInterval: ReturnType<typeof setInterval> | null = null;

    const run = async () => {
      doneRef.current = false;
      setError(null);

      try {
        await fetchJson(`${BACKEND_URL}/session/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
      } catch {
        if (isMounted) {
          setError("Could not start search. Ensure backend is running, then go back and retry.");
        }
        return;
      }

      statusInterval = setInterval(async () => {
        try {
          const { status } = await fetchJson<TheaterStatusResponse>(`${BACKEND_URL}/theater/status`);
          if (!isMounted) return;
          setError(null);
          if (status === "complete" && !doneRef.current) {
            doneRef.current = true;
            if (statusInterval) clearInterval(statusInterval);
            onDone();
          }
        } catch {
          if (isMounted) {
            setError((prev) => prev ?? "Connection issue while polling status. Retrying…");
          }
        }
      }, 2000);

      logInterval = setInterval(async () => {
        try {
          const { logs: incoming } = await fetchJson<TheaterLogsResponse>(`${BACKEND_URL}/theater/logs`);
          if (!isMounted) return;
          if (Array.isArray(incoming)) setLogs(incoming);
        } catch {
          if (isMounted) {
            setError((prev) => prev ?? "Connection issue while fetching logs. Retrying…");
          }
        }
      }, 1500);
    };

    void run();

    return () => {
      isMounted = false;
      if (statusInterval) clearInterval(statusInterval);
      if (logInterval) clearInterval(logInterval);
    };
  }, [onDone]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-screen gap-8 text-center px-6 w-full max-w-lg mx-auto"
    >
      <p
        style={{ fontFamily: "var(--font-display)" }}
        className="text-xs font-bold uppercase tracking-[0.28em] text-[#c4943d]"
      >
        Nest
      </p>

      <div className="space-y-3">
        <motion.div
          className="mx-auto flex items-center justify-center rounded-full"
          style={{
            width: 60,
            height: 60,
            border: "2px solid rgba(196,148,61,0.35)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <SearchIcon />
        </motion.div>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="text-2xl font-bold tracking-tight"
        >
          Finding your matches
        </h2>
        <p className="text-sm text-[#6b635a]">
          Searching 99acres, NoBroker, and MagicBricks
        </p>
      </div>

      {/* Log feed */}
      <div
        className="w-full max-h-56 overflow-y-auto rounded-2xl p-5 text-left font-mono text-xs"
        style={{
          backgroundColor: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(26,23,20,0.12)",
        }}
      >
        {logs.length > 0 ? (
          logs.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -6 }}
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
            style={{ color: "#c4943d" }}
          >
            Initialising search…
          </motion.span>
        )}
        <div ref={logsEndRef} />
      </div>

      {error && (
        <div className="w-full rounded-xl border border-amber-300/50 bg-amber-50/70 p-4 text-left">
          <p className="text-sm font-medium text-amber-900">{error}</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 inline-flex rounded-full border border-[#1a1714]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#1a1714] transition hover:border-[#1a1714]/35"
          >
            Back to call setup
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function logColor(line: string): string {
  if (line.includes("[NoBroker]")) return "text-emerald-600";
  if (line.includes("[99Acres]") || line.includes("[99acres]")) return "text-blue-600";
  if (line.includes("[MagicBricks]")) return "text-violet-600";
  if (line.includes("[Runner]")) return "text-[#c4943d]";
  return "text-[#6b635a]";
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function MicIcon({ size = 24, color = "currentColor" }: { size?: number; color?: string }) {
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

function SearchIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#c4943d"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
