import type { UIMessage } from "ai";

export function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message.includes("Network request failed") ||
      error.message.includes("Failed to fetch")
    ) {
      return "Cannot reach the Monzi API. Check that the web app is running and EXPO_PUBLIC_API_URL uses your PC's LAN IP.";
    }
    if (error.message.includes("402") || error.message.toLowerCase().includes("energy")) {
      return "This agent is out of energy. Manage your plan on the web app.";
    }
    if (error.message.includes("429")) {
      return "Daily message limit reached. Try again tomorrow.";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
