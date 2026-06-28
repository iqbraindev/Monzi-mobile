import { useMemo, type ComponentType, type PropsWithChildren } from "react";

import { isExpoGo } from "@/lib/voice-support";

// Register LiveKit/WebRTC globals and the RN voice session strategy at startup.
if (!isExpoGo()) {
  require("@elevenlabs/react-native");
}

function Passthrough({ children }: PropsWithChildren) {
  return <>{children}</>;
}

function resolveConversationProvider(): ComponentType<PropsWithChildren> {
  if (isExpoGo()) {
    return Passthrough;
  }

  try {
    const mod = require("@elevenlabs/react-native") as {
      ConversationProvider: ComponentType<PropsWithChildren>;
    };
    return mod.ConversationProvider;
  } catch {
    return Passthrough;
  }
}

export function NativeVoiceRoot({ children }: PropsWithChildren) {
  const ConversationProvider = useMemo(() => resolveConversationProvider(), []);

  return <ConversationProvider>{children}</ConversationProvider>;
}
