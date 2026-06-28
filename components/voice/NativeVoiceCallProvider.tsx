import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { Alert } from "react-native";

import { VoiceCallOverlay } from "@/components/VoiceCallOverlay";
import {
  VoiceCallContext,
  type VoiceCallContextValue,
} from "@/contexts/VoiceCallContext";
import { useCallConnectingSound } from "@/hooks/use-call-connecting-sound";
import { useCallDuration } from "@/hooks/use-call-duration";
import {
  useElevenLabsVoiceSession,
  type VoiceSessionAgentOptions,
} from "@/hooks/use-elevenlabs-voice-session";
import { useVoiceAudioOutput } from "@/hooks/use-voice-audio-output";
import {
  ensureMicPermission,
  openAppSettings,
} from "@/lib/request-mic-permission";
import type { Agent } from "@/lib/types";

function canCallAgent(agent: Agent): boolean {
  return Boolean(agent.voice?.enabled && agent.voiceAllowed !== false);
}

function agentVoiceOptions(agent: Agent): VoiceSessionAgentOptions {
  return {
    voiceAllowed: agent.voiceAllowed !== false,
    voiceEnabledOnAgent: Boolean(agent.voice?.enabled),
  };
}

function showMicPermissionAlert(blocked: boolean) {
  if (blocked) {
    Alert.alert(
      "Microphone blocked",
      "Enable microphone access for Monzi in your phone settings to use voice calls.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open settings", onPress: openAppSettings },
      ]
    );
    return;
  }

  Alert.alert(
    "Microphone required",
    "Allow microphone access when prompted to call an agent."
  );
}

export function NativeVoiceCallProvider({ children }: PropsWithChildren) {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [callActive, setCallActive] = useState(false);

  const voice = useElevenLabsVoiceSession();

  const { elapsedSeconds, resetCallDuration } = useCallDuration(
    callActive,
    voice.isConnected
  );

  const audio = useVoiceAudioOutput(voice.isConnected);
  const isConnecting = voice.state === "connecting";

  useCallConnectingSound(isConnecting);

  const endCall = useCallback(() => {
    setCallActive(false);
    resetCallDuration();
    void voice.disconnect();
    setActiveAgent(null);
  }, [resetCallDuration, voice]);

  const startCall = useCallback(
    async (agent: Agent) => {
      if (!canCallAgent(agent)) {
        Alert.alert(
          "Voice unavailable",
          "This agent doesn't have voice enabled. Use Chat to message them."
        );
        return;
      }

      if (callActive) return;

      const mic = await ensureMicPermission();
      if (!mic.granted) {
        showMicPermissionAlert(mic.blocked);
        return;
      }

      setActiveAgent(agent);
      setCallActive(true);
      await voice.beginVoiceSession(agent.id, agentVoiceOptions(agent));
    },
    [callActive, voice]
  );

  const value = useMemo<VoiceCallContextValue>(
    () => ({
      startCall,
      endCall,
      callActive,
      activeAgent,
    }),
    [activeAgent, callActive, endCall, startCall]
  );

  return (
    <VoiceCallContext.Provider value={value}>
      {children}
      {callActive && activeAgent ? (
        <VoiceCallOverlay
          agent={activeAgent}
          state={voice.state}
          error={voice.error}
          elapsedSeconds={elapsedSeconds}
          audioRoute={audio.route}
          activeAudioDeviceId={audio.activeDeviceId}
          audioOptions={audio.options}
          audioLoading={audio.loading}
          onSelectAudioDevice={(deviceId) => void audio.selectDevice(deviceId)}
          onRefreshAudioOptions={() => void audio.refreshOptions()}
          onEndCall={endCall}
          onRetry={() =>
            void voice.beginVoiceSession(
              activeAgent.id,
              agentVoiceOptions(activeAgent)
            )
          }
        />
      ) : null}
    </VoiceCallContext.Provider>
  );
}
