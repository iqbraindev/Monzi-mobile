import type { UIMessage } from "ai";

export interface AppGlyph {
  glyph: string;
  color: string;
  name: string;
  toolkitSlug?: string;
  fg?: string;
}

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
  apps?: AppGlyph[];
}

export interface AgentsResponse {
  agents: Agent[];
  meta?: { count: number; limit: number };
}

export interface HistoryResponse {
  conversationId: string | null;
  messages: UIMessage[];
}

export type WorkspaceMemberRole = "owner" | "admin" | "member";

export interface Workspace {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  description: string | null;
  activity_domain: string | null;
  logo_url: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  member_role: WorkspaceMemberRole;
}

export interface WorkspacesResponse {
  workspaces: Workspace[];
  meta: {
    ownedCount: number;
    maxWorkspaces: number;
  };
}
