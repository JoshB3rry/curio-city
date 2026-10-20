"use client";

import { CurioMascot } from "@/components/curio-mascot";
import { CurioWordmark } from "@/components/curio-wordmark";
import { VoiceHeaderButton, VoiceMode } from "@/components/voice-mode";
import { curioDark, curioLight } from "@/lib/curio-theme";
import { usePersistedModel } from "@/hooks/use-persisted-model";
import { MODEL_OPTIONS } from "@/lib/models";
import { CURIO_LOGO, STARTERS } from "@/lib/starters";
import {
  AgentInterface,
  fetchLLM,
  langGraphAdapter,
  langGraphMessageFormat,
  ModelSwitcher,
  openuiLibrary,
  useOpenuiCloudStorage,
  useThemeModePreference,
} from "@openuidev/react-ui";
import { useState } from "react";

export default function CloudChat() {
  // Follows the system theme until the footer toggle is first used, then
  // remembers the choice.
  const { setPreference, mode } = useThemeModePreference();
  const [selectedModel, setSelectedModel] = usePersistedModel();
  const [voiceOpen, setVoiceOpen] = useState(false);
  // The /api/chat route runs the LangGraph agent in-process and streams its
  // native `messages`-mode SSE. Outgoing messages are converted to LangChain
  // shape here so the route can pass them to the graph as-is.
  const llm = fetchLLM({
    url: "/api/chat",
    streamAdapter: langGraphAdapter(),
    messageFormat: langGraphMessageFormat,
    body: { model: selectedModel },
  });

  const storage = useOpenuiCloudStorage({
    token: "/api/frontend-token",
    apiBaseUrl: "https://api.thesys.dev",
    features: { artifact: false },
  });

  return (
    <AgentInterface
      storage={storage}
      llm={llm}
      componentLibrary={openuiLibrary}
      logoUrl={CURIO_LOGO}
      theme={{ mode, lightTheme: curioLight, darkTheme: curioDark }}
      starters={STARTERS}
    >
      <AgentInterface.SidebarHeader agentName={<CurioWordmark mode={mode} />} />
      <AgentInterface.SidebarFooter>
        <AgentInterface.ThemeModeToggle mode={mode} onModeChange={setPreference} />
      </AgentInterface.SidebarFooter>
      <AgentInterface.MobileHeader
        agentName=""
        logo={
          <ModelSwitcher
            models={MODEL_OPTIONS}
            value={selectedModel}
            onValueChange={setSelectedModel}
          />
        }
      />
      <AgentInterface.ThreadHeader
        showChatTitle={false}
        start={
          <ModelSwitcher
            models={MODEL_OPTIONS}
            value={selectedModel}
            onValueChange={setSelectedModel}
          />
        }
        end={<VoiceHeaderButton onOpen={() => setVoiceOpen(true)} />}
      />
      <AgentInterface.Welcome
        image={<CurioMascot />}
        title="What are you curious about?"
        starterVariant="card"
        glowAnimation
      />
      <VoiceMode open={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </AgentInterface>
  );
}
