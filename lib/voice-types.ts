export type VoiceSessionState =
  | "idle"
  | "connecting"
  | "greeting"
  | "listening"
  | "user-speaking"
  | "thinking"
  | "speaking"
  | "error";

export interface VoiceSessionResponse {
  signedUrl: string;
  conversationToken: string;
  conversationId: string;
  agentName: string;
  voiceToken: string;
  userId: string;
  overrides: {
    agent: {
      prompt: { prompt: string };
      firstMessage: string;
      language: string;
    };
    tts?: { voiceId: string; speed?: number };
  };
}

export function callStatusLabel(state: VoiceSessionState): string {
  switch (state) {
    case "connecting":
      return "Calling…";
    case "greeting":
      return "Connected";
    case "listening":
    case "user-speaking":
      return "In call";
    case "thinking":
      return "Thinking…";
    case "speaking":
      return "Speaking…";
    case "error":
      return "Call failed";
    default:
      return "In call";
  }
}
