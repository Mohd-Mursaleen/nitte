"use client";

import dynamic from "next/dynamic";

const VoiceCall = dynamic(() => import("./VoiceCall"), { ssr: false });

export default function CallPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);
  const router = useRouter();

  // Start polling once analyzing begins
  useEffect(() => {
    if (stage !== "analyzing") return;
    doneRef.current = false;

    fetch(`${BACKEND}/session/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }).catch(() => {});

    const statusPoll = setInterval(async () => {
      try {
        const { status } = await fetch(`${BACKEND}/theater/status`).then(
          (r) => r.json() as Promise<{ status: string }>
        );
        if (status === "complete" && !doneRef.current) {
          doneRef.current = true;
          clearInterval(statusPoll);
          router.push("/results");
        }
      } catch {}
    }, 3000);

    const logPoll = setInterval(async () => {
      try {
        const { logs: incoming } = await fetch(`${BACKEND}/theater/logs`).then(
          (r) => r.json() as Promise<{ logs: string[] }>
        );
        if (Array.isArray(incoming)) setLogs(incoming);
      } catch {}
    }, 1500);

    return () => {
      clearInterval(statusPoll);
      clearInterval(logPoll);
    };
  }, [stage, router]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-white">
      {/* Brand */}
      <p className="mb-12 text-xs font-semibold uppercase tracking-[0.24em] text-orange-400">
        TrueNest AI — Nest
      </p>

      <AnimatePresence mode="wait">
        {/* ── Idle ─────────────────────────────────────────── */}
        {stage === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-8"
          >
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-white md:text-4xl">
                Find your perfect home
              </h1>
              <p className="text-gray-400">
                Click the mic and describe what you're looking for.
              </p>
            </div>

            <motion.button
              type="button"
              onClick={() => setStage("listening")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-28 w-28 items-center justify-center rounded-full bg-white/10 border border-white/10 transition hover:bg-white/15"
            >
              <MicIcon size={36} color="#9ca3af" />
            </motion.button>

            <p className="text-sm text-gray-500">Tap to start</p>
          </motion.div>
        )}

        {/* ── Listening ────────────────────────────────────── */}
        {stage === "listening" && (
          <motion.div
            key="listening"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-10"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-white">Nest is listening</h2>
              <p className="text-sm text-gray-400">
                Tell Nest your locality, budget, BHK, and any preferences.
              </p>
            </div>

            {/* Pulsing mic orb */}
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute rounded-full bg-orange-500/25"
                style={{ width: 160, height: 160 }}
                animate={{ scale: [1, 1.45, 1], opacity: [0.7, 0, 0.7] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute rounded-full bg-orange-500/12"
                style={{ width: 160, height: 160 }}
                animate={{ scale: [1, 1.9, 1], opacity: [0.5, 0, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.35,
                }}
              />
              <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.4)]">
                <MicIcon size={40} color="white" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStage("analyzing")}
              className="rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Stop — search now
            </button>
          </motion.div>
        )}

        {/* ── Analyzing ────────────────────────────────────── */}
        {stage === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full max-w-lg flex-col items-center gap-8"
          >
            <div className="space-y-2 text-center">
              <motion.div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <SearchIcon />
              </motion.div>
              <h2 className="text-2xl font-bold text-white">
                Searching across platforms
              </h2>
              <p className="text-sm text-gray-400">
                Scanning 99acres, NoBroker, and MagicBricks for your best
                matches…
              </p>
            </div>

            {/* Log feed */}
            <div className="w-full max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs">
              {logs.length > 0 ? (
                logs.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`leading-relaxed ${logColor(line)}`}
                  >
                    {line}
                  </motion.p>
                ))
              ) : (
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
                  className="text-green-400"
                >
                  Initialising search agents…
                </motion.span>
              )}
              <div ref={logsEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Colour-code log lines by platform prefix
function logColor(line: string): string {
  if (line.includes("[NoBroker]")) return "text-green-400";
  if (line.includes("[99Acres]") || line.includes("[99acres]")) return "text-blue-400";
  if (line.includes("[MagicBricks]")) return "text-purple-400";
  if (line.includes("[Runner]")) return "text-orange-400";
  return "text-gray-400";
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function MicIcon({ size = 24, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
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
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f97316"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
