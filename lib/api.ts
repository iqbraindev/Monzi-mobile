import { useAuth } from "@clerk/clerk-expo";
import { useCallback } from "react";

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
  const baseUrl = getApiUrl();

  const apiFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const token = await getToken();
      if (!token) {
        throw new ApiError("Not signed in", 401);
      }

      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${token}`);
      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const res = await fetch(`${baseUrl}${path}`, { ...init, headers });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status);
      }

      return res;
    },
    [baseUrl, getToken]
  );

  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      throw new ApiError("Not signed in", 401);
    }
    return { Authorization: `Bearer ${token}` };
  }, [getToken]);

  return { apiFetch, getAuthHeaders, baseUrl };
}
