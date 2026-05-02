"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const listingTiles = [
  {
    label: "Intent Match",
    value: "96%",
    note: "Matches your area, budget, and amenities in one intent score.",
  },
  {
    label: "Smart Shortlist",
    value: "Top",
    note: "Only the strongest options, filtered to high-fit rental choices.",
  },
  {
    label: "Search Time Saved",
    value: "8x",
    note: "Skip tab-hopping and compare curated results in one flow.",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [surfaceTone, setSurfaceTone] = useState<"white" | "orange">("white");
  const pointerX = useMotionValue(-320);
  const pointerY = useMotionValue(-320);
  const smoothX = useSpring(pointerX, {
    stiffness: 220,
    damping: 30,
    mass: 0.35,
  });
  const smoothY = useSpring(pointerY, {
    stiffness: 220,
    damping: 30,
    mass: 0.35,
  });
  const glowColor =
    surfaceTone === "orange"
      ? "rgba(255,255,255,0.5)"
      : "rgba(251,146,60,0.18)";
  const cursorGlow = useMotionTemplate`radial-gradient(240px circle at ${smoothX}px ${smoothY}px, ${glowColor}, transparent 72%)`;

  return (
    <main
      className="relative overflow-x-clip text-center"
      onMouseMove={(event) => {
        pointerX.set(event.clientX);
        pointerY.set(event.clientY);
        const target = event.target as HTMLElement | null;
        const surface = target?.closest<HTMLElement>("[data-glow-surface]");
        const nextTone =
          surface?.dataset.glowSurface === "orange" ? "orange" : "white";
        if (nextTone !== surfaceTone) {
          setSurfaceTone(nextTone);
        }
      }}
    >
      <div aria-hidden className="mesh-layer" />
      <div aria-hidden className="mesh-grain" />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10"
        style={{ background: cursorGlow }}
      />

      <header
        data-glow-surface="white"
        className="sticky top-0 z-20 border-b border-orange-200/80 bg-white/90 backdrop-blur-xl"
      >
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-center gap-4 px-6 py-4 md:px-10">
          <p className="text-sm tracking-[0.22em] text-zinc-900 uppercase">
            TrueNest AI
          </p>
          <Link
            href="#highlight"
            data-glow-surface="orange"
            className="rounded-full border border-orange-300 bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_14px_30px_-18px_rgba(249,115,22,0.95)] transition hover:bg-orange-600"
          >
            Explore Now
          </Link>
        </nav>
      </header>

      <section
        data-glow-surface="white"
        className="mx-auto w-full max-w-6xl px-6 pt-18 pb-16 md:px-10 md:pt-24"
      >
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "show"}
          variants={reveal}
          className="space-y-7"
        >
          <h1 className="mx-auto max-w-4xl text-4xl leading-tight text-zinc-950 md:text-6xl">
            Describe your ideal rental once, and we return your best-fit homes
            instantly.
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-700 md:text-lg">
            We deliver the <strong>best matches</strong> by area, size, and
            budget with minimal hassle.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/call"
              data-glow-surface="orange"
              className="rounded-full border border-orange-300 bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_22px_45px_-24px_rgba(249,115,22,0.98)] transition hover:bg-orange-600"
            >
              Find Your Home
            </Link>
            <p className="rounded-full border border-orange-200 bg-white px-4 py-3 text-xs font-semibold tracking-[0.12em] text-orange-700 uppercase">
              One search • best listings
            </p>
          </div>
        </motion.div>
      </section>

      <section
        data-glow-surface="white"
        className="mx-auto w-full max-w-6xl px-6 pb-16 md:px-10"
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-5 md:grid-cols-3"
        >
          {listingTiles.map((tile, index) => (
            <motion.article
              key={tile.label}
              data-glow-surface="orange"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              animate={
                reduceMotion
                  ? undefined
                  : { y: [0, -6 - index * 2, 0], rotate: [0, 0.2, 0] }
              }
              transition={{
                opacity: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                repeat: Number.POSITIVE_INFINITY,
                duration: 5.5 + index,
                ease: "easeInOut",
              }}
              className="group relative overflow-hidden rounded-2xl border border-orange-300/80 bg-gradient-to-br from-orange-200/70 via-orange-100 to-orange-50 shadow-[0_35px_70px_-58px_rgba(249,115,22,0.35)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.55),transparent_42%),radial-gradient(circle_at_82%_84%,rgba(251,146,60,0.3),transparent_38%)]" />
              <div className="relative space-y-3 px-5 py-6 text-center">
                <p className="text-xs font-semibold tracking-[0.16em] text-orange-800 uppercase">
                  {tile.label}
                </p>
                <p className="text-5xl leading-none text-orange-700 md:text-6xl">
                  {tile.value}
                </p>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-zinc-800">
                  {tile.note}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section
        data-glow-surface="white"
        className="mx-auto w-full max-w-6xl px-6 pb-24 md:px-10"
      >
        <motion.article
          id="highlight"
          data-glow-surface="orange"
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
          variants={reveal}
          className="relative overflow-hidden rounded-3xl border border-orange-400/45 bg-orange-500 p-6 md:p-10"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-100 transition"
            style={{
              background: `radial-gradient(360px circle at 50% 50%, rgba(255,237,213,0.35), transparent 70%)`,
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.35),transparent_44%),radial-gradient(circle_at_85%_80%,rgba(234,88,12,0.28),transparent_40%)]" />

          <div className="relative z-10 space-y-5 text-center">
            <p className="mx-auto w-fit rounded-full border border-orange-100/65 bg-white/20 px-3 py-2 text-xs font-semibold tracking-[0.12em] text-orange-50 uppercase">
              Cursor highlight section
            </p>
            <h2 className="mx-auto max-w-4xl text-3xl leading-tight text-white md:text-5xl">
              Your description becomes a ranked shortlist built for your exact
              rental goals.
            </h2>
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-orange-50 md:text-lg">
              Example:
              <strong>
                “2BHK near Whitefield, around 900 sqft, budget 25k–32k,
                furnished, lift and parking needed.”
              </strong>
            </p>
          </div>
        </motion.article>
      </section>
    </main>
  );
}
