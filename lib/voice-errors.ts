export function formatVoiceConnectionError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("502") ||
    lower.includes("bad gateway") ||
    lower.includes("websocket")
  ) {
    return "Monzi could not reach the voice AI backend. If you're on local dev, restart ngrok and run scripts/configure-elevenlabs-custom-llm.mjs on the web app.";
  }

  return message || "Voice connection error";
}
