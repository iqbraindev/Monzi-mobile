import { useAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AgentCarousel } from "@/components/AgentCarousel";
import { MonziLogo } from "@/components/MonziLogo";
import { ProfileMenu } from "@/components/ProfileMenu";
import { VoiceCallProvider } from "@/contexts/VoiceCallContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAgents } from "@/hooks/use-agents";
import { formatApiError } from "@/lib/chat-utils";
import { theme } from "@/lib/config";
import type { Agent } from "@/lib/types";

export default function AgentsScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { isReady: workspaceReady } = useWorkspace();
  const {
    data: agents = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAgents(isLoaded && isSignedIn && workspaceReady);

  const openChat = (agent: Agent) => {
    router.push(`/(app)/chat/${agent.id}`);
  };

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <MonziLogo />
        <ProfileMenu />
      </View>

      {!workspaceReady || isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={styles.loadingText}>
            {!workspaceReady ? "Loading workspace…" : "Loading your agents…"}
          </Text>
        </View>
      ) : error ? (
        <ScrollView
          contentContainerStyle={styles.centered}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={theme.primary}
            />
          }
        >
          <Text style={styles.errorTitle}>Could not load agents</Text>
          <Text style={styles.errorText}>{formatApiError(error)}</Text>
          <Pressable onPress={() => void refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </ScrollView>
      ) : agents.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No agents yet</Text>
          <Text style={styles.emptySubtitle}>
            Create agents in the Monzi web app, then pull down to refresh.
          </Text>
        </View>
      ) : (
        <VoiceCallProvider>
          <AgentCarousel agents={agents} onChat={openChat} />
        </VoiceCallProvider>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 12,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  loadingText: {
    color: theme.textMuted,
    fontSize: 15,
  },
  errorTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  errorText: {
    color: "#fecaca",
    fontSize: 15,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.primary,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: theme.textMuted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
