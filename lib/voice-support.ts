import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

/**
 * Live voice uses LiveKit native modules that are only available in a custom
 * dev/standalone build — not in Expo Go or web.
 *
 * Do not use `Constants.expoGoConfig` for this check: in dev/standalone builds
 * it returns the embedded app manifest, not just Expo Go config.
 */
export function isExpoGo(): boolean {
  if (Platform.OS === "web") {
    return false;
  }

  if (Constants.appOwnership === "expo") {
    return true;
  }

  // Expo Go never ships the dev launcher native module.
  return (
    Constants.executionEnvironment === "storeClient" &&
    NativeModules.EXDevLauncher == null
  );
}

export function isNativeVoiceAvailable(): boolean {
  if (Platform.OS === "web") {
    return false;
  }

  return !isExpoGo();
}
