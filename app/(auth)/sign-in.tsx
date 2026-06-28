import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthBackground } from "@/components/auth/AuthBackground";
import {
  AuthSocialButtons,
  type OAuthStrategy,
} from "@/components/auth/AuthSocialButtons";
import { MONZI_LOGO_PROMO_HEIGHT, MonziLogo } from "@/components/MonziLogo";
import { theme } from "@/lib/config";

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [pendingOAuth, setPendingOAuth] = useState<OAuthStrategy | null>(null);

  const isBusy = emailBusy || pendingOAuth !== null;

  const handleEmailSignIn = useCallback(async () => {
    if (!isLoaded || !signIn) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert("Missing fields", "Enter your email and password.");
      return;
    }

    setEmailBusy(true);
    try {
      const result = await signIn.create({
        identifier: trimmedEmail,
        password,
      });

      if (result.status === "complete") {
        await setActive?.({ session: result.createdSessionId });
        router.replace("/(app)");
        return;
      }

      Alert.alert(
        "Sign in incomplete",
        "Additional verification is required. Try a social sign-in or use the web app."
      );
    } catch (err) {
      Alert.alert("Sign in failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setEmailBusy(false);
    }
  }, [email, isLoaded, password, router, setActive, signIn]);

  return (
    <View style={styles.root}>
      <AuthBackground />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 32,
              paddingBottom: insets.bottom + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.logoWrap}>
              <MonziLogo height={MONZI_LOGO_PROMO_HEIGHT} />
            </View>

            <Text style={styles.title} >AI multi-agent assistants</Text>
            <View style={styles.card}>
              <AuthSocialButtons
                disabled={isBusy}
                pendingStrategy={pendingOAuth}
                onPendingChange={setPendingOAuth}
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.form}>
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
                  editable={!isBusy}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                  textContentType="password"
                  editable={!isBusy}
                />

                <Pressable
                  onPress={() => void handleEmailSignIn()}
                  disabled={isBusy}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                    isBusy && styles.buttonDisabled,
                  ]}
                >
                  {emailBusy ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Sign in</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <Text style={styles.footer}>
              Use the same account as the Monzi web app.{" "}

            </Text>
            <Text
                style={{ color: theme.primary, marginTop: 10, textDecorationLine: "none", textAlign: "center" }}
                onPress={() => {
                  // Safe cross-platform link opening
                  import("react-native").then(({ Linking }) =>
                    Linking.openURL("https://monzi.ai")
                  );
                }}
              >
                Visit monzi.ai
              </Text>
    
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  content: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: 0,
  },
  logoWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 28,
  },
  title: {
    marginTop: 40,
    color: theme.text,
    fontSize: 16,
    fontWeight: "300",
    letterSpacing: -0.5,
    textAlign: "center",
    width: "100%",
  },
  card: {
    marginTop: 28,
    gap: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "rgba(26, 26, 34, 0.92)",
    borderWidth: 1,
    borderColor: theme.border,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
  },
  dividerText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  form: {
    gap: 12,
  },
  input: {
    minHeight: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.surfaceAlt,
    color: theme.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  primaryButton: {
    minHeight: 50,
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
    opacity: 0.88,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    marginTop: 20,
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
});
