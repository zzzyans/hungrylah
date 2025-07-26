import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import ScreenHeader from "../../../components/ScreenHeader";
import { colourPalette } from "../../../constants/Colors";

export default function AboutAppScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="About App" /> 
      <View style={styles.container}>
        <Text style={styles.appName}>HungryLah</Text>
        <Text style={styles.appVersion}>Version 3.0.0</Text>
        <Text style={styles.appDescription}>
          Your personalized food recommendation companion.
        </Text>
        <Text style={styles.copyright}>© 2025 HungryLah Team. All rights reserved.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colourPalette.lightYellow },
    container: { flex: 1, padding: wp(5), alignItems: 'center', justifyContent: 'center' },
    appName: { fontSize: hp(3.5), fontWeight: 'bold', color: colourPalette.textDark, marginBottom: hp(1) },
    appVersion: { fontSize: hp(2), color: colourPalette.textMedium, marginBottom: hp(3) },
    appDescription: { fontSize: hp(2), color: colourPalette.textDark, textAlign: 'center', marginBottom: hp(5) },
    copyright: { fontSize: hp(1.8), color: colourPalette.textLight }
});