import { StyleSheet, Text, View } from "react-native";

import { AgentAppLogo } from "@/components/AgentAppLogo";
import { theme } from "@/lib/config";
import type { AppGlyph } from "@/lib/types";

interface AgentConnectedAppsProps {
  apps?: AppGlyph[];
  variant?: "rail" | "inline";
  logoSize?: number;
}

export function AgentConnectedApps({
  apps = [],
  variant = "inline",
  logoSize = 32,
}: AgentConnectedAppsProps) {
  if (apps.length === 0) {
    return null;
  }

  if (variant === "rail") {
    return (
      <View style={styles.rail}>
        {apps.map((app) => (
          <AgentAppLogo
            key={app.toolkitSlug ?? app.name}
            app={app}
            size={logoSize}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Connected apps</Text>
      <View style={styles.row}>
        {apps.map((app) => (
          <AgentAppLogo
            key={app.toolkitSlug ?? app.name}
            app={app}
            size={logoSize}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 8,
  },
  container: {
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  label: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    maxWidth: 280,
  },
});
