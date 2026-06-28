import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { NativeVoiceRoot } from "@/components/voice/NativeVoiceRoot";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { getClerkPublishableKey } from "@/lib/config";
import { tokenCache } from "@/lib/token-cache";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={getClerkPublishableKey()} tokenCache={tokenCache}>
        <ClerkLoaded>
          <NativeVoiceRoot>
            <QueryClientProvider client={queryClient}>
              <WorkspaceProvider>
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0f0f12" } }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="oauth-callback" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(app)" />
                </Stack>
              </WorkspaceProvider>
            </QueryClientProvider>
          </NativeVoiceRoot>
        </ClerkLoaded>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
