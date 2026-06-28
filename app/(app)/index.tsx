import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
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
import { useAgents } from "@/hooks/use-agents";
import { theme } from "@/lib/config";
import { formatApiError } from "@/lib/chat-utils";
import type { Agent } from "@/lib/types";

export default function AgentsScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const {
    data: agents = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAgents(isLoaded && isSignedIn);

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
        <View style={styles.headerText}>
          <Text style={styles.greeting}>
            Hello{user?.firstName ? `, ${user.firstName}` : ""}
          </Text>
          <Text style={styles.headerSubtitle}>Swipe to choose an agent</Text>
        </View>
        <Pressable
          onPress={() => void signOut()}
          style={styles.signOutButton}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={styles.loadingText}>Loading your agents…</Text>
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
        <AgentCarousel agents={agents} onChat={openChat} />
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
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  signOutText: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: "600",
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
