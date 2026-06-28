import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "@/lib/api";
import type { AgentsResponse, HistoryResponse } from "@/lib/types";

export function useAgents(enabled = true) {
  const { apiFetch } = useApiClient();

  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await apiFetch("/api/agents");
      const data = (await res.json()) as AgentsResponse;
      return data.agents.filter((agent) => agent.status === "active");
    },
    enabled,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useChatHistory(agentId: string) {
  const { apiFetch } = useApiClient();

  return useQuery({
    queryKey: ["chat-history", agentId],
    queryFn: async () => {
      const res = await apiFetch(`/api/chat/${agentId}/history`);
      return (await res.json()) as HistoryResponse;
    },
    enabled: Boolean(agentId),
    staleTime: 0,
  });
}
