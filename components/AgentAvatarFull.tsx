import { useEffect, useMemo } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";

import {
  getAgentAvatarAspectRatio,
  getAgentAvatarSource,
} from "@/lib/avatars";

interface AgentAvatarFullProps {
  assetId?: string | null;
  color: string;
  height?: number;
  neon?: boolean;
  breathe?: boolean;
  float?: boolean;
}

function AvatarNeonGlow({
  color,
  width,
  height,
  gradientId,
  opacity,
}: {
  color: string;
  width: number;
  height: number;
  gradientId: string;
  opacity: number;
}) {
  const poolWidth = Math.round(width * 1.28);
  const poolHeight = Math.round(height * 0.34);
  const haloWidth = Math.round(width * 0.92);
  const haloHeight = Math.round(height * 0.72);

  return (
    <View
      pointerEvents="none"
      style={[styles.glowRoot, { width, height, opacity }]}
    >
      <Svg
        width={haloWidth}
        height={haloHeight}
        style={[
          styles.haloSvg,
          {
            left: (width - haloWidth) / 2,
            top: height - haloHeight - height * 0.06,
          },
        ]}
      >
        <Defs>
          <RadialGradient
            id={`${gradientId}-halo`}
            cx="50%"
            cy="58%"
            rx="48%"
            ry="52%"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <Stop offset="45%" stopColor={color} stopOpacity={0.1} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse
          cx={haloWidth / 2}
          cy={haloHeight * 0.58}
          rx={haloWidth * 0.48}
          ry={haloHeight * 0.52}
          fill={`url(#${gradientId}-halo)`}
        />
      </Svg>

      <Svg
        width={poolWidth}
        height={poolHeight}
        style={[
          styles.poolSvg,
          {
            left: (width - poolWidth) / 2,
            bottom: height * 0.015,
          },
        ]}
      >
        <Defs>
          <RadialGradient
            id={`${gradientId}-pool`}
            cx="50%"
            cy="50%"
            rx="50%"
            ry="50%"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0%" stopColor={color} stopOpacity={0.55} />
            <Stop offset="55%" stopColor={color} stopOpacity={0.14} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse
          cx={poolWidth / 2}
          cy={poolHeight / 2}
          rx={poolWidth / 2}
          ry={poolHeight / 2}
          fill={`url(#${gradientId}-pool)`}
        />
      </Svg>

      <View
        style={[
          styles.groundShadow,
          {
            width: width * 0.44,
            height: Math.max(8, height * 0.035),
            bottom: height * 0.01,
          },
        ]}
      />
    </View>
  );
}

export function AgentAvatarFull({
  assetId,
  color,
  height = 300,
  neon = true,
  breathe = false,
  float = true,
}: AgentAvatarFullProps) {
  const aspectRatio = getAgentAvatarAspectRatio(assetId);
  const width = Math.round(height * aspectRatio);
  const gradientId = useMemo(
    () => `avatar-glow-${(assetId ?? "default").replace(/[^a-z0-9-]/gi, "")}`,
    [assetId]
  );

  const neonProgress = useSharedValue(0);
  const breatheProgress = useSharedValue(0);
  const floatProgress = useSharedValue(0);

  useEffect(() => {
    if (!neon) return;
    neonProgress.value = withRepeat(
      withTiming(1, { duration: 4500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [neon, neonProgress]);

  useEffect(() => {
    if (!breathe) {
      breatheProgress.value = 0;
      return;
    }
    breatheProgress.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [breathe, breatheProgress]);

  useEffect(() => {
    if (!float) {
      floatProgress.value = 0;
      return;
    }
    floatProgress.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [float, floatProgress]);

  const floatStyle = useAnimatedStyle(() => {
    if (!float) return {};

    return {
      transform: [
        { translateY: interpolate(floatProgress.value, [0, 1], [0, -8]) },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    if (!neon) return { opacity: 0 };

    return {
      opacity: interpolate(neonProgress.value, [0, 1], [0.72, 1]),
      transform: [
        { scale: interpolate(neonProgress.value, [0, 1], [0.97, 1.04]) },
      ],
    };
  });

  const figureStyle = useAnimatedStyle(() => {
    const style: {
      transform?: { scale: number }[];
      opacity?: number;
      shadowColor?: string;
      shadowOffset?: { width: number; height: number };
      shadowOpacity?: number;
      shadowRadius?: number;
      elevation?: number;
    } = {};

    if (breathe) {
      style.transform = [
        { scale: interpolate(breatheProgress.value, [0, 1], [1, 1.06]) },
      ];
      style.opacity = interpolate(breatheProgress.value, [0, 1], [0.94, 1]);
    }

    if (neon) {
      style.shadowColor = color;
      style.shadowOffset = { width: 0, height: Platform.OS === "ios" ? 4 : 6 };
      style.shadowOpacity = interpolate(
        neonProgress.value,
        [0, 1],
        Platform.OS === "ios" ? [0.32, 0.58] : [0.42, 0.72]
      );
      style.shadowRadius = interpolate(
        neonProgress.value,
        [0, 1],
        Platform.OS === "ios" ? [10, 20] : [14, 24]
      );
      if (Platform.OS === "android") {
        style.elevation = 10;
      }
    }

    return style;
  });

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Animated.View style={[styles.stage, { width, height }, floatStyle]}>
        {neon ? (
          <Animated.View style={[styles.glowLayer, glowStyle]}>
            <AvatarNeonGlow
              color={color}
              width={width}
              height={height}
              gradientId={gradientId}
              opacity={1}
            />
          </Animated.View>
        ) : null}

        <Animated.View style={[styles.figure, figureStyle]}>
          <Image
            source={getAgentAvatarSource(assetId)}
            style={{ width, height }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  stage: {
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  glowRoot: {
    ...StyleSheet.absoluteFillObject,
  },
  haloSvg: {
    position: "absolute",
  },
  poolSvg: {
    position: "absolute",
  },
  groundShadow: {
    position: "absolute",
    alignSelf: "center",
    borderRadius: 999,
    backgroundColor: "rgba(0, 0, 0, 0.34)",
  },
  figure: {
    zIndex: 1,
    backgroundColor: "transparent",
  },
});
