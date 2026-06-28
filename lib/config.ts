const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

export function getClerkPublishableKey(): string {
  if (!publishableKey) {
    throw new Error(
      "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Copy .env.example to .env and set your Clerk key."
    );
  }
  return publishableKey;
}

export function getApiUrl(): string {
  if (!apiUrl) {
    throw new Error(
      "Missing EXPO_PUBLIC_API_URL. Copy .env.example to .env and point it at your Monzi web app."
    );
  }
  return apiUrl;
}

export const theme = {
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  background: "#0f0f12",
  surface: "#1a1a22",
  surfaceAlt: "#252530",
  text: "#f4f4f5",
  textMuted: "#a1a1aa",
  userBubble: "#6366f1",
  assistantBubble: "#252530",
  border: "#2e2e3a",
  danger: "#f25c54",
} as const;
