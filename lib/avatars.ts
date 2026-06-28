import { Image, type ImageSourcePropType } from "react-native";

export const AGENT_AVATAR_IMAGES: Record<string, ImageSourcePropType> = {
  "avatar-01": require("@/assets/avatars/av1.png"),
  "avatar-02": require("@/assets/avatars/av2.png"),
  "avatar-03": require("@/assets/avatars/av3.png"),
  "avatar-04": require("@/assets/avatars/av4.png"),
  "avatar-05": require("@/assets/avatars/av5.png"),
  "avatar-06": require("@/assets/avatars/av6.png"),
  "avatar-07": require("@/assets/avatars/av7.png"),
  "avatar-08": require("@/assets/avatars/av8.png"),
};

const DEFAULT_AVATAR_ID = "avatar-01";

const PORTRAIT_AVATARS = new Set(["avatar-03", "avatar-06", "avatar-07", "avatar-08"]);

export function getAgentAvatarSource(assetId?: string | null): ImageSourcePropType {
  if (assetId && assetId in AGENT_AVATAR_IMAGES) {
    return AGENT_AVATAR_IMAGES[assetId];
  }
  return AGENT_AVATAR_IMAGES[DEFAULT_AVATAR_ID];
}

export function getAgentAvatarAspectRatio(assetId?: string | null): number {
  const source = Image.resolveAssetSource(getAgentAvatarSource(assetId));
  if (!source.width || !source.height) return 0.55;
  return source.width / source.height;
}

/** Matches web `getAgentAvatarLauncherBlend` — knocks out light/dark PNG backdrops. */
export function getAgentAvatarLauncherBlend(
  assetId?: string | null
): "multiply" | "lighten" {
  if (assetId && PORTRAIT_AVATARS.has(assetId)) {
    return "lighten";
  }
  return "multiply";
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) return null;
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function launcherGlowColor(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(124, 58, 237, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
