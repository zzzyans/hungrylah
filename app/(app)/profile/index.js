// app/(app)/profile.jsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { colourPalette } from "../../../constants/Colors";
import { useAuth } from "../../../context/authContext";

// Memoized ProfileListItem component for better performance
const ProfileListItem = React.memo(({ iconName, text, onPress, showChevron = true }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.listItemContainer}
    activeOpacity={0.7}
  >
    <View style={styles.listItemContent}>
      <Ionicons
        name={iconName}
        size={hp(2.8)}
        color={colourPalette.lightLavender}
      />
      <Text style={styles.listItemText}>{text}</Text>
    </View>
    {showChevron && (
      <Ionicons
        name="chevron-forward-outline"
        size={hp(2.5)}
        color={colourPalette.lightLavender}
      />
    )}
  </TouchableOpacity>
));

// Memoized SectionHeader component
const SectionHeader = React.memo(({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
));

export default function Profile() {
  const { logout, user, updateProfilePicture } = useAuth();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  // Memoized navigation handlers
  const handleMyReviews = useCallback(() => router.push("/(app)/profile/myReviews"), [router]);
  const handleEditPreferences = useCallback(() => router.push("/(app)/profile/editPreferences"), [router]);
  const handleChangePassword = useCallback(() => router.push("/(app)/profile/changePassword"), [router]);
  const handleHelpSupport = useCallback(() => router.push("/(app)/profile/helpSupport"), [router]);
  const handleAboutApp = useCallback(() => router.push("/(app)/profile/aboutApp"), [router]);
  const handlePrivacyPolicy = useCallback(() => router.push("/(app)/profile/privacyPolicy"), [router]);
  const handleTermsOfService = useCallback(() => router.push("/(app)/profile/termsOfService"), [router]);

  // Memoized user data
  const userData = useMemo(() => ({
    displayName: user?.displayName || user?.username,
    email: user?.email || "No email provided",
    photoURL: user?.photoURL
  }), [user]);

  // Optimized image picking & uploading
  const handleChoosePhoto = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required", 
          "You need to allow access to your photos to upload a profile picture."
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], 
        quality: 0.5, 
      });

      if (pickerResult.canceled) {
        return;
      }

      if (pickerResult.assets && pickerResult.assets.length > 0) {
        const imageUri = pickerResult.assets[0].uri;
        setIsUploading(true);
        
        try {
          const uploadResponse = await updateProfilePicture(imageUri);
          
          if (uploadResponse.success) {
            Alert.alert("Success", "Profile picture updated!");
          } else {
            Alert.alert(
              "Upload Failed",
              uploadResponse.msg || "Could not update profile picture."
            );
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          Alert.alert("Error", "Failed to upload image. Please try again.");
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Error in image picker:", error);
      Alert.alert("Error", "Failed to access photo library.");
    }
  }, [updateProfilePicture]);

  // Memoized avatar component
  const renderAvatar = useMemo(() => {
    if (isUploading) {
      return (
        <View style={[styles.avatarPlaceholder, styles.avatarLoading]}>
          <ActivityIndicator size="large" color={colourPalette.lightBlue} />
        </View>
      );
    }
    
    if (userData.photoURL) {
      return <Image source={{ uri: userData.photoURL }} style={styles.avatar} />;
    }
    
    return (
      <View style={styles.avatarPlaceholder}>
        <Ionicons
          name="person-circle-outline"
          size={hp(10)}
          color={colourPalette.lightBlue}
        />
      </View>
    );
  }, [userData.photoURL, isUploading]);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* user info header */}
        <View style={styles.userInfoHeader}>
          <Pressable
            onPress={handleChoosePhoto} 
            style={styles.avatarContainer}
            disabled={isUploading} 
          > 
            {renderAvatar}
            {!isUploading && ( 
              <View style={styles.editIconOverlay}>
                <Ionicons name="camera" size={hp(2)} color={colourPalette.white} />
              </View>
            )}
          </Pressable>
          <Text style={styles.userName}>{userData.displayName}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
        </View>

        {/* app-related sections */}
        <SectionHeader title="My Activity & Preferences" />
        <View style={styles.section}>
          <ProfileListItem
            iconName="create-outline"
            text="My Reviews"
            onPress={handleMyReviews}
          />
          <ProfileListItem
            iconName="restaurant-outline"
            text="Taste Preferences"
            onPress={handleEditPreferences}
          />
        </View>

        {/* settings section */}
        <SectionHeader title="Settings" />
        <View style={styles.section}>
          <ProfileListItem
            iconName="lock-closed-outline"
            text="Change Password"
            onPress={handleChangePassword}
          />
        </View>

        {/* support & info section */}
        <SectionHeader title="Support & Information" />
        <View style={styles.section}>
          <ProfileListItem
            iconName="help-circle-outline"
            text="Help & Support"
            onPress={handleHelpSupport}
          />
          <ProfileListItem
            iconName="information-circle-outline"
            text="About App"
            onPress={handleAboutApp}
          />
          <ProfileListItem
            iconName="document-text-outline"
            text="Privacy Policy"
            onPress={handlePrivacyPolicy}
          />
          <ProfileListItem
            iconName="reader-outline"
            text="Terms of Service"
            onPress={handleTermsOfService}
          />
        </View>

        {/* logout button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.8}
        >
          <Ionicons
            name="log-out-outline"
            size={hp(2.8)}
            color={colourPalette.white}
          />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.appVersionText}>App Version 3.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colourPalette.lightYellow,
  },
  scrollViewContent: {
    paddingBottom: hp(4), 
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(8), 
    gap: hp(1.5),
  },
  userInfoHeader: {
    alignItems: "center",
    marginBottom: hp(1),
    gap: hp(0.5),
  },
  avatarContainer: {
    position: "relative",
    marginBottom: hp(1),
  },
  avatar: {
    width: hp(12),
    height: hp(12),
    borderRadius: hp(6),
    borderWidth: 2,
    borderColor: colourPalette.lightMint,
  },
  avatarPlaceholder: {
    width: hp(12),
    height: hp(12),
    borderRadius: hp(6),
    backgroundColor: colourPalette.lightMint,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colourPalette.lightBlue,
  },
  avatarLoading: {
    backgroundColor: colourPalette.lightMint + '80',
  },
  editIconOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colourPalette.lightBlue,
    padding: wp(1.5),
    borderRadius: wp(5),
    borderWidth: 1,
    borderColor: colourPalette.white,
  },
  userName: {
    fontSize: hp(2.8),
    fontWeight: "bold",
    color: "#333", 
  },
  userEmail: {
    fontSize: hp(1.8),
    color: "#555", 
  },
  section: {
    backgroundColor: colourPalette.white,
    borderRadius: wp(3),
    paddingVertical: hp(0.5), 
  },
  sectionHeader: {
    fontSize: hp(2.2),
    fontWeight: "600",
    color: "#444",
    marginLeft: wp(1), 
    marginBottom: hp(0.5),
    marginTop: hp(1),
  },
  listItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: colourPalette.lightMint, 
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(4),
  },
  listItemText: {
    fontSize: hp(2),
    color: "#333",
  },
  logoutButton: {
    flexDirection: "row",
    height: hp(6.5),
    backgroundColor: colourPalette.lightBlue,
    borderRadius: wp(3),
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(2),
    gap: wp(2),
    shadowColor: colourPalette.lightBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: hp(2.2),
    color: colourPalette.white,
    fontWeight: "bold",
  },
  appVersionText: {
    textAlign: "center",
    fontSize: hp(1.5),
    color: colourPalette.lightLavender,
    marginTop: hp(3),
  },
});