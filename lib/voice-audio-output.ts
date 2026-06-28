import { Platform } from "react-native";

export type VoiceAudioRouteId = "speaker" | "earpiece";

export const VOICE_AUDIO_ROUTE_LABELS: Record<VoiceAudioRouteId, string> = {
  speaker: "Speaker",
  earpiece: "Phone",
};

export function toLiveKitOutputId(route: VoiceAudioRouteId): string {
  if (Platform.OS === "ios") {
    return route === "speaker" ? "force_speaker" : "default";
  }
  return route;
}

export function fromLiveKitOutputId(id: string): VoiceAudioRouteId | null {
  if (id === "speaker" || id === "force_speaker") {
    return "speaker";
  }
  if (id === "earpiece" || id === "default") {
    return "earpiece";
  }
  return null;
}

export function labelForLiveKitOutput(id: string): string {
  switch (id) {
    case "speaker":
    case "force_speaker":
      return "Speaker";
    case "earpiece":
    case "default":
      return "Phone";
    case "bluetooth":
      return "Bluetooth";
    case "headset":
      return "Headset";
    default:
      return id;
  }
}
