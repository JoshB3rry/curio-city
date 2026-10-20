type CurioWordmarkProps = { mode: "light" | "dark" };

// "Curio.city" wordmark on its own, no mascot. Used in the expanded sidebar.
export function CurioWordmark({ mode }: CurioWordmarkProps) {
  return (
    <div className="openui-agent-sidebar-header__agent-name">
      <span
        style={{
          fontWeight: 700,
          fontSize: "1.05rem",
          letterSpacing: "-0.02em",
          color: mode === "dark" ? "#f5f3ee" : "#1c1a16",
        }}
      >
        Curio<span style={{ opacity: 0.55, fontWeight: 400 }}>.city</span>
      </span>
    </div>
  );
}
