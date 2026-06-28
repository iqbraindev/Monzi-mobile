import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/lib/config";
import type { Agent } from "@/lib/types";

interface AgentCardProps {
  agent: Agent;
  onPress: () => void;
}

export function AgentCard({ agent, onPress }: AgentCardProps) {
  const initial = agent.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.avatar, { backgroundColor: agent.color || theme.primary }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{agent.name}</Text>
        <Text style={styles.role} numberOfLines={2}>
          {agent.role.replace(/_/g, " ")}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: theme.text,
    fontSize: 17,
    fontWeight: "600",
  },
  role: {
    color: theme.textMuted,
    fontSize: 14,
    textTransform: "capitalize",
  },
  chevron: {
    color: theme.textMuted,
    fontSize: 24,
    fontWeight: "300",
  },
});
