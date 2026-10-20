import { CurioMascot } from "@/components/curio-mascot";

export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAF6EE",
      }}
    >
      <div style={{ width: 96, color: "#1F4D3B", animation: "curio-pulse 1.6s ease-in-out infinite" }}>
        <CurioMascot />
        <style>{`@keyframes curio-pulse { 0%,100% { opacity: 0.45; transform: scale(0.97);} 50% { opacity: 1; transform: scale(1);} }`}</style>
      </div>
    </div>
  );
}
