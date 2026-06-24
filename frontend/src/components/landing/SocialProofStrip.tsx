export function SocialProofStrip() {
  const items = [
    "500+ Students",
    "50+ Companies",
    "AI-Powered Resumes",
    "OCR Verification",
    "Optimized Resume",
    "ATS Scoring",
  ];

  return (
    <div
      className="w-full border-y py-4 overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-2 px-4">
        {items.map((item, i) => (
          <span key={item} className="flex items-center gap-3">
            <span
              className="text-sm font-medium whitespace-nowrap"
              style={{
                fontFamily: "var(--font-geist-mono)",
                color: "var(--success)",
              }}
            >
              {item}
            </span>
            {i < items.length - 1 && (
              <span style={{ color: "var(--border)", fontSize: "18px" }}>·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
