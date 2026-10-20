import { requiredEnv } from "@/lib/env";

export const runtime = "nodejs";

/** Curio's ElevenLabs conversational AI agent (duplex voice). */
export const CURIO_VOICE_AGENT_ID = "agent_3701m5bd423rf7ptg9hxf2a7xxpr";

/**
 * Returns a short-lived signed WebSocket URL for the Curio voice agent.
 * The ElevenLabs API key stays server-side; the client connects with this
 * signed URL instead.
 */
export async function GET() {
  const apiKey = requiredEnv("ELEVENLABS_API_KEY");
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${CURIO_VOICE_AGENT_ID}`,
    { headers: { "xi-api-key": apiKey } }
  );
  if (!res.ok) {
    return Response.json({ error: "could not create voice session" }, { status: 502 });
  }
  const data = (await res.json()) as { signed_url?: string };
  if (!data.signed_url) {
    return Response.json({ error: "could not create voice session" }, { status: 502 });
  }
  return Response.json({ signed_url: data.signed_url });
}
