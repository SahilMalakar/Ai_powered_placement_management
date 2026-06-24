import {
  FileJson,
  ScanSearch,
  BadgeCheck,
  Briefcase,
  Bell,
  Download,
  Wand2,
} from "lucide-react";

const JSON_SNIPPET = `{
  "name": "Arjun Sharma",
  "cgpa": 8.4,
  "skills": [
    "TypeScript",
    "Node.js",
    "PostgreSQL"
  ],
  "projects": [
    {
      "title": "PlacementCube",
      "stack": "Next.js + Express"
    }
  ]
}`;

const ATS_BARS = [
  { label: "Keywords", score: 92 },
  { label: "Format", score: 87 },
  { label: "Skills match", score: 74 },
];

const OPTIMIZE_DIFF = [
  {
    before: "Worked on backend systems for college project.",
    after:  "Engineered a Node.js/Express REST API serving 500+ concurrent users with sub-50ms p99 latency.",
  }
];

function ResumeMockup() {
  return (
    <div
      className="mt-4 rounded-lg overflow-hidden border text-xs flex-1"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.35)",
        fontFamily: "var(--font-geist-mono)",
      }}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-2 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.4)" }}
      >
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          resume.json
        </span>
      </div>
      <pre
        className="p-3 leading-relaxed overflow-hidden"
        style={{ color: "#a5b4fc", fontSize: "11px", maxHeight: "140px" }}
      >
        {JSON_SNIPPET}
      </pre>
    </div>
  );
}

function ATSMockup() {
  return (
    <div className="mt-4 space-y-2.5">
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className="text-3xl font-extrabold"
          style={{ fontFamily: "var(--font-plus-jakarta)", color: "var(--success)" }}
        >
          87
        </span>
        <span className="text-xs" style={{ color: "var(--muted-text)" }}>
          / 100 ATS score
        </span>
      </div>
      {ATS_BARS.map((bar) => (
        <div key={bar.label}>
          <div className="flex justify-between text-xs mb-1" style={{ color: "var(--muted-text)" }}>
            <span style={{ fontFamily: "var(--font-inter)" }}>{bar.label}</span>
            <span style={{ fontFamily: "var(--font-geist-mono)" }}>{bar.score}%</span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${bar.score}%`,
                background: "linear-gradient(90deg, #1a6efc, #6366f1)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function OptimizeMockup() {
  return (
    <div
      className="mt-4 rounded-lg overflow-hidden border flex-1"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.25)",
      }}
    >
      {/* Header row */}
      <div
        className="grid grid-cols-2 border-b text-[10px] font-medium tracking-widest uppercase"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.35)",
          fontFamily: "var(--font-geist-mono)",
        }}
      >
        <div
          className="px-3 py-2 border-r flex items-center gap-1.5"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(239,68,68,0.7)" }}
        >
          <span>−</span> before
        </div>
        <div className="px-3 py-2 flex items-center gap-1.5" style={{ color: "rgba(34,197,94,0.8)" }}>
          <span>+</span> after
        </div>
      </div>

      {/* Diff rows */}
      {OPTIMIZE_DIFF.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-2 border-b last:border-b-0"
          style={{ borderColor: "rgba(255,255,255,0.04)" }}
        >
          <div
            className="px-3 py-2.5 border-r text-[11px] leading-relaxed"
            style={{
              borderColor: "rgba(255,255,255,0.04)",
              fontFamily: "var(--font-geist-mono)",
              color: "rgba(239,68,68,0.6)",
              background: "rgba(239,68,68,0.04)",
            }}
          >
            {row.before}
          </div>
          <div
            className="px-3 py-2.5 text-[11px] leading-relaxed"
            style={{
              fontFamily: "var(--font-geist-mono)",
              color: "rgba(34,197,94,0.85)",
              background: "rgba(34,197,94,0.04)",
            }}
          >
            {row.after}
          </div>
        </div>
      ))}
    </div>
  );
}

const SMALL_FEATURES = [
  {
    icon: BadgeCheck,
    title: "OCR Verification",
    desc: "Marksheets verified against declared CGPA/SGPA using AI-powered OCR — no manual admin checks.",
  },
  {
    icon: Briefcase,
    title: "Smart Job Search",
    desc: "Browse active listings filtered by branch, CGPA, and backlog eligibility. Applied rules enforced server-side.",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    desc: "Batch email blasts to 500+ students the moment a new company goes live. Branch-targeted broadcasts.",
  },
  {
    icon: Download,
    title: "CSV Export",
    desc: "Async export of students and applications to CSV with Cloudinary-hosted download links for admins.",
  },
];

export function BentoFeatures() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-16">
      <p
        className="text-xs font-medium tracking-widest uppercase mb-2"
        style={{ fontFamily: "var(--font-geist-mono)", color: "var(--brand-blue)" }}
      >
        Everything you need
      </p>
      <h2
        className="text-2xl md:text-3xl font-bold mb-10"
        style={{ fontFamily: "var(--font-plus-jakarta)" }}
      >
        Built for the full placement cycle
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Row 1 — AI Resume (2 cols) + ATS Scorer (1 col) */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 flex flex-col"
          style={{
            background: "linear-gradient(135deg, #1a6efc 0%, #3b82f6 40%, #6366f1 100%)",
            minHeight: "280px",
          }}
        >
          <FileJson size={22} className="mb-3" style={{ color: "rgba(255,255,255,0.85)" }} />
          <p className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-plus-jakarta)", color: "#fff" }}>
            AI Resume Builder
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            Groq LLM generates a structured JSON resume from your profile. Edit it, version it, export to PDF on demand.
          </p>
          <ResumeMockup />
        </div>

        <div
          className="rounded-2xl p-6 border flex flex-col"
          style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}
        >
          <ScanSearch size={22} className="mb-3" style={{ color: "var(--brand-blue)" }} />
          <p className="text-base font-bold mb-1" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
            ATS Scorer
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-text)" }}>
            Paste a job description, get an ATS breakdown with keyword gaps and suggestions in seconds.
          </p>
          <ATSMockup />
        </div>

        {/* Row 2 — 3 small cards */}
        {SMALL_FEATURES.slice(0, 3).map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl p-5 border flex flex-col gap-3"
            style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}
          >
            <Icon size={20} style={{ color: "var(--brand-blue)" }} />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                {title}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-text)" }}>
                {desc}
              </p>
            </div>
          </div>
        ))}

        {/* Row 3 — CSV Export (1 col) + Optimize Resume (2 cols) */}
        <div
          className="rounded-2xl p-5 border flex flex-col gap-3"
          style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}
        >
          <Download size={20} style={{ color: "var(--brand-blue)" }} />
          <div>
            <p className="text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              {SMALL_FEATURES[3].title}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-text)" }}>
              {SMALL_FEATURES[3].desc}
            </p>
          </div>
        </div>

        {/* Optimize Resume — large card, spans 2 cols */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 flex flex-col"
          style={{
            background: "linear-gradient(135deg, #1a6efc 0%, #3b82f6 40%, #6366f1 100%)",
            minHeight: "280px",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Wand2 size={22} style={{ color: "rgba(255,255,255,0.85)" }} />
            <span
              className="text-[10px] font-medium tracking-widest uppercase px-2 py-0.5 rounded-full"
              style={{
                fontFamily: "var(--font-geist-mono)",
                background: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              LLM-powered
            </span>
          </div>
          <p className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-plus-jakarta)", color: "#fff" }}>
            Optimize Resume
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            Upload your existing resume and our LLM rewrites every bullet — sharper language, stronger keywords, measurable impact.
          </p>
          <OptimizeMockup />
        </div>

      </div>
    </section>
  );
}
