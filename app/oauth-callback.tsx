import { useAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { theme } from "@/lib/config";

WebBrowser.maybeCompleteAuthSession();

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace("/(app)");
      return;
    }

    const timeout = setTimeout(() => {
      router.replace("/(auth)/sign-in");
    }, 2500);

    return () => clearTimeout(timeout);
  }, [isLoaded, isSignedIn, router]);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(app)" />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background,
  },
});
