import { useAuth } from "@clerk/clerk-expo";
import { useCallback } from "react";

import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getApiUrl } from "@/lib/config";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function useApiClient() {
  const { getToken } = useAuth();
  const { activeWorkspaceId } = useWorkspace();
  const baseUrl = getApiUrl();

  const applyAuthHeaders = useCallback(
    async (headers: Headers) => {
      const token = await getToken();
      if (!token) {
        throw new ApiError("Not signed in", 401);
      }
      headers.set("Authorization", `Bearer ${token}`);
      if (activeWorkspaceId) {
        headers.set("x-monzi-workspace-id", activeWorkspaceId);
      }
    },
    [activeWorkspaceId, getToken]
  );

  const apiFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers);
      await applyAuthHeaders(headers);
      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const res = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers,
        redirect: "manual",
      });

      if (res.status >= 300 && res.status < 400) {
        throw new ApiError("Unauthorized", 401);
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new ApiError(
          "Cannot reach the Monzi API. Check that the web app is running and EXPO_PUBLIC_API_URL uses your PC's LAN IP.",
          502
        );
      }

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status);
      }

      return res;
    },
    [applyAuthHeaders, baseUrl]
  );

  const getAuthHeaders = useCallback(async () => {
    const headers = new Headers();
    await applyAuthHeaders(headers);
    return Object.fromEntries(headers.entries());
  }, [applyAuthHeaders]);

  return { apiFetch, getAuthHeaders, baseUrl };
}
