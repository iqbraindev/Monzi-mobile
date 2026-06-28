import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/lib/config";

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URL = Linking.createURL("oauth-callback");

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    setBusy(true);
    try {
      const { createdSessionId, setActive: activate } = await startOAuthFlow({
        redirectUrl: REDIRECT_URL,
      });

      if (createdSessionId && activate) {
        await activate({ session: createdSessionId });
      }
    } catch (err) {
      Alert.alert("Sign in failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }, [startOAuthFlow]);

  const handleEmailSignIn = useCallback(async () => {
    if (!isLoaded || !signIn) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert("Missing fields", "Enter your email and password.");
      return;
    }

    setBusy(true);
    try {
      const result = await signIn.create({
        identifier: trimmedEmail,
        password,
      });

      if (result.status === "complete") {
        await setActive?.({ session: result.createdSessionId });
        return;
      }

      Alert.alert(
        "Sign in incomplete",
        "Additional verification is required. Try Google sign-in or use the web app."
      );
    } catch (err) {
      Alert.alert("Sign in failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }, [email, isLoaded, password, setActive, signIn]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>Monzi</Text>
        <Text style={styles.subtitle}>Chat with your AI agents on the go.</Text>
      </View>

      <View style={styles.card}>
        <Pressable
          onPress={() => void handleGoogleSignIn()}
          disabled={busy}
          style={({ pressed }) => [
            styles.googleButton,
            pressed && styles.buttonPressed,
            busy && styles.buttonDisabled,
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          )}
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or email</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          editable={!busy}
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={theme.textMuted}
          secureTextEntry
          textContentType="password"
          editable={!busy}
        />

        <Pressable
          onPress={() => void handleEmailSignIn()}
          disabled={busy}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
            busy && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>Sign in</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>
        Scan the QR with the Expo Go app. Use the same account as the Monzi web app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 24,
  },
  header: {
    paddingBottom: 24,
    gap: 8,
  },
  logo: {
    color: theme.text,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    gap: 12,
    padding: 20,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  googleButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
  },
  dividerText: {
    color: theme.textMuted,
    fontSize: 13,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.surfaceAlt,
    color: theme.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  hint: {
    marginTop: 20,
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
});
