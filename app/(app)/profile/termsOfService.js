import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import ScreenHeader from "../../../components/ScreenHeader";
import { colourPalette } from "../../../constants/Colors";

export default function TermsOfServiceScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Terms of Service" /> 
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.termsTitle}>HungryLah Terms of Service</Text>
        <Text style={styles.termsText}>
          Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the HungryLah mobile application (the "Service") operated by HungryLah Team ("us", "we", or "our").
        </Text>
        <Text style={styles.termsSubtitle}>1. Acceptance of Terms</Text>
        <Text style={styles.termsText}>
          By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
        </Text>
        <Text style={styles.termsSubtitle}>2. Use of the Service</Text>
        <Text style={styles.termsText}>
          The Service and its original content, features and functionality are and will remain the exclusive property of HungryLah Team and its licensors. The Service is protected by copyright, trademark, and other laws of both Singapore and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of HungryLah Team.
        </Text>
        <Text style={styles.termsSubtitle}>3. User Accounts</Text>
        <Text style={styles.termsText}>
          When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
        </Text>
        {/* <Text style={styles.termsText}>
          For a full version of our terms of service, please visit our website at [Your Website Link].
        </Text> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colourPalette.lightYellow },
    container: { padding: wp(5) },
    termsTitle: { fontSize: hp(2.5), fontWeight: 'bold', color: colourPalette.textDark, marginBottom: hp(2) },
    termsSubtitle: { fontSize: hp(2.2), fontWeight: '600', color: colourPalette.textDark, marginTop: hp(2), marginBottom: hp(1) },
    termsText: { fontSize: hp(1.8), color: colourPalette.textMedium, lineHeight: hp(2.5), marginBottom: hp(1) }
});