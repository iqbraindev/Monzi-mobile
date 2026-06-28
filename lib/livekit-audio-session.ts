import { AudioSession } from "@livekit/react-native";

export function isLiveKitAudioSessionAvailable(): boolean {
  return typeof AudioSession?.getAudioOutputs === "function";
}

export async function getLiveKitAudioOutputs(): Promise<string[]> {
  if (!isLiveKitAudioSessionAvailable()) {
    return [];
  }
  return AudioSession.getAudioOutputs();
}

export async function selectLiveKitAudioOutput(deviceId: string): Promise<boolean> {
  if (typeof AudioSession?.selectAudioOutput !== "function") {
    return false;
  }

  await AudioSession.selectAudioOutput(deviceId);
  return true;
}

export async function ensureLiveKitPlaybackVolume(): Promise<void> {
  if (typeof AudioSession?.setDefaultRemoteAudioTrackVolume !== "function") {
    return;
  }

  try {
    await AudioSession.setDefaultRemoteAudioTrackVolume(1);
  } catch {
    // Audio session may not be ready yet.
  }
}
