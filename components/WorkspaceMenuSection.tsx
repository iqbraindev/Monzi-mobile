import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useWorkspace } from "@/contexts/WorkspaceContext";
import { theme } from "@/lib/config";
import type { Workspace } from "@/lib/types";

function WorkspaceAvatar({
  workspace,
  size,
}: {
  workspace: Workspace;
  size: number;
}) {
  const initial = workspace.name.slice(0, 1).toUpperCase();

  return (
    <View
      style={[
        styles.avatarFallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarInitial, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

export function WorkspaceMenuSection({
  onSelect,
}: {
  onSelect?: () => void;
}) {
  const {
    activeWorkspace,
    workspaces,
    isLoading,
    switchWorkspace,
  } = useWorkspace();

  const handleSelect = (workspace: Workspace) => {
    if (workspace.id === activeWorkspace?.id) {
      onSelect?.();
      return;
    }

    void (async () => {
      await switchWorkspace(workspace.id);
      onSelect?.();
    })();
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.primary} size="small" />
      </View>
    );
  }

  if (workspaces.length === 0) {
    return <Text style={styles.emptyText}>No workspaces found.</Text>;
  }

  return (
    <ScrollView style={styles.list} bounces={false} nestedScrollEnabled>
      {workspaces.map((workspace) => {
        const isActive = workspace.id === activeWorkspace?.id;

        return (
          <Pressable
            key={workspace.id}
            onPress={() => handleSelect(workspace)}
            style={({ pressed }) => [
              styles.row,
              pressed && styles.rowPressed,
              isActive && styles.rowActive,
            ]}
          >
            <WorkspaceAvatar workspace={workspace} size={28} />
            <View style={styles.rowText}>
              <Text style={styles.rowName} numberOfLines={1}>
                {workspace.name}
              </Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {workspace.activity_domain ?? workspace.member_role}
              </Text>
            </View>
            {isActive ? <Text style={styles.checkmark}>✓</Text> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 12,
    alignItems: "center",
  },
  emptyText: {
    color: theme.textMuted,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  list: {
    maxHeight: 200,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 9,
  },
  rowPressed: {
    backgroundColor: theme.surfaceAlt,
  },
  rowActive: {
    backgroundColor: "rgba(99, 102, 241, 0.12)",
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  rowName: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "600",
  },
  rowMeta: {
    color: theme.textMuted,
    fontSize: 11,
    textTransform: "capitalize",
  },
  checkmark: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.primary,
  },
  avatarInitial: {
    color: "#fff",
    fontWeight: "700",
  },
});
