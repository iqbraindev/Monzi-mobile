import * as SecureStore from "expo-secure-store";

const KEY_PREFIX = "monzi_active_workspace_";

function storageKey(userId: string) {
  return `${KEY_PREFIX}${userId}`;
}

export async function readStoredWorkspaceId(userId: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(storageKey(userId));
  } catch {
    return null;
  }
}

export async function writeStoredWorkspaceId(
  userId: string,
  workspaceId: string
): Promise<void> {
  try {
    await SecureStore.setItemAsync(storageKey(userId), workspaceId);
  } catch {
    // SecureStore can fail on web or when storage is unavailable.
  }
}
