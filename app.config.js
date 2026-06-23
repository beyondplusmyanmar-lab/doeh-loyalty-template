// Dynamic Expo config — derived entirely from brand.json so the white-label swap
// is a single file (spec E3). Editing brand.json rebrands both the in-app
// identity (src/config/brand.ts) and the native/store identity here.
//
// `brand.json` is schema-validated (brand.schema.json) via `pnpm validate:brand`.
const brand = require("./brand.json");

module.exports = {
  expo: {
    name: brand.name,
    slug: brand.slug,
    scheme: brand.scheme,
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    icon: brand.icon,
    splash: {
      image: brand.splash,
      resizeMode: "contain",
      backgroundColor: brand.colors.bg,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: brand.ios.bundleIdentifier,
    },
    android: {
      package: brand.android.package,
      adaptiveIcon: {
        foregroundImage: brand.icon,
        backgroundColor: brand.colors.bg,
      },
    },
    web: {
      bundler: "metro",
      output: "single",
    },
    plugins: ["expo-router", "expo-secure-store"],
    // Apple Team ID is used by `eas submit`, not compiled into the binary.
    // Only passed through when set (Expo coerces a null extra value to {}).
    extra: {
      ...(brand.ios.teamId ? { iosTeamId: brand.ios.teamId } : {}),
    },
  },
};
