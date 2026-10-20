// Curio.city mascot: a magnifying glass (curiosity) revealing a tiny city
// skyline in its lens. Original artwork for Curio.city — same placement and
// sizing vibe as the default mascot (98px, shrinks on mobile).
export function CurioMascot({ className }: { className?: string }) {
  return (
    <span
      className={className ?? "openui-agent-welcome-mascot"}
      style={{
        color: "var(--openui-interactive-accent-default)",
        display: "inline-block",
      }}
      role="img"
      aria-label="Curio.city"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <clipPath id="curio-lens-clip">
          <circle cx="50" cy="48" r="23" />
        </clipPath>
        {/* lens */}
        <circle
          cx="50"
          cy="48"
          r="30"
          stroke="currentColor"
          strokeWidth="7"
        />
        {/* handle */}
        <line
          x1="70"
          y1="68"
          x2="94"
          y2="92"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* city skyline inside the lens */}
        <g clipPath="url(#curio-lens-clip)" fill="currentColor">
          <rect x="33" y="54" width="10" height="16" rx="1" />
          <rect x="45" y="42" width="12" height="28" rx="1" />
          <rect x="59" y="58" width="9" height="12" rx="1" />
          <rect x="31" y="69" width="40" height="4" rx="2" />
          {/* curiosity sparkle above the tallest tower */}
          <path d="M51 26 L52.8 32.2 L59 34 L52.8 35.8 L51 42 L49.2 35.8 L43 34 L49.2 32.2 Z" />
        </g>
      </svg>
    </span>
  );
}
