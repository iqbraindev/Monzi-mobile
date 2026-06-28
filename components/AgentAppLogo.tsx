import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SvgUri } from "react-native-svg";

import { toolkitLogoUrl } from "@/lib/toolkit-logos";
import type { AppGlyph } from "@/lib/types";

interface AgentAppLogoProps {
  app: AppGlyph;
  size?: number;
}

export function AgentAppLogo({ app, size = 32 }: AgentAppLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const slug = app.toolkitSlug;
  const radius = Math.round(size * 0.24);
  const logoSize = Math.round(size * 0.72);

  if (slug && !imageFailed) {
    return (
      <View
        style={[
          styles.logoTile,
          {
            width: size,
            height: size,
            borderRadius: radius,
          },
        ]}
        accessibilityLabel={app.name}
      >
        <SvgUri
          uri={toolkitLogoUrl(slug)}
          width={logoSize}
          height={logoSize}
          onError={() => setImageFailed(true)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.glyphTile,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: app.color,
        },
      ]}
      accessibilityLabel={app.name}
    >
      <Text
        style={[
          styles.glyphText,
          {
            color: app.fg ?? "#fff",
            fontSize: size * 0.4,
          },
        ]}
      >
        {app.glyph}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoTile: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  glyphTile: {
    alignItems: "center",
    justifyContent: "center",
  },
  glyphText: {
    fontWeight: "700",
  },
});
