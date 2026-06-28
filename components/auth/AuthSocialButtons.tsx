import { useOAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from "react-native";

import {
  FacebookIcon,
  GoogleIcon,
  LinkedInIcon,
} from "@/components/auth/AuthProviderIcons";
import { theme } from "@/lib/config";

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URL = Linking.createURL("oauth-callback");

export type OAuthStrategy = "oauth_google" | "oauth_facebook" | "oauth_linkedin";

const PROVIDERS: {
  strategy: OAuthStrategy;
  label: string;
  Icon: typeof GoogleIcon;
}[] = [
  { strategy: "oauth_google", label: "Google", Icon: GoogleIcon },
  { strategy: "oauth_facebook", label: "Facebook", Icon: FacebookIcon },
  { strategy: "oauth_linkedin", label: "LinkedIn", Icon: LinkedInIcon },
];

function OAuthProviderButton({
  strategy,
  label,
  Icon,
  disabled,
  loading,
  onLoadingChange,
}: {
  strategy: OAuthStrategy;
  label: string;
  Icon: typeof GoogleIcon;
  disabled: boolean;
  loading: boolean;
  onLoadingChange: (strategy: OAuthStrategy | null) => void;
}) {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy });

  const handlePress = useCallback(async () => {
    onLoadingChange(strategy);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: REDIRECT_URL,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(app)");
      }
    } catch (err) {
      Alert.alert(
        "Sign in failed",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      onLoadingChange(null);
    }
  }, [onLoadingChange, router, startOAuthFlow, strategy]);

  return (
    <Pressable
      onPress={() => void handlePress()}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Continue with ${label}`}
      style={({ pressed }) => [
        styles.socialButton,
        pressed && styles.socialButtonPressed,
        disabled && styles.socialButtonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.textMuted} size="small" />
      ) : (
        <Icon size={22} />
      )}
    </Pressable>
  );
}

export function AuthSocialButtons({
  disabled,
  pendingStrategy,
  onPendingChange,
}: {
  disabled: boolean;
  pendingStrategy: OAuthStrategy | null;
  onPendingChange: (strategy: OAuthStrategy | null) => void;
}) {
  return (
    <View style={styles.row}>
      {PROVIDERS.map(({ strategy, label, Icon }) => (
        <OAuthProviderButton
          key={strategy}
          strategy={strategy}
          label={label}
          Icon={Icon}
          disabled={disabled}
          loading={pendingStrategy === strategy}
          onLoadingChange={onPendingChange}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  socialButtonPressed: {
    backgroundColor: theme.surface,
    borderColor: "#3f3f50",
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
});
