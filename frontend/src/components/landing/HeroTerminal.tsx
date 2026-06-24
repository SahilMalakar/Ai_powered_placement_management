"use client";

import { useEffect, useRef, useState } from "react";

type TerminalLine = {
  prefix: string;
  text: string;
  color: string;
};

type StudentSession = {
  student: string;
  lines: TerminalLine[];
};

const SESSIONS: StudentSession[] = [
  {
    student: "Arjun Sharma · CSE",
    lines: [
      { prefix: "$", text: "placements init --student \"Arjun Sharma\"", color: "text-blue-400" },
      { prefix: "✓", text: "profile verified · CGPA 8.4 · CSE branch", color: "text-green-400" },
      { prefix: "~", text: "generating resume.json via Groq LLM...", color: "text-yellow-400" },
      { prefix: "✓", text: "resume.json ready · 3 versions saved", color: "text-green-400" },
      { prefix: "~", text: "running ATS analysis against job #TCS-2024...", color: "text-yellow-400" },
      { prefix: "✓", text: "ATS score: 87/100 · 4 suggestions generated", color: "text-green-400" },
      { prefix: "✓", text: "application submitted · status: SHORTLISTED", color: "text-green-400" },
    ],
  },
  {
    student: "Priya Nair · ETE",
    lines: [
      { prefix: "$", text: "placements init --student \"Priya Nair\"", color: "text-blue-400" },
      { prefix: "✓", text: "profile verified · CGPA 9.1 · ETE branch", color: "text-green-400" },
      { prefix: "~", text: "uploading existing resume for optimization...", color: "text-yellow-400" },
      { prefix: "✓", text: "resume optimized · 12 improvements applied", color: "text-green-400" },
      { prefix: "~", text: "running ATS analysis against job #Wipro-2024...", color: "text-yellow-400" },
      { prefix: "✓", text: "ATS score: 91/100 · 2 suggestions generated", color: "text-green-400" },
      { prefix: "✓", text: "application submitted · status: SELECTED", color: "text-green-400" },
    ],
  },
  {
    student: "Rohan Mehta · MECHANICAL",
    lines: [
      { prefix: "$", text: "placements init --student \"Rohan Mehta\"", color: "text-blue-400" },
      { prefix: "✓", text: "profile verified · CGPA 7.8 · MECHANICAL branch", color: "text-green-400" },
      { prefix: "~", text: "generating resume.json via Groq LLM...", color: "text-yellow-400" },
      { prefix: "✓", text: "resume.json ready · 1 version saved", color: "text-green-400" },
      { prefix: "~", text: "uploading existing resume for optimization...", color: "text-yellow-400" },
      { prefix: "✓", text: "resume optimized · 8 improvements applied", color: "text-green-400" },
      { prefix: "~", text: "running ATS analysis against job #Bosch-2024...", color: "text-yellow-400" },
      { prefix: "✓", text: "ATS score: 79/100 · 6 suggestions generated", color: "text-green-400" },
      { prefix: "✓", text: "application submitted · status: SHORTLISTED", color: "text-green-400" },
    ],
  },
  {
    student: "Soham Rao · ELECTRICAL",
    lines: [
      { prefix: "$", text: "placements init --student \"Sneha Rao\"", color: "text-blue-400" },
      { prefix: "✓", text: "profile verified · CGPA 8.9 · ELECTRICAL branch", color: "text-green-400" },
      { prefix: "~", text: "uploading existing resume for optimization...", color: "text-yellow-400" },
      { prefix: "✓", text: "resume optimized · 15 improvements applied", color: "text-green-400" },
      { prefix: "~", text: "running ATS analysis against job #Siemens-2024...", color: "text-yellow-400" },
      { prefix: "✓", text: "ATS score: 94/100 · 1 suggestion generated", color: "text-green-400" },
      { prefix: "✓", text: "application submitted · status: SELECTED", color: "text-green-400" },
    ],
  },
];

const STATS = [
  { value: "500+", label: "Students onboarded" },
  { value: "50+", label: "Companies hiring" },
  { value: "87%", label: "Avg. ATS score" },
];

const CHAR_SPEED = 26;
const LINE_PAUSE = 200;
const SESSION_PAUSE = 1800;
const CLEAR_DURATION = 400;

export function HeroTerminal() {
  const [sessionIndex, setSessionIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [clearing, setClearing] = useState(false);

  const charTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const session = SESSIONS[sessionIndex];
  const totalLines = session.lines.length;

  const clearTimers = () => {
    if (charTimer.current) clearTimeout(charTimer.current);
    if (lineTimer.current) clearTimeout(lineTimer.current);
  };

  useEffect(() => {
    clearTimers();

    if (visibleLines >= totalLines) {
      lineTimer.current = setTimeout(() => {
        setClearing(true);
        lineTimer.current = setTimeout(() => {
          setClearing(false);
          setSessionIndex((s) => (s + 1) % SESSIONS.length);
          setVisibleLines(0);
          setCharIndex(0);
        }, CLEAR_DURATION);
      }, SESSION_PAUSE);
      return () => clearTimers();
    }

    const currentLineText = session.lines[visibleLines].text;

    if (charIndex < currentLineText.length) {
      charTimer.current = setTimeout(() => {
        setCharIndex((c) => c + 1);
      }, CHAR_SPEED);
      return () => clearTimers();
    }

    lineTimer.current = setTimeout(() => {
      setVisibleLines((l) => l + 1);
      setCharIndex(0);
    }, LINE_PAUSE);

    return () => clearTimers();
  }, [visibleLines, charIndex, sessionIndex, totalLines, session.lines]);

  return (
    <section className="relative w-full pt-24 pb-16 flex flex-col items-center">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-[0.07] blur-3xl rounded-full"
        style={{ background: "linear-gradient(135deg, #1a6efc, #6366f1)" }}
      />

      {/* Eyebrow */}
      <span
        className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase mb-6 px-3 py-1.5 rounded-full border"
        style={{
          fontFamily: "var(--font-geist-mono)",
          color: "var(--brand-blue)",
          borderColor: "rgba(26,110,252,0.25)",
          background: "rgba(26,110,252,0.07)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#1a6efc] animate-pulse" />
        AI-Powered Campus Placement
      </span>

      {/* Headline */}
      <h1
        className="text-center text-4xl md:text-6xl font-extrabold leading-[1.08] tracking-tight mb-5 max-w-3xl"
        style={{ fontFamily: "var(--font-plus-jakarta)" }}
      >
        From campus
        <span
          className="block"
          style={{
            background: "linear-gradient(135deg, #1a6efc 0%, #3b82f6 50%, #6366f1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          to career, automated.
        </span>
      </h1>

      <p
        className="text-center text-base md:text-lg max-w-xl mb-10 leading-relaxed"
        style={{ color: "var(--muted-text)", fontFamily: "var(--font-inter)" }}
      >
        Verify academics, generate AI resumes, score against ATS, optimize your resume and land your first job — all in one platform built for engineering colleges.
      </p>

      {/* Terminal + Stats row */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-4 items-start px-4">

        {/* Terminal window — spans 2 cols */}
        <div
          className="lg:col-span-2 rounded-xl overflow-hidden border"
          style={{
            background: "#0a0a0a",
            borderColor: "#242424",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ borderColor: "#1e1e1e", background: "#111111" }}
          >
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span
              className="ml-3 text-xs"
              style={{ fontFamily: "var(--font-geist-mono)", color: "#6B7280" }}
            >
              placement-cube · terminal
            </span>
            {/* Active student badge */}
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{
                fontFamily: "var(--font-geist-mono)",
                background: "rgba(26,110,252,0.12)",
                color: "#60a5fa",
                border: "1px solid rgba(26,110,252,0.2)",
                transition: "opacity 0.3s",
                opacity: clearing ? 0 : 1,
              }}
            >
              {session.student}
            </span>
          </div>

          {/* Lines */}
          <div
            className="p-5 min-h-[240px] space-y-1.5"
            style={{
              transition: "opacity 0.3s ease",
              opacity: clearing ? 0 : 1,
            }}
          >
            {session.lines.slice(0, visibleLines).map((line, i) => (
              <div
                key={`${sessionIndex}-${i}`}
                className="flex gap-3 text-sm"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                <span className={`${line.color} shrink-0`} style={{ minWidth: "14px" }}>
                  {line.prefix}
                </span>
                <span style={{ color: "#E8EDF5" }}>{line.text}</span>
              </div>
            ))}

            {!clearing && visibleLines < totalLines && (
              <div
                className="flex gap-3 text-sm"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                <span
                  className={`${session.lines[visibleLines].color} shrink-0`}
                  style={{ minWidth: "14px" }}
                >
                  {session.lines[visibleLines].prefix}
                </span>
                <span style={{ color: "#E8EDF5" }}>
                  {session.lines[visibleLines].text.slice(0, charIndex)}
                  <span className="animate-pulse" style={{ color: "#1a6efc" }}>▋</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div className="flex flex-col gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border px-5 py-5"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <p
                className="text-3xl font-extrabold mb-1"
                style={{
                  fontFamily: "var(--font-plus-jakarta)",
                  background: "linear-gradient(135deg, #1a6efc, #6366f1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </p>
              <p
                className="text-sm"
                style={{ color: "var(--muted-text)", fontFamily: "var(--font-inter)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
