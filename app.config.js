import 'dotenv/config';
export default ({ config } = {} ) => {
  const base = config?.expo ? config.expo : {};
  return {
    expo: {
      ...base,
      name: "hungrylah",
      slug: "hungrylah",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/logo.png",
      scheme: "hungrylah",
      userInterfaceStyle: "automatic",
      newArchEnabled: true,
      ios: {
        ...base.ios,
        supportsTablet: true,
        config: {
          googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      android: {
        ...base.android,
        adaptiveIcon: {
          foregroundImage: "./assets/images/logo.png",
          backgroundColor: "#ffffff"
        },
        edgeToEdgeEnabled: true,
        package: "com.hungrylah.app",
        config: {
          googleMaps: {
            apiKey: process.env.GOOGLE_MAPS_API_KEY
          }
        }
      },
      web: {
        ...base.web,
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/logo.png"
      },
      plugins: [
        ...(base.plugins ?? []),
        'expo-router',
        'expo-web-browser',
      ],
      experiments: base.experiments
    }
  }
};

