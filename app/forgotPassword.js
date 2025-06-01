import { Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CustomKeyboardView from "../components/CustomKeyboardView";
import Loading from "../components/Loading";
import { useAuth } from "../context/authContext";

export default function ForgotPassword() {
  const router = useRouter();
  const { sendPasswordResetEmail } = useAuth(); 
  const [loading, setLoading] = useState(false);
  const emailRef = useRef("");

  const handleResetPassword = async () => {
    if (!emailRef.current) {
      Alert.alert("Forgot Password", "Please enter your email address.");
      return;
    }
    setLoading(true);
    const response = await sendPasswordResetEmail(emailRef.current);
    setLoading(false);

    if (response.success) {
      Alert.alert(
        "Password Reset",
        response.msg ||
          "If an account with this email exists, a password reset link has been sent. Please check your inbox (and spam folder).",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } else {
      Alert.alert("Password Reset Failed", response.msg);
    }
  };

  return (
    <CustomKeyboardView>
      <StatusBar style="dark" />
      <View
        style={{
          paddingTop: hp(10),
          paddingHorizontal: wp(5),
          backgroundColor: "#F7E6AE"
        }}
        className="flex-1 gap-12"
      >
        <View className="items-center">
          <Image
            style={{ height: hp(20) }} 
            resizeMode="contain"
            source={require("../assets/images/logo.png")} 
          />
        </View>

        <View className="gap-10">
          <Text
            style={{ fontSize: hp(4) }}
            className="font-bold tracking-wider text-center text-neutral-800"
          >
            Forgot Password
          </Text>

          <View className="gap-4">
            <Text
              style={{ fontSize: hp(1.8) }}
              className="text-center text-neutral-600"
            >
              Enter your email address below and we'll send you a link to reset
              your password.
            </Text>
            <View
              style={{
                height: hp(7),
                backgroundColor: "white",
                borderColor: "#B1EDE3", 
                borderWidth: 1
              }}
              className="flex-row gap-4 px-4 items-center rounded-2xl"
            >
              <Octicons name="mail" size={hp(2.7)} color="#C0A9D9" />
              <TextInput
                onChangeText={(value) => (emailRef.current = value)}
                style={{ fontSize: hp(2) }}
                className="flex-1 font-semibold text-neutral-700"
                placeholder="Email Address"
                placeholderTextColor={"gray"}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
              />
            </View>

            <View>
              {loading ? (
                <View className="flex-row justify-center">
                  <Loading size={hp(6.5)} color="#8EBEE0" />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleResetPassword}
                  style={{
                    height: hp(6.5),
                    backgroundColor: "#8EBEE0"
                  }}
                  className="rounded-xl justify-center items-center"
                >
                  <Text
                    style={{ fontSize: hp(2.7), color: "white" }}
                    className="font-bold tracking-wider"
                  >
                    Send Reset Link
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row justify-center">
              <Pressable onPress={() => router.back()}>
                <Text
                  style={{ fontSize: hp(1.8)}} 
                  className="font-semibold text-yellow-600"
                >
                  Back to Sign In
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </CustomKeyboardView>
  );
}6