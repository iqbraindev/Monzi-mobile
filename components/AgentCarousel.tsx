import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";

import { AgentAvatarFull } from "@/components/AgentAvatarFull";
import { theme } from "@/lib/config";
import type { Agent } from "@/lib/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_WIDTH = SCREEN_WIDTH;
const AVATAR_HEIGHT = Math.min(320, Math.round(SCREEN_WIDTH * 0.72));

const CALL_GREEN = "#70D46B";

interface AgentCarouselProps {
  agents: Agent[];
  onChat: (agent: Agent) => void;
}

function canCallAgent(agent: Agent): boolean {
  return Boolean(agent.voice?.enabled && agent.voiceAllowed !== false);
}

function AgentSlide({
  agent,
  isActive,
  onChat,
  onCall,
}: {
  agent: Agent;
  isActive: boolean;
  onChat: () => void;
  onCall: () => void;
}) {
  const callEnabled = canCallAgent(agent);

  return (
    <View style={styles.slide}>
      <View style={styles.avatarStage}>
        <AgentAvatarFull
          assetId={agent.avatarAssetId}
          color={agent.color || theme.primary}
          height={AVATAR_HEIGHT}
          neon
          breathe={isActive}
        />
      </View>

      <View style={styles.meta}>
        <Text style={styles.name}>{agent.name}</Text>
        <Text style={[styles.role, { color: agent.color || theme.primary }]}>
          {agent.role}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onCall}
          disabled={!callEnabled}
          style={({ pressed }) => [
            styles.actionButton,
            styles.callButton,
            !callEnabled && styles.actionButtonDisabled,
            pressed && callEnabled && styles.actionButtonPressed,
          ]}
        >
          <Text style={styles.callButtonText}>Call</Text>
        </Pressable>

        <Pressable
          onPress={onChat}
          style={({ pressed }) => [
            styles.actionButton,
            styles.chatButton,
            pressed && styles.actionButtonPressed,
          ]}
        >
          <Text style={styles.chatButtonText}>Chat</Text>
        </Pressable>
      </View>

      {!callEnabled ? (
        <Text style={styles.callHint}>Voice not enabled for this agent</Text>
      ) : null}
    </View>
  );
}

export function AgentCarousel({ agents, onChat }: AgentCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Agent>>(null);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    if (index >= 0 && index < agents.length) {
      setActiveIndex(index);
    }
  }, [agents.length]);

  const handleCall = useCallback(
    (agent: Agent) => {
      if (!canCallAgent(agent)) {
        Alert.alert(
          "Voice unavailable",
          "This agent doesn't have voice enabled. Use Chat to message them."
        );
        return;
      }

      Alert.alert(
        "Voice calls coming soon",
        "Live voice calls aren't on mobile yet. Opening text chat for now.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open chat", onPress: () => onChat(agent) },
        ]
      );
    },
    [onChat]
  );

  const renderItem: ListRenderItem<Agent> = useCallback(
    ({ item, index }) => (
      <AgentSlide
        agent={item}
        isActive={index === activeIndex}
        onChat={() => onChat(item)}
        onCall={() => handleCall(item)}
      />
    ),
    [activeIndex, handleCall, onChat]
  );

  const scrollToIndex = useCallback((index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        style={styles.list}
        data={agents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SLIDE_WIDTH}
        snapToAlignment="center"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: SLIDE_WIDTH,
          offset: SLIDE_WIDTH * index,
          index,
        })}
        contentContainerStyle={styles.listContent}
      />

      {agents.length > 1 ? (
        <View style={styles.dots}>
          {agents.map((agent, index) => (
            <Pressable
              key={agent.id}
              onPress={() => scrollToIndex(index)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${agent.name}`}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : undefined,
              ]}
            />
          ))}
        </View>
      ) : null}

      {agents.length > 1 ? (
        <Text style={styles.swipeHint}>Swipe to browse your agents</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    alignItems: "stretch",
  },
  slide: {
    width: SLIDE_WIDTH,
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarStage: {
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: AVATAR_HEIGHT + 16,
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  meta: {
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  name: {
    color: theme.text,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  role: {
    fontSize: 15,
    fontWeight: "600",
    textTransform: "capitalize",
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    maxWidth: 320,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonPressed: {
    opacity: 0.88,
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  callButton: {
    backgroundColor: CALL_GREEN,
  },
  callButtonText: {
    color: "#0f1a0f",
    fontSize: 16,
    fontWeight: "700",
  },
  chatButton: {
    backgroundColor: theme.primary,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  callHint: {
    marginTop: 12,
    color: theme.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.primary,
  },
  swipeHint: {
    textAlign: "center",
    color: theme.textMuted,
    fontSize: 13,
    paddingBottom: 8,
  },
});
