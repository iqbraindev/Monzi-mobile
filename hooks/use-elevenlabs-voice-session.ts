import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react-native";

import { useApiClient } from "@/lib/api";
import { ensureLiveKitPlaybackVolume } from "@/lib/livekit-audio-session";
import { formatVoiceConnectionError } from "@/lib/voice-errors";
import type { VoiceSessionResponse, VoiceSessionState } from "@/lib/voice-types";

const VAD_SPEAKING_THRESHOLD = 0.6;

export interface VoiceSessionAgentOptions {
  voiceAllowed: boolean;
  voiceEnabledOnAgent: boolean;
}

export function useElevenLabsVoiceSession() {
  const { apiFetch } = useApiClient();
  const conversation = useConversation({ volume: 1, micMuted: false });

  const [state, setState] = useState<VoiceSessionState>("idle");
  const [error, setError] = useState<string | null>(null);

  const connectingRef = useRef(false);
  const intentionalDisconnectRef = useRef(false);
  const greetingDoneRef = useRef(false);
  const agentSpeakingRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);

  const ensurePlaybackReady = useCallback(() => {
    try {
      conversation.setVolume({ volume: 1 });
    } catch {
      // Conversation may not be registered yet.
    }
    void ensureLiveKitPlaybackVolume();
  }, [conversation]);

  const disconnect = useCallback(async () => {
    intentionalDisconnectRef.current = true;
    greetingDoneRef.current = false;
    agentSpeakingRef.current = false;
    connectingRef.current = false;

    try {
      conversation.setVolume({ volume: 0 });
    } catch {
      // Session may already be torn down.
    }

    conversation.endSession();
    setState("idle");
    setError(null);
  }, [conversation]);

  const connect = useCallback(
    async (targetAgentId: string, agentOptions: VoiceSessionAgentOptions) => {
      const canUseVoice =
        agentOptions.voiceAllowed && agentOptions.voiceEnabledOnAgent;
      if (!canUseVoice || connectingRef.current) return;

      if (
        conversation.status !== "disconnected" &&
        conversation.status !== "error"
      ) {
        conversation.endSession();
      }

      connectingRef.current = true;
      intentionalDisconnectRef.current = false;
      greetingDoneRef.current = false;
      agentSpeakingRef.current = false;
      setState("connecting");
      setError(null);

      try {
        const res = await apiFetch("/api/elevenlabs/voice-session", {
          method: "POST",
          body: JSON.stringify({
            agentId: targetAgentId,
            conversationId: conversationIdRef.current,
          }),
        });

        const data = (await res.json()) as VoiceSessionResponse;

        conversationIdRef.current = data.conversationId;

        conversation.startSession({
          conversationToken: data.conversationToken,
          connectionType: "webrtc",
          userId: data.userId,
          overrides: data.overrides as never,
          customLlmExtraBody: {
            monzi_voice_token: data.voiceToken,
          },
          dynamicVariables: {
            monzi_voice_token: data.voiceToken,
          },
          onConnect: () => {
            setState("greeting");
            ensurePlaybackReady();
          },
          onDisconnect: (details) => {
            if (intentionalDisconnectRef.current) {
              intentionalDisconnectRef.current = false;
              setState("idle");
              return;
            }

            const reason =
              details && "reason" in details && details.reason === "error"
                ? "message" in details && details.message
                  ? formatVoiceConnectionError(String(details.message))
                  : "Voice connection lost"
                : "Voice connection ended unexpectedly.";

            setError(formatVoiceConnectionError(reason));
            setState("error");
          },
          onError: (message: string) => {
            setError(formatVoiceConnectionError(message));
            setState("error");
          },
          onStatusChange: ({ status }) => {
            if (status === "connecting") setState("connecting");
          },
          onModeChange: ({ mode }) => {
            if (mode === "speaking") {
              agentSpeakingRef.current = true;
              setState(greetingDoneRef.current ? "speaking" : "greeting");
              ensurePlaybackReady();
            } else {
              agentSpeakingRef.current = false;
              greetingDoneRef.current = true;
              setState("listening");
            }
          },
          onVadScore: ({ vadScore }) => {
            if (!greetingDoneRef.current || agentSpeakingRef.current) return;
            if (vadScore >= VAD_SPEAKING_THRESHOLD) {
              setState("user-speaking");
            }
          },
          onMessage: ({ message, role }) => {
            const trimmed = message?.trim();
            if (!trimmed) return;

            if (role === "user" && !agentSpeakingRef.current) {
              setState("thinking");
            } else if (role === "agent") {
              greetingDoneRef.current = true;
            }
          },
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Voice connection failed";
        setError(message);
        setState("error");
        await disconnect();
      } finally {
        connectingRef.current = false;
      }
    },
    [apiFetch, conversation, disconnect, ensurePlaybackReady]
  );

  const beginVoiceSession = useCallback(
    async (targetAgentId: string, agentOptions: VoiceSessionAgentOptions) => {
      if (!targetAgentId || connectingRef.current) return;
      await connect(targetAgentId, agentOptions);
    },
    [connect]
  );

  useEffect(() => {
    if (conversation.status === "connected") {
      ensurePlaybackReady();
    }
  }, [conversation.status, ensurePlaybackReady]);

  const isConnected =
    state !== "idle" && state !== "error" && state !== "connecting";

  return {
    beginVoiceSession,
    disconnect,
    state,
    error,
    isConnected,
    isListening: state === "listening" || state === "user-speaking",
    isSpeaking: state === "speaking" || state === "greeting",
    isThinking: state === "thinking",
    isUserSpeaking: state === "user-speaking",
    toggleMicrophone: () => conversation.setMuted(!conversation.isMuted),
    isMicrophoneEnabled: isConnected && !conversation.isMuted,
  };
}
