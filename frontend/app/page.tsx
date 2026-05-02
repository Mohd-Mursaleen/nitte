"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// ── Palette ────────────────────────────────────────────────────────────────────
// bg:    #e2ded7  warm grey (clearly not white)
// ink:   #1a1714  near-black
// muted: #6b635a
// gold:  #c4943d  richer, better contrast on grey
// dark:  #0e0d0b  near-black sections

const platforms = [
  {
    name: "99acres",
    logo: "/99acres.png",
    desc: "India's largest property portal — millions of verified owner listings across every major city.",
  },
  {
    name: "NoBroker",
    logo: "/nobroker.png",
    desc: "Zero brokerage, direct from owners. No middlemen, no hidden fees.",
  },
  {
    name: "MagicBricks",
    logo: "/magicbricks.png",
    desc: "Premium listings with deep locality insights, photos, and owner contacts.",
  },
];

const steps = [
  {
    num: "01",
    title: "You talk",
    desc: "Describe your locality, budget, BHK, and preferences naturally — no forms, no filters.",
  },
  {
    num: "02",
    title: "We search",
    desc: "Our system scans all three platforms simultaneously in real time.",
  },
  {
    num: "03",
    title: "You choose",
    desc: "Ranked shortlist matched to exactly what you described, with full locality intel.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
};

// Inline bg style — reused on light sections
const lightBg: React.CSSProperties = {
  backgroundColor: "#e2ded7",
  backgroundImage: [
    // top-left warm glow
    "radial-gradient(ellipse 70% 55% at 0% 0%, rgba(196,148,61,0.22) 0%, transparent 55%)",
    // bottom-right warm glow
    "radial-gradient(ellipse 60% 50% at 100% 100%, rgba(196,148,61,0.15) 0%, transparent 55%)",
    // dot grid
    "radial-gradient(rgba(26,23,20,0.13) 1.2px, transparent 1.2px)",
  ].join(", "),
  backgroundSize: "100% 100%, 100% 100%, 24px 24px",
};

export default function Home() {
  return (
    <div className="min-h-screen text-[#1a1714]" style={lightBg}>

      {/* ── Nav ──────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 border-b border-[rgba(26,23,20,0.1)] backdrop-blur-md"
        style={{ backgroundColor: "rgba(226,222,215,0.92)" }}
      >
        <span
          style={{ fontFamily: "var(--font-display)" }}
          className="font-bold text-lg tracking-tight text-[#1a1714]"
        >
          Nest
        </span>
        <Link
          href="/call"
          className="px-5 py-2.5 text-sm font-bold rounded-full transition-colors"
          style={{
            backgroundColor: "#c4943d",
            color: "#1a1714",
            boxShadow: "0 2px 12px -2px rgba(196,148,61,0.45)",
          }}
        >
          Start your search →
        </Link>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="max-w-4xl space-y-6"
        >
          {/* Brand mark in hero */}
          <motion.div variants={fadeUp}>
            <span
              style={{ fontFamily: "var(--font-display)" }}
              className="text-xs font-bold uppercase tracking-[0.32em] text-[#c4943d]"
            >
              Nest
            </span>
          </motion.div>

          {/* Serif tagline */}
          <motion.p
            variants={fadeUp}
            style={{ fontFamily: "var(--font-serif)" }}
            className="italic text-[#1a1714] text-2xl md:text-3xl tracking-wide opacity-70"
          >
            Find your perfect home
          </motion.p>

          {/* Main headline */}
          <motion.h1
            variants={fadeUp}
            style={{ fontFamily: "var(--font-display)" }}
            className="text-6xl md:text-[90px] font-bold leading-[0.92] tracking-[-0.04em] text-[#1a1714]"
          >
            Tell us what
            <br />
            you need.
          </motion.h1>

          {/* Body */}
          <motion.p
            variants={fadeUp}
            className="max-w-lg mx-auto text-[#6b635a] text-lg leading-relaxed"
          >
            Describe your budget, location, and preferences in one conversation.
            We search across platforms and return your best matches instantly.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} className="pt-3">
            <Link
              href="/call"
              className="inline-flex items-center gap-2 px-9 py-4 text-sm font-bold rounded-full transition-colors"
              style={{
                backgroundColor: "#c4943d",
                color: "#1a1714",
                boxShadow: "0 10px 36px -8px rgba(196,148,61,0.55)",
              }}
            >
              Start talking →
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-10 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="text-[#c4943d] text-xs font-bold tracking-[0.24em] uppercase"
          >
            ↓
          </motion.span>
        </motion.div>
      </section>

      {/* ── Platform section — dark ───────────────────────── */}
      <section style={{ backgroundColor: "#0e0d0b" }} className="py-28 px-8">
        <div className="max-w-6xl mx-auto space-y-20">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center space-y-5 max-w-2xl mx-auto"
          >
            <p
              style={{ fontFamily: "var(--font-serif)" }}
              className="italic text-[#c4943d] text-lg"
            >
              Powered by real data
            </p>
            <h2
              style={{ fontFamily: "var(--font-display)" }}
              className="text-3xl md:text-4xl font-bold text-white tracking-[-0.03em] leading-tight"
            >
              One conversation.
              <br />
              Three platforms. Your best match.
            </h2>
            <p className="text-[#7a7470] text-base leading-relaxed">
              You tell Nest what you're looking for. We simultaneously search
              India's top rental platforms and return a shortlist ranked by
              budget, location, size, and the amenities that matter most.
            </p>
          </motion.div>

          {/* Platform cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {platforms.map((platform, i) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-7 space-y-6 flex flex-col"
                style={{
                  backgroundColor: "#1a1917",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Logo on white pill — preserves brand colors */}
                <div className="rounded-xl px-4 py-3 w-fit bg-white">
                  <div className="relative h-9 w-28">
                    <Image
                      src={platform.logo}
                      alt={platform.name}
                      fill
                      className="object-contain object-left"
                    />
                  </div>
                </div>
                <p className="text-[#7a7470] text-sm leading-relaxed flex-1">
                  {platform.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works — light ─────────────────────────── */}
      <section className="px-8 py-28 max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{ fontFamily: "var(--font-serif)" }}
          className="italic text-[#c4943d] text-center text-lg mb-20"
        >
          The process
        </motion.p>

        <div className="grid md:grid-cols-3 gap-14">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: i * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <span
                style={{ fontFamily: "var(--font-serif)", color: "#b8b0a6" }}
                className="text-5xl block"
              >
                {step.num}
              </span>
              <h3
                style={{ fontFamily: "var(--font-display)" }}
                className="text-xl font-bold tracking-tight"
              >
                {step.title}
              </h3>
              <p className="text-[#6b635a] text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Final CTA — dark ─────────────────────────────── */}
      <section
        style={{ backgroundColor: "#0e0d0b" }}
        className="px-8 py-36 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto space-y-10"
        >
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-4xl md:text-5xl font-bold leading-tight tracking-[-0.04em] text-white"
          >
            Your next home is{" "}
            <span
              style={{ fontFamily: "var(--font-serif)", color: "#c4943d" }}
              className="italic font-normal"
            >
              one conversation away.
            </span>
          </h2>
          <Link
            href="/call"
            className="inline-flex items-center gap-2 px-9 py-4 text-sm font-bold rounded-full transition-colors"
            style={{
              backgroundColor: "#c4943d",
              color: "#1a1714",
              boxShadow: "0 8px 32px -8px rgba(196,148,61,0.45)",
            }}
          >
            Start your search →
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
