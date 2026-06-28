import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";

import { getApiUrl } from "@/lib/config";
import type { WorkspacesResponse } from "@/lib/types";

async function fetchWorkspaces(token: string): Promise<WorkspacesResponse> {
  const res = await fetch(`${getApiUrl()}/api/workspaces`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Cannot reach the Monzi API.");
  }

  const body = (await res.json().catch(() => ({}))) as WorkspacesResponse & {
    error?: string;
  };

  if (!res.ok) {
    throw new Error(body.error ?? "Failed to load workspaces");
  }

  return body;
}

export function useWorkspacesQuery(enabled = true) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not signed in");
      }
      return fetchWorkspaces(token);
    },
    enabled: enabled && isSignedIn,
    staleTime: 30_000,
    retry: 1,
  });
}
