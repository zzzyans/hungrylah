// app/(app)/profile/changePassword.js
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import ScreenHeader from "../../../components/ScreenHeader";
import { colourPalette } from "../../../constants/Colors";
import { useAuth } from "../../../context/authContext";

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { changePassword } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            Alert.alert("Error", "New password must be at least 8 characters long.");
            return;
        }
    
        setLoading(true);
        const response = await changePassword(currentPassword, newPassword);
        setLoading(false);
    
        if (response.success) {
            Alert.alert("Success", response.msg, [
            { text: "OK", onPress: () => router.back() },
            ]);
        } else {
            Alert.alert("Error", response.msg);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Change Password" /> 
        <View style={styles.container}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
            style={styles.input}
            placeholder="Enter your current password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholderTextColor={colourPalette.textMedium}
            />
            <Text style={styles.label}>New Password</Text>
            <TextInput
            style={styles.input}
            placeholder="Enter your new password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholderTextColor={colourPalette.textMedium}
            />
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
            style={styles.input}
            placeholder="Confirm your new password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor={colourPalette.textMedium}
            />
            <TouchableOpacity
            style={styles.button}
            onPress={handleUpdatePassword}
            disabled={loading}
            >          
            {loading ? (
                <ActivityIndicator color={colourPalette.white} />
            ) : (
                <Text style={styles.buttonText}>Update Password</Text>
            )}
            </TouchableOpacity>
        </View>
        </SafeAreaView>
    );
    }

    const styles = StyleSheet.create({
        safeArea: {
        flex: 1,
        backgroundColor: colourPalette.lightYellow,
        },
        container: {
        paddingHorizontal: wp(5),
        },
        label: {
        fontSize: hp(2),
        color: colourPalette.textMedium,
        marginBottom: hp(1),
        marginLeft: wp(1),
        },
        input: {
        backgroundColor: colourPalette.white,
        padding: hp(2),
        borderRadius: wp(3),
        fontSize: hp(2),
        marginBottom: hp(2),
        borderWidth: 1,
        borderColor: colourPalette.lightMint,
        color: colourPalette.textDark,
        },
        button: {
        backgroundColor: colourPalette.lightBlue,
        padding: hp(2),
        borderRadius: wp(3),
        alignItems: "center",
        marginTop: hp(2),
        },
        buttonText: {
        color: colourPalette.white,
        fontSize: hp(2.2),
        fontWeight: "bold",
        },
    });