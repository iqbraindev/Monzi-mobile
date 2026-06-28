import { StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

function GlowOrb({
  size,
  color,
  gradientId,
  style,
  centerOpacity = 0.24,
}: {
  size: number;
  color: string;
  gradientId: string;
  style?: ViewStyle;
  centerOpacity?: number;
}) {
  const radius = size / 2;

  return (
    <View style={[styles.orb, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient
            id={gradientId}
            cx="50%"
            cy="50%"
            rx="50%"
            ry="50%"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0%" stopColor={color} stopOpacity={centerOpacity} />
            <Stop offset="32%" stopColor={color} stopOpacity={centerOpacity * 0.55} />
            <Stop offset="58%" stopColor={color} stopOpacity={centerOpacity * 0.2} />
            <Stop offset="78%" stopColor={color} stopOpacity={0.04} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={radius} cy={radius} r={radius} fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

export function AuthBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <GlowOrb
        gradientId="auth-glow-purple"
        color="#7C3AED"
        size={420}
        centerOpacity={0.28}
        style={styles.glowPurple}
      />
      <GlowOrb
        gradientId="auth-glow-cyan"
        color="#06B6D4"
        size={360}
        centerOpacity={0.18}
        style={styles.glowCyan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
  },
  glowPurple: {
    top: -140,
    left: -120,
  },
  glowCyan: {
    bottom: 40,
    right: -120,
  },
});
