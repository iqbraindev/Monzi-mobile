import { Linking, PermissionsAndroid, Platform } from "react-native";

export type MicPermissionResult = {
  granted: boolean;
  blocked: boolean;
  alreadyGranted: boolean;
};

export async function ensureMicPermission(): Promise<MicPermissionResult> {
  if (Platform.OS !== "android") {
    return { granted: true, blocked: false, alreadyGranted: true };
  }

  const alreadyGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
  );
  if (alreadyGranted) {
    return { granted: true, blocked: false, alreadyGranted: true };
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: "Microphone access",
      message: "Monzi needs your microphone for live voice calls with agents.",
      buttonPositive: "Allow",
    }
  );

  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return { granted: true, blocked: false, alreadyGranted: false };
  }

  return {
    granted: false,
    blocked: result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
    alreadyGranted: false,
  };
}

export function openAppSettings(): void {
  void Linking.openSettings();
}
