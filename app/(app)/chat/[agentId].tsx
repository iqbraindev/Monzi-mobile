import { useLocalSearchParams, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { AgentChatScreen } from "@/components/AgentChatScreen";
import { useApiClient } from "@/lib/api";
import { theme } from "@/lib/config";
import { formatApiError } from "@/lib/chat-utils";
import type { Agent } from "@/lib/types";

export default function ChatScreen() {
  const { agentId } = useLocalSearchParams<{ agentId: string }>();
  const { apiFetch } = useApiClient();

  const { data: agent, isLoading, error } = useQuery({
    queryKey: ["agent", agentId],
    queryFn: async () => {
      const res = await apiFetch(`/api/agents/${agentId}`);
      const data = (await res.json()) as { agent: Agent };
      return data.agent;
    },
    enabled: Boolean(agentId),
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  if (error || !agent) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {error ? formatApiError(error) : "Agent not found"}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: agent.name, headerBackTitle: "Agents" }} />
      <AgentChatScreen agent={agent} />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background,
    paddingHorizontal: 24,
  },
  errorText: {
    color: "#fecaca",
    fontSize: 15,
    textAlign: "center",
  },
});
