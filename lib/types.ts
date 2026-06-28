import type { UIMessage } from "ai";

export interface AgentVoice {
  provider: "openai" | "elevenlabs" | "none";
  voice_id: string;
  speed: number;
  enabled: boolean;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  avatarAssetId?: string;
  status: "active" | "inactive";
  lastActive: string;
  isDefault: boolean;
  voice?: AgentVoice;
  voiceAllowed?: boolean;
}

export interface AgentsResponse {
  agents: Agent[];
  meta?: { count: number; limit: number };
}

export interface HistoryResponse {
  conversationId: string | null;
  messages: UIMessage[];
}
