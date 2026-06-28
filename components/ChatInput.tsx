import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";

import { theme } from "@/lib/config";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  sending?: boolean;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  disabled,
  sending,
}: ChatInputProps) {
  const canSend = value.trim().length > 0 && !disabled && !sending;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Message your agent…"
        placeholderTextColor={theme.textMuted}
        multiline
        maxLength={4000}
        editable={!disabled}
      />
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        style={({ pressed }) => [
          styles.sendButton,
          !canSend && styles.sendButtonDisabled,
          pressed && canSend && styles.sendButtonPressed,
        ]}
      >
        {sending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <View style={styles.sendIcon} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: theme.surfaceAlt,
    color: theme.text,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendButtonPressed: {
    opacity: 0.85,
  },
  sendIcon: {
    width: 0,
    height: 0,
    marginLeft: 2,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#fff",
  },
});
