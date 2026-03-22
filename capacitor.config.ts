import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hellosaigon.app",
  appName: "HelloSaigon",
  webDir: "out",
  server: {
    url: "https://hellosaigon-omega.vercel.app",
    cleartext: false,
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#030810",
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: "#030810",
      showSpinner: false,
    },
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "HelloSaigon",
  },
  android: {
    backgroundColor: "#030810",
  },
};

export default config;
