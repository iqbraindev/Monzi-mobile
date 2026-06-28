import { type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/lib/config";

export const CIRCULAR_ACTION_SIZE = 64;

type CircularActionButtonProps = {
  label: string;
  icon: ReactNode;
  backgroundColor: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function CircularActionButton({
  label,
  icon,
  backgroundColor,
  active = false,
  disabled = false,
  onPress,
}: CircularActionButtonProps) {
  return (
    <View style={styles.item}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
        style={({ pressed }) => [
          styles.circle,
          {
            backgroundColor: disabled
              ? theme.surfaceAlt
              : active
                ? backgroundColor
                : "rgba(255,255,255,0.1)",
          },
          active && !disabled && styles.circleActive,
          !disabled && pressed && styles.circlePressed,
          disabled && styles.circleDisabled,
        ]}
      >
        {icon}
      </Pressable>
      <Text
        style={[
          styles.label,
          active && styles.labelActive,
          disabled && styles.labelDisabled,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export function CircularActionRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 48,
  },
  item: {
    alignItems: "center",
    gap: 8,
  },
  circle: {
    width: CIRCULAR_ACTION_SIZE,
    height: CIRCULAR_ACTION_SIZE,
    borderRadius: CIRCULAR_ACTION_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  circleActive: {
    borderColor: "rgba(255,255,255,0.2)",
  },
  circlePressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  circleDisabled: {
    opacity: 0.45,
  },
  label: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  labelActive: {
    color: theme.text,
  },
  labelDisabled: {
    color: theme.textMuted,
  },
});
