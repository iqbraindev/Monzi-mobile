import { useAuth } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useWorkspacesQuery } from "@/hooks/use-workspaces";
import {
  readStoredWorkspaceId,
  writeStoredWorkspaceId,
} from "@/lib/workspace-storage";
import type { Workspace } from "@/lib/types";

interface WorkspaceContextValue {
  activeWorkspaceId: string | null;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  isReady: boolean;
  switchWorkspace: (workspaceId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function pickDefaultWorkspace(workspaces: Workspace[]): Workspace | null {
  if (!workspaces.length) return null;
  return workspaces.find((w) => w.is_default) ?? workspaces[0];
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { userId, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useWorkspacesQuery(isSignedIn);
  const workspaces = data?.workspaces ?? [];

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setActiveWorkspaceId(null);
      setIsReady(false);
      return;
    }

    if (isLoading) return;

    let cancelled = false;

    void (async () => {
      const storedId = await readStoredWorkspaceId(userId);
      const storedMatch = storedId
        ? workspaces.find((w) => w.id === storedId)
        : null;
      const next = storedMatch ?? pickDefaultWorkspace(workspaces);

      if (!cancelled) {
        setActiveWorkspaceId(next?.id ?? null);
        setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, userId, isLoading, workspaces]);

  const switchWorkspace = useCallback(
    async (workspaceId: string) => {
      if (!userId || workspaceId === activeWorkspaceId) return;

      setActiveWorkspaceId(workspaceId);
      await writeStoredWorkspaceId(userId, workspaceId);

      await queryClient.invalidateQueries({ queryKey: ["agents"] });
      await queryClient.invalidateQueries({ queryKey: ["chat-history"] });
      await queryClient.removeQueries({ queryKey: ["chat-history"] });
    },
    [activeWorkspaceId, queryClient, userId]
  );

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) ?? null,
    [activeWorkspaceId, workspaces]
  );

  const value = useMemo(
    () => ({
      activeWorkspaceId,
      activeWorkspace,
      workspaces,
      isLoading,
      isReady,
      switchWorkspace,
    }),
    [
      activeWorkspaceId,
      activeWorkspace,
      workspaces,
      isLoading,
      isReady,
      switchWorkspace,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
