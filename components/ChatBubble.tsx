import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/lib/config";

interface ChatBubbleProps {
  role: "user" | "assistant";
  text: string;
}

export function ChatBubble({ role, text }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 10,
    flexDirection: "row",
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowAssistant: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: theme.userBubble,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: theme.assistantBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  assistantText: {
    color: theme.text,
  },
});
