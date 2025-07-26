// app/(app)/profile/myReviews.js

import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore"; // Added doc, getDoc
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import DisplayStars from "../../../components/DisplayStars";
import ScreenHeader from "../../../components/ScreenHeader";
import { colourPalette } from "../../../constants/Colors";
import { useAuth } from "../../../context/authContext";
import { db } from "../../../firebaseConfig";

export default function MyReviewsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [restaurants, setRestaurants] = useState({}); 
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!user?.uid) { 
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          // Fetch all restaurants once to map names to reviews
          const restSnapshot = await getDocs(collection(db, "restaurants"));
          const restMap = {};
          restSnapshot.forEach(doc => {
            restMap[doc.id] = doc.data();
          });
          setRestaurants(restMap);

          // Fetch reviews by the current user
          const q = query(collection(db, "reviews"), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const userReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setReviews(userReviews);
        } catch (error) {
          console.error("Error fetching my reviews:", error);
          Alert.alert("Error", "Could not fetch your reviews.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [user]) // Depend on user to re-fetch if user changes
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="My Reviews" />
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color={colourPalette.lightBlue} />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {reviews.length > 0 ? (
            reviews.map(review => {
              const restaurantName = restaurants[review.restaurantId]?.name || "Unknown Restaurant";
              const formattedDate = review.createdAt?.toDate().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }) || "";
              return (
                <View key={review.id} style={styles.reviewCard}>
                  <Text style={styles.restaurantName}>{restaurantName}</Text>
                  <DisplayStars rating={review.rating} />
                  <Text style={styles.reviewText}>{review.reviewText || "No comment."}</Text>
                  <Text style={styles.reviewDate}>{formattedDate}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.noReviewsText}>You haven't written any reviews yet.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colourPalette.lightYellow },
    container: { padding: wp(5) },
    reviewCard: { backgroundColor: colourPalette.white, borderRadius: wp(3), padding: wp(4), marginBottom: hp(2), elevation: 2 },
    restaurantName: { fontSize: wp(4.5), fontWeight: 'bold', color: colourPalette.textDark, marginBottom: hp(0.5) },
    starDisplay: { flexDirection: 'row', marginBottom: hp(1) },
    reviewText: { fontSize: wp(4), color: colourPalette.textMedium, fontStyle: 'italic', marginBottom: hp(1) },
    reviewDate: { fontSize: wp(3.5), color: colourPalette.textLight, textAlign: 'right' },
    noReviewsText: { textAlign: 'center', fontSize: hp(2), color: colourPalette.textMedium, marginTop: hp(5) }
});