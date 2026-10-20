"use client";

import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Turn {
  role: "user" | "assistant";
  text: string;
}

/** Intentional voice entry point for the thread header. */
export function VoiceHeaderButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label="Start a voice conversation"
      title="Talk to Curio"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 999,
        background: "var(--openui-interactive-accent-default)",
        color: "var(--openui-text-accent-primary)",
        border: "none",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <line x1="12" y1="17" x2="12" y2="22" />
      </svg>
      Voice
    </button>
  );
}

function VoiceSession({ onClose }: { onClose: () => void }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [muted, setMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const conversation = useConversation({
    onConnect: () => setConnecting(false),
    onDisconnect: () => setConnecting(true),
    onError: (e) => {
      console.error("voice error", e);
      setError("Voice connection hit a snag. Try again.");
      setConnecting(false);
    },
    onMessage: (msg: { message: string; source: "ai" | "user" }) => {
      const role: Turn["role"] = msg.source === "ai" ? "assistant" : "user";
      setTurns((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === role) {
          const next = [...prev];
          next[next.length - 1] = { role, text: (last.text + " " + msg.message).trim() };
          return next;
        }
        return [...prev, { role, text: msg.message }];
      });
    },
  });

  const { status, isSpeaking } = conversation;

  /* ---------- live mic waveform ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;
      ctx2d.clearRect(0, 0, w, h);
      const accent =
        getComputedStyle(document.body)
          .getPropertyValue("--openui-interactive-accent-default")
          .trim() || "#1F4D3B";
      ctx2d.fillStyle = accent;

      const bars = 64;
      const gap = 5;
      const bw = (w - gap * (bars - 1)) / bars;
      let data: Uint8Array<ArrayBuffer> | null = null;
      const analyser = analyserRef.current;
      if (analyser && !isSpeaking && !connecting) {
        data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
        analyser.getByteFrequencyData(data);
      }
      for (let i = 0; i < bars; i++) {
        let level: number;
        if (data) {
          const v = data[Math.floor((i / bars) * data.length * 0.7)] / 255;
          level = Math.max(0.06, v);
        } else if (isSpeaking) {
          const t = Date.now() / 450;
          level = 0.35 + 0.3 * Math.abs(Math.sin(t + i * 0.4));
        } else {
          // gentle breathing while connecting
          const t = Date.now() / 900;
          level = 0.1 + 0.05 * Math.sin(t + i * 0.2);
        }
        const bh = Math.max(3, level * h);
        const x = i * (bw + gap);
        const y = (h - bh) / 2;
        ctx2d.beginPath();
        ctx2d.roundRect(x, y, bw, bh, bw / 2);
        ctx2d.fill();
      }
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isSpeaking, connecting]);

  /* ---------- session lifecycle ---------- */
  const startSession = useCallback(async () => {
    setError(null);
    setConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const actx = new Ctx();
      audioCtxRef.current = actx;
      const source = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const res = await fetch("/api/voice-signed-url");
      if (!res.ok) throw new Error("no signed url");
      const { signed_url } = (await res.json()) as { signed_url?: string };
      if (!signed_url) throw new Error("no signed url");

      await conversation.startSession({ signedUrl: signed_url } as never);
    } catch (e) {
      console.error(e);
      setError("Couldn't start the voice session. Check your mic and try again.");
      setConnecting(false);
    }
  }, [conversation]);

  const stopAll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    try {
      conversation.endSession();
    } catch {
      /* noop */
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }, [conversation]);

  useEffect(() => {
    void startSession();
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    stopAll();
    onClose();
  }, [onClose, stopAll]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    conversation.setMuted(next);
  }, [conversation, muted]);

  const statusLabel = connecting
    ? "Connecting…"
    : isSpeaking
      ? "Curio is speaking — jump in anytime"
      : status === "connected"
        ? "Listening — just talk"
        : "Reconnecting…";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice conversation with Curio"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "var(--openui-background)",
        color: "var(--openui-text-neutral-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* top bar */}
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 20,
            color: "var(--openui-text-neutral-primary)",
          }}
        >
          Talking with Curio
        </div>
        <button
          onClick={handleClose}
          aria-label="Close voice mode"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--openui-text-neutral-secondary)",
            fontSize: 24,
            cursor: "pointer",
            padding: 8,
          }}
        >
          ×
        </button>
      </div>

      {/* waveform hero */}
      <div style={{ padding: "24px 0 8px" }}>
        <canvas
          ref={canvasRef}
          width={560}
          height={110}
          style={{ width: "min(560px, 88vw)", height: 110 }}
        />
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "var(--openui-text-neutral-tertiary)",
            margin: "10px 0 0",
            minHeight: 20,
          }}
        >
          {statusLabel}
        </p>
      </div>

      {/* live transcript */}
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          flex: 1,
          overflowY: "auto",
          padding: "8px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          justifyContent: turns.length ? "flex-start" : "center",
        }}
      >
        {turns.length === 0 && !error && (
          <p
            style={{
              textAlign: "center",
              color: "var(--openui-text-neutral-secondary)",
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: "italic",
              fontSize: 19,
            }}
          >
            {connecting ? "Warming up the voice…" : "Just start talking — I'm listening."}
          </p>
        )}
        {turns.map((t, i) => (
          <div
            key={i}
            style={{
              alignSelf: t.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              padding: "10px 16px",
              borderRadius: 18,
              background:
                t.role === "user" ? "var(--openui-chat-user-response-bg)" : "var(--openui-foreground)",
              color:
                t.role === "user"
                  ? "var(--openui-chat-user-response-text)"
                  : "var(--openui-text-neutral-primary)",
              border: t.role === "user" ? "none" : "1px solid var(--openui-border-default)",
              fontSize: 15,
              lineHeight: 1.55,
            }}
          >
            {t.text}
          </div>
        ))}
        {error && (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--openui-text-danger-primary)" }}>{error}</p>
            <button
              onClick={() => void startSession()}
              style={{
                marginTop: 8,
                padding: "10px 28px",
                borderRadius: 999,
                border: "none",
                background: "var(--openui-interactive-accent-default)",
                color: "var(--openui-text-accent-primary)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "20px 0 44px" }}>
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          title={muted ? "Unmute" : "Mute"}
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: "1px solid var(--openui-border-default)",
            background: "transparent",
            color: "var(--openui-text-neutral-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {muted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></svg>
          )}
        </button>
        <button
          onClick={handleClose}
          aria-label="End call"
          title="End call"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: "none",
            background: "#b3261e",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            <path d="m16 2 6 6" />
            <path d="m22 2-6 6" />
          </svg>
        </button>
        <button
          onClick={() => setTurns([])}
          aria-label="Clear transcript"
          title="Clear transcript"
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: "1px solid var(--openui-border-default)",
            background: "transparent",
            color: "var(--openui-text-neutral-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
        </button>
      </div>
    </div>
  );
}

/** Full-screen duplex voice overlay, powered by ElevenLabs Conversational AI. */
export function VoiceMode({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <ConversationProvider>
      <VoiceSession onClose={onClose} />
    </ConversationProvider>
  );
}
