import { useCallback, useRef, useState } from "react";
import {
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

import { ChatIcon, PhoneIcon } from "@/components/ActionIcons";
import { AgentAvatarFull } from "@/components/AgentAvatarFull";
import { AgentConnectedApps } from "@/components/AgentConnectedApps";
import {
  CircularActionButton,
  CircularActionRow,
} from "@/components/CircularActionButton";
import { useVoiceCall } from "@/contexts/VoiceCallContext";
import { theme } from "@/lib/config";
import type { Agent } from "@/lib/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_WIDTH = SCREEN_WIDTH;
const AVATAR_HEIGHT = Math.min(320, Math.round(SCREEN_WIDTH * 0.72));

const IOS_GREEN = "#34C759";
const IOS_BLUE = "#0A84FF";

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
      <View style={styles.avatarRow}>
        <View style={styles.avatarStage}>
          <AgentAvatarFull
            assetId={agent.avatarAssetId}
            color={agent.color || theme.primary}
            height={AVATAR_HEIGHT}
            neon
            breathe={isActive}
          />
        </View>
        <AgentConnectedApps apps={agent.apps} variant="rail" logoSize={28} />
      </View>

      <View style={styles.meta}>
        <Text style={styles.name}>{agent.name}</Text>
        <Text style={[styles.role, { color: agent.color || theme.primary }]}>
          {agent.role}
        </Text>
      </View>

      <CircularActionRow>
        <CircularActionButton
          label="Call"
          backgroundColor={IOS_GREEN}
          active
          disabled={!callEnabled}
          onPress={onCall}
          icon={
            <PhoneIcon color={callEnabled ? "#fff" : theme.textMuted} />
          }
        />
        <CircularActionButton
          label="Chat"
          backgroundColor={IOS_BLUE}
          active
          onPress={onChat}
          icon={<ChatIcon />}
        />
      </CircularActionRow>

      {!callEnabled ? (
        <Text style={styles.callHint}>Voice not enabled for this agent</Text>
      ) : null}
    </View>
  );
}

export function AgentCarousel({ agents, onChat }: AgentCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Agent>>(null);
  const { startCall } = useVoiceCall();

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    if (index >= 0 && index < agents.length) {
      setActiveIndex(index);
    }
  }, [agents.length]);

  const handleCall = useCallback(
    (agent: Agent) => {
      startCall(agent);
    },
    [startCall]
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
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: SLIDE_WIDTH - 32,
    marginBottom: 8,
  },
  avatarStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: AVATAR_HEIGHT + 16,
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
