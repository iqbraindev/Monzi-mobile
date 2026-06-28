import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ComponentType,
  type PropsWithChildren,
} from "react";
import { Alert } from "react-native";

import type { Agent } from "@/lib/types";
import { isNativeVoiceAvailable } from "@/lib/voice-support";

export interface VoiceCallContextValue {
  startCall: (agent: Agent) => void | Promise<void>;
  endCall: () => void;
  callActive: boolean;
  activeAgent: Agent | null;
}

export const VoiceCallContext = createContext<VoiceCallContextValue | null>(null);

function canCallAgent(agent: Agent): boolean {
  return Boolean(agent.voice?.enabled && agent.voiceAllowed !== false);
}

function StubVoiceCallProvider({ children }: PropsWithChildren) {
  const startCall = useCallback((agent: Agent) => {
    if (!canCallAgent(agent)) {
      Alert.alert(
        "Voice unavailable",
        "This agent doesn't have voice enabled. Use Chat to message them."
      );
      return;
    }

    Alert.alert(
      "Development build required",
      "Live voice calls need a Monzi development build (Expo Go is not supported).\n\nRun: npx expo run:android or npx expo run:ios",
      [{ text: "OK" }]
    );
  }, []);

  const value = useMemo(
    () => ({
      startCall,
      endCall: () => undefined,
      callActive: false,
      activeAgent: null,
    }),
    [startCall]
  );

  return (
    <VoiceCallContext.Provider value={value}>{children}</VoiceCallContext.Provider>
  );
}

function resolveNativeVoiceCallProvider(): ComponentType<PropsWithChildren> | null {
  try {
    const mod =
      require("@/components/voice/NativeVoiceCallProvider") as typeof import("@/components/voice/NativeVoiceCallProvider");
    return mod?.NativeVoiceCallProvider ?? null;
  } catch {
    return null;
  }
}

export function VoiceCallProvider({ children }: PropsWithChildren) {
  const NativeVoiceCallProvider = useMemo(() => {
    if (!isNativeVoiceAvailable()) {
      return null;
    }
    return resolveNativeVoiceCallProvider();
  }, []);

  if (!NativeVoiceCallProvider) {
    return <StubVoiceCallProvider>{children}</StubVoiceCallProvider>;
  }

  return <NativeVoiceCallProvider>{children}</NativeVoiceCallProvider>;
}

export function useVoiceCall() {
  const context = useContext(VoiceCallContext);
  if (!context) {
    throw new Error("useVoiceCall must be used within VoiceCallProvider");
  }
  return context;
}
