import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PhoneIcon, SpeakerIcon } from "@/components/ActionIcons";
import { AgentAvatarFull } from "@/components/AgentAvatarFull";
import {
  CircularActionButton,
} from "@/components/CircularActionButton";
import { formatCallDuration } from "@/lib/format-call-duration";
import { theme } from "@/lib/config";
import type { Agent } from "@/lib/types";
import type { VoiceAudioRouteId } from "@/lib/voice-audio-output";
import { callStatusLabel, type VoiceSessionState } from "@/lib/voice-types";

const HANGUP_RED = "#F25C54";
const IOS_BLUE = "#0A84FF";
const BAR_DELAYS = [0, 120, 240, 120, 0];

interface VoiceCallOverlayProps {
  agent: Agent;
  state: VoiceSessionState;
  error: string | null;
  elapsedSeconds: number;
  audioRoute: VoiceAudioRouteId;
  audioLoading?: boolean;
  onSelectAudioRoute: (route: VoiceAudioRouteId) => void;
  onEndCall: () => void;
  onRetry: () => void;
}

function VoiceWaveform({ active }: { active: boolean }) {
  const bars = useRef(
    BAR_DELAYS.map(() => new Animated.Value(0.4))
  ).current;

  useEffect(() => {
    if (!active) {
      bars.forEach((bar) => bar.setValue(0.35));
      return;
    }

    const animations = bars.map((bar, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(BAR_DELAYS[index]),
          Animated.timing(bar, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 0.35,
            duration: 420,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [active, bars]);

  return (
    <View style={styles.waveRow}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              transform: [{ scaleY: bar }],
            },
          ]}
        />
      ))}
    </View>
  );
}

export function VoiceCallOverlay({
  agent,
  state,
  error,
  elapsedSeconds,
  audioRoute,
  audioLoading = false,
  onSelectAudioRoute,
  onEndCall,
  onRetry,
}: VoiceCallOverlayProps) {
  const waveActive =
    state === "listening" ||
    state === "user-speaking" ||
    state === "speaking" ||
    state === "greeting" ||
    state === "connecting" ||
    state === "thinking";

  const showTimer = state !== "idle" && state !== "error";
  const canChangeAudio = !error;
  const isSpeaker = audioRoute === "speaker";
  const audioLabel = isSpeaker ? "Speaker" : "Phone";
  const toggleRoute = (): VoiceAudioRouteId =>
    isSpeaker ? "earpiece" : "speaker";

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onEndCall}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <VoiceWaveform active={waveActive} />

          <View style={styles.avatarWrap}>
            <AgentAvatarFull
              assetId={agent.avatarAssetId}
              color={agent.color || theme.primary}
              height={220}
              neon
              breathe
              float
            />
          </View>

          <Text style={styles.agentName}>{agent.name}</Text>
          <Text style={[styles.role, { color: agent.color || theme.primary }]}>
            {agent.role}
          </Text>

          {showTimer ? (
            <Text style={styles.timer}>
              {state === "connecting"
                ? "00:00"
                : formatCallDuration(elapsedSeconds)}
            </Text>
          ) : null}

          <Text style={styles.status}>{callStatusLabel(state)}</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {canChangeAudio ? (
            <View style={styles.audioSection}>
              <CircularActionButton
                label={audioLabel}
                backgroundColor={IOS_BLUE}
                active
                disabled={audioLoading}
                onPress={() => onSelectAudioRoute(toggleRoute())}
                icon={
                  isSpeaker ? (
                    <SpeakerIcon color="#fff" />
                  ) : (
                    <PhoneIcon color="#fff" />
                  )
                }
              />
            </View>
          ) : null}

          <View style={styles.actions}>
            {error ? (
              <Pressable
                onPress={onRetry}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>Try again</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={onEndCall}
              accessibilityRole="button"
              accessibilityLabel="End call"
              style={({ pressed }) => [
                styles.endButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.endButtonText}>
                {error ? "Close" : "End call"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(3, 3, 8, 0.94)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: "#08080c",
    paddingHorizontal: 28,
    paddingVertical: 32,
    alignItems: "center",
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 6,
    height: 48,
    marginBottom: 12,
  },
  waveBar: {
    width: 6,
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  avatarWrap: {
    marginTop: 8,
    marginBottom: 12,
  },
  agentName: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  role: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  timer: {
    marginTop: 20,
    color: theme.text,
    fontSize: 32,
    fontWeight: "300",
    fontVariant: ["tabular-nums"],
    letterSpacing: 1,
  },
  status: {
    marginTop: 8,
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    marginTop: 12,
    color: "#fecaca",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  audioSection: {
    marginTop: 24,
    width: "100%",
    alignItems: "center",
  },
  actions: {
    marginTop: 28,
    width: "100%",
    gap: 10,
  },
  endButton: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: HANGUP_RED,
    alignItems: "center",
    justifyContent: "center",
  },
  endButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: theme.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
