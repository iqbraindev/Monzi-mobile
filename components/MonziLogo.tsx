import { Image, StyleSheet, type ImageStyle, type StyleProp } from "react-native";

const logoSource = require("@/assets/logo-mozi.png");

const resolved = Image.resolveAssetSource(logoSource);
const LOGO_ASPECT = resolved.width / resolved.height;

export const MONZI_LOGO_APP_HEIGHT = 36;
export const MONZI_LOGO_PROMO_HEIGHT = 64;

type MonziLogoProps = {
  height?: number;
  style?: StyleProp<ImageStyle>;
};

export function MonziLogo({ height = MONZI_LOGO_APP_HEIGHT, style }: MonziLogoProps) {
  return (
    <Image
      source={logoSource}
      accessibilityLabel="Monzi"
      resizeMode="contain"
      style={[styles.logo, { height, width: height * LOGO_ASPECT }, style]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    flexShrink: 0,
  },
});
