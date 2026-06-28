import { useQuery } from "@tanstack/react-query";

import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useApiClient } from "@/lib/api";
import type { AgentsResponse, HistoryResponse } from "@/lib/types";

export function useAgents(enabled = true) {
  const { apiFetch } = useApiClient();
  const { activeWorkspaceId, isReady } = useWorkspace();

  return useQuery({
    queryKey: ["agents", activeWorkspaceId],
    queryFn: async () => {
      const res = await apiFetch("/api/agents");
      const data = (await res.json()) as AgentsResponse;
      return data.agents.filter((agent) => agent.status === "active");
    },
    enabled: enabled && isReady && Boolean(activeWorkspaceId),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useChatHistory(agentId: string) {
  const { apiFetch } = useApiClient();
  const { activeWorkspaceId, isReady } = useWorkspace();

  return useQuery({
    queryKey: ["chat-history", activeWorkspaceId, agentId],
    queryFn: async () => {
      const res = await apiFetch(`/api/chat/${agentId}/history`);
      return (await res.json()) as HistoryResponse;
    },
    enabled: Boolean(agentId) && isReady && Boolean(activeWorkspaceId),
    staleTime: 0,
  });
}
