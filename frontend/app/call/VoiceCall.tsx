"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PipecatClient } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";
import {
  PipecatClientAudio,
  PipecatClientProvider,
  type BotOutputText,
  type ConversationMessage,
  usePipecatClient,
  usePipecatClientTransportState,
  usePipecatConversation,
} from "@pipecat-ai/client-react";

// ── Constants ────────────────────────────────────────────────────────────────

const PIPECAT_URL = "http://localhost:7860";
const BACKEND_URL = "http://localhost:8000";

// Bot's wrap-up trigger phrase — when detected we transition to analyzing
const WRAP_UP_TRIGGER = "give me a moment";

// ── Singleton client (safe — this file is never SSR'd via dynamic ssr:false) ─

const pipecatClient = new PipecatClient({
  transport: new SmallWebRTCTransport({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  }),
  enableMic: true,
  enableCam: false,
});

// ── Types ────────────────────────────────────────────────────────────────────

type PageState = "select" | "connecting" | "conversation" | "analyzing";

// ── Root ─────────────────────────────────────────────────────────────────────

export default function VoiceCall() {
  const [pageState, setPageState] = useState<PageState>("select");
  const router = useRouter();

  return (
    <PipecatClientProvider client={pipecatClient}>
      <PipecatClientAudio />
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-6 text-white">
        <AnimatePresence mode="wait">
          {pageState === "select" && (
            <SelectionView
              key="select"
              onSelectVoice={() => setPageState("connecting")}
            />
          )}
          {(pageState === "connecting" || pageState === "conversation") && (
            <VoiceSessionView
              key="voice"
              pageState={pageState}
              onPageStateChange={setPageState}
              onComplete={() => setPageState("analyzing")}
            />
          )}
          {pageState === "analyzing" && (
            <AnalyzingView
              key="analyzing"
              onDone={() => router.push("/results")}
            />
          )}
        </AnimatePresence>
      </main>
    </PipecatClientProvider>
  );
}

// ── Selection view ────────────────────────────────────────────────────────────

function SelectionView({ onSelectVoice }: { onSelectVoice: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl space-y-8 text-center"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
          TrueNest AI
        </p>
        <h1 className="text-3xl font-bold text-white md:text-4xl">
          How would you like to search?
        </h1>
        <p className="text-gray-400">
          Choose your preferred way to find the perfect home.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Voice Agent */}
        <motion.button
          onClick={onSelectVoice}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="group relative overflow-hidden rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6 text-left transition hover:border-orange-500/60 hover:bg-orange-500/15"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/20 transition-colors group-hover:bg-orange-500/30">
            <MicIcon size={20} />
          </div>
          <h2 className="mb-1 font-semibold text-white">Voice Agent</h2>
          <p className="text-xs leading-relaxed text-gray-400">
            Talk naturally with Nest — our AI home-finding guide
          </p>
          <div className="mt-4 text-xs font-semibold text-orange-400">
            Start talking →
          </div>
        </motion.button>

        {/* Chatbot – coming soon */}
        <div className="cursor-not-allowed rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-left opacity-40">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
            <ChatIcon />
          </div>
          <h2 className="mb-1 font-semibold text-white">Chatbot</h2>
          <p className="text-xs leading-relaxed text-gray-500">
            Type your requirements and get instant results
          </p>
          <div className="mt-4">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-500">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Voice session view ────────────────────────────────────────────────────────

function VoiceSessionView({
  pageState,
  onPageStateChange,
  onComplete,
}: {
  pageState: PageState;
  onPageStateChange: (s: PageState) => void;
  onComplete: () => void;
}) {
  const pcClient = usePipecatClient();
  const transportState = usePipecatClientTransportState();
  const { messages } = usePipecatConversation();
  const didCompleteRef = useRef(false);

  // Connect on mount
  useEffect(() => {
    if (!pcClient) return;
    pcClient
      .startBotAndConnect({ endpoint: `${PIPECAT_URL}/start` })
      .catch((err: unknown) => {
        console.error("Pipecat connection failed:", err);
        onPageStateChange("select");
      });
    return () => { pcClient.disconnect(); };
  }, [pcClient]);

  // Map transport state → page state
  useEffect(() => {
    if (transportState === "ready" || transportState === "connected") {
      onPageStateChange("conversation");
    }
    if (transportState === "disconnected" && !didCompleteRef.current) {
      didCompleteRef.current = true;
      onComplete();
    }
  }, [transportState]);

  // Detect bot's final wrap-up message
  useEffect(() => {
    if (didCompleteRef.current || !pcClient) return;
    const lastBot = [...messages]
      .reverse()
      .find((m: ConversationMessage) => m.role === "assistant");
    if (!lastBot) return;
    const text = lastBot.parts
      .map((p) => extractText(p.text))
      .join(" ")
      .toLowerCase();
    if (text.includes(WRAP_UP_TRIGGER)) {
      didCompleteRef.current = true;
      onComplete();
      pcClient.disconnect();
    }
  }, [messages, pcClient]);

  const isConnecting =
    pageState === "connecting" ||
    transportState === "connecting" ||
    transportState === "initializing" ||
    transportState === "initialized" ||
    transportState === "authenticating" ||
    transportState === "authenticated";

  const isReady =
    transportState === "ready" || transportState === "connected";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex w-full max-w-lg flex-col items-center gap-8"
    >
      {/* Header */}
      <div className="space-y-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
          Nest — Voice Agent
        </p>
        <h2 className="text-2xl font-bold text-white">
          {isConnecting ? "Connecting…" : "Listening"}
        </h2>
        <p className="text-sm text-gray-400">
          {isConnecting
            ? "Setting up your voice session"
            : "Speak naturally — Nest will guide you"}
        </p>
      </div>

      {/* Mic orb */}
      <div className="relative flex items-center justify-center">
        {isReady && (
          <>
            <motion.div
              className="absolute rounded-full bg-orange-500/20"
              style={{ width: 128, height: 128 }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute rounded-full bg-orange-500/10"
              style={{ width: 128, height: 128 }}
              animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.4 }}
            />
          </>
        )}
        <div
          className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full transition-all duration-500 ${
            isReady ? "bg-orange-500" : "bg-white/10"
          }`}
        >
          {isConnecting ? (
            <motion.div
              className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          ) : (
            <MicIcon size={28} color="white" />
          )}
        </div>
      </div>

      {/* Transcript */}
      {messages.length > 0 && (
        <div className="w-full max-h-52 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-4">
          {messages.slice(-8).map((msg: ConversationMessage, i: number) => (
            <div key={`${msg.createdAt}-${i}`} className="flex gap-2 text-sm">
              <span
                className={`shrink-0 text-xs font-semibold uppercase tracking-wider ${
                  msg.role === "assistant" ? "text-orange-400" : "text-gray-500"
                }`}
              >
                {msg.role === "assistant" ? "Nest" : "You"}
              </span>
              <span className={msg.role === "assistant" ? "text-gray-200" : "text-gray-400"}>
                {msg.parts.map((p, j) => (
                  <span key={j}>{extractText(p.text)}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* End conversation */}
      {isReady && (
        <button
          type="button"
          onClick={() => {
            if (didCompleteRef.current) return;
            didCompleteRef.current = true;
            pcClient?.disconnect();
            onComplete();
          }}
          className="text-sm text-gray-500 transition hover:text-gray-300"
        >
          End conversation
        </button>
      )}
    </motion.div>
  );
}

// ── Analyzing view ────────────────────────────────────────────────────────────

function AnalyzingView({ onDone }: { onDone: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    // Trigger backend automation
    fetch(`${BACKEND_URL}/session/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }).catch(() => {});

    const statusInterval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/theater/status`);
        const { status } = (await res.json()) as { status: string };
        if (status === "complete" && !doneRef.current) {
          doneRef.current = true;
          clearInterval(statusInterval);
          onDone();
        }
      } catch {}
    }, 2000);

    const logInterval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/theater/logs`);
        const { logs: incoming } = (await res.json()) as { logs: string[] };
        if (Array.isArray(incoming)) setLogs(incoming);
      } catch {}
    }, 1500);

    return () => {
      clearInterval(statusInterval);
      clearInterval(logInterval);
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex w-full max-w-lg flex-col items-center gap-8"
    >
      <div className="space-y-2 text-center">
        <motion.div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <SearchIcon />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">
          Searching across platforms
        </h2>
        <p className="text-sm text-gray-400">
          Scanning 99acres, NoBroker, and MagicBricks for your best matches…
        </p>
      </div>

      <div className="w-full max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs">
        {logs.length > 0 ? (
          logs.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="leading-relaxed text-green-400"
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
            Initializing search agents…
          </motion.span>
        )}
        <div ref={logsEndRef} />
      </div>
    </motion.div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractText(text: BotOutputText | React.ReactNode): string {
  if (typeof text === "string") return text;
  if (typeof text === "number") return String(text);
  if (text !== null && typeof text === "object" && "spoken" in text) {
    return (text as BotOutputText).spoken;
  }
  return "";
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function MicIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
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

function ChatIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

