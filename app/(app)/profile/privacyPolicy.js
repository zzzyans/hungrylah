import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import ScreenHeader from "../../../components/ScreenHeader";
import { colourPalette } from "../../../constants/Colors";

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Privacy Policy" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.policyTitle}>HungryLah Privacy Policy</Text>
        <Text style={styles.policyText}>
          This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make use of the HungryLah mobile application.
        </Text>
        <Text style={styles.policySubtitle}>Information We Collect</Text>
        <Text style={styles.policyText}>
          When you use the App, we collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you use the App, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the App, and information about how you interact with the App.
        </Text>
        <Text style={styles.policyText}>
          We also collect information you provide directly to us when you create an account, update your profile, or submit reviews, such as your name, email address, password, and food preferences.
        </Text>
        <Text style={styles.policySubtitle}>How We Use Your Information</Text>
        <Text style={styles.policyText}>
          We use the information we collect generally to fulfill any orders placed through the App (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to: {"\n"}
          <Text style={styles.policyListItem}>  - Communicate with you;</Text> {"\n"}
          <Text style={styles.policyListItem}>  - Screen our orders for potential risk or fraud; </Text> {"\n"}
          <Text style={styles.policyListItem}>  - When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</Text>
        </Text>
        {/* <Text style={styles.policyText}>
          For a full version of our privacy policy, please visit our website at [Your Website Link].
        </Text> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colourPalette.lightYellow },
    container: { padding: wp(5) },
    policyTitle: { fontSize: hp(2.5), fontWeight: 'bold', color: colourPalette.textDark, marginBottom: hp(2) },
    policySubtitle: { fontSize: hp(2.2), fontWeight: '600', color: colourPalette.textDark, marginTop: hp(2), marginBottom: hp(1) },
    policyText: { fontSize: hp(1.8), color: colourPalette.textMedium, lineHeight: hp(2.5), marginBottom: hp(1) },
    policyListItem: { marginLeft: wp(4) }
});