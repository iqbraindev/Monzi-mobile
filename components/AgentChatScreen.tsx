import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatBubble } from "@/components/ChatBubble";
import { ChatInput } from "@/components/ChatInput";
import { ApiError, useApiClient } from "@/lib/api";
import { theme } from "@/lib/config";
import { formatApiError, messageText } from "@/lib/chat-utils";
import type { Agent } from "@/lib/types";
import { useChatHistory } from "@/hooks/use-agents";

interface AgentChatScreenProps {
  agent: Agent;
}

export function AgentChatScreen({ agent }: AgentChatScreenProps) {
  const insets = useSafeAreaInsets();
  const { baseUrl, getAuthHeaders } = useApiClient();
  const { data: history, isLoading: historyLoading, error: historyError } =
    useChatHistory(agent.id);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [initialized, setInitialized] = useState(false);
  const listRef = useRef<FlatList>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${baseUrl}/api/chat/${agent.id}`,
        headers: getAuthHeaders,
        body: { conversationId },
      }),
    [agent.id, baseUrl, conversationId, getAuthHeaders]
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
    messages: [],
  });

  useEffect(() => {
    if (!history || initialized) return;
    setConversationId(history.conversationId);
    setMessages(history.messages ?? []);
    setInitialized(true);
  }, [history, initialized, setMessages]);

  const isStreaming = status === "streaming" || status === "submitted";

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, isStreaming, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || isStreaming) return;
    setDraft("");
    await sendMessage({ text });
  }, [draft, isStreaming, sendMessage]);

  const displayError =
    historyError instanceof ApiError
      ? historyError.message
      : error
        ? formatApiError(error)
        : historyError
          ? formatApiError(historyError)
          : null;

  if (historyLoading && !initialized) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.primary} size="large" />
        <Text style={styles.loadingText}>Loading conversation…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={insets.top + 56}
    >
      {displayError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{displayError}</Text>
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          messages.length === 0 && styles.listEmpty,
        ]}
        renderItem={({ item }) => (
          <ChatBubble
            role={item.role === "user" ? "user" : "assistant"}
            text={messageText(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Say hello to {agent.name}</Text>
            <Text style={styles.emptySubtitle}>
              Your ongoing conversation continues here — one thread per agent.
            </Text>
          </View>
        }
        onContentSizeChange={scrollToBottom}
      />

      {isStreaming ? (
        <View style={styles.typingRow}>
          <ActivityIndicator color={theme.primary} size="small" />
          <Text style={styles.typingText}>{agent.name} is thinking…</Text>
        </View>
      ) : null}

      <View style={{ paddingBottom: insets.bottom }}>
        <ChatInput
          value={draft}
          onChangeText={setDraft}
          onSend={() => void handleSend()}
          disabled={Boolean(displayError && displayError.includes("401"))}
          sending={isStreaming}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: theme.background,
  },
  loadingText: {
    color: theme.textMuted,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  listEmpty: {
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtitle: {
    color: theme.textMuted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  errorBanner: {
    backgroundColor: "#3f1d1d",
    borderBottomWidth: 1,
    borderBottomColor: theme.danger,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorText: {
    color: "#fecaca",
    fontSize: 14,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  typingText: {
    color: theme.textMuted,
    fontSize: 13,
  },
});
