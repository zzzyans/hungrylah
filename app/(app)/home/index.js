import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import DisplayStars from "../../../components/DisplayStars";
import Header from "../../../components/Home/Header";
import RestaurantMap from "../../../components/Home/RestaurantMap";
import { colourPalette } from "../../../constants/Colors";
import { db } from "../../../firebaseConfig";

const PLACEHOLDER_IMAGE = require("../../../assets/images/chinese.jpg");

export default function Home() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch restaurants from firestore
  useFocusEffect(
    useCallback(() => {
      async function fetchRestaurantsData() { 
        try {
          const q = query(collection(db, "restaurants"));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setRestaurants(data);
        } catch (error) {
          console.error("Error fetching restaurants:", error);
        } 
      }
      fetchRestaurantsData(); 
    }, [])
  );

  // Fetch reviews & usernames from firestore
  useFocusEffect(
    useCallback(() => {
      async function fetchReviewsAndUsernames() {
        try {
          const reviewsQuery = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(10));
          const reviewsSnapshot = await getDocs(reviewsQuery);
          const reviewData = reviewsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          const uniqueUserIds = [...new Set(reviewData.map(review => review.userId))];
          const userPromises = uniqueUserIds.map(async (userId) => {
            const userDoc = await getDoc(doc(db, "users", userId));
            return userDoc.exists() ? { id: userId, username: userDoc.data().username } : null;
          });
          const usersData = (await Promise.all(userPromises)).filter(Boolean); 

          const usernameMap = new Map(usersData.map(user => [user.id, user.username]));

          const reviewsWithUsernames = reviewData.map(review => ({
            ...review,
            username: usernameMap.get(review.userId) || "Anonymous",
          }));

          setReviews(reviewsWithUsernames);
        } catch (error) {
          console.error("Error fetching reviews and usernames:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchReviewsAndUsernames();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colourPalette.lightBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <RestaurantMap
        restaurants={restaurants}
        onMarkerPress={(restaurant) =>
          router.push({
            pathname: "(modals)/restaurantDetails", 
            params: { restaurantId: restaurant.id },
          })
        }
      />
      {/* Show recent reviews */}
      <ScrollView style={styles.reviewsContainer}>
        <Text style={styles.sectionHeader}>What Other Foodies Have To Say</Text>
        {reviews.map((review) => {
          const matchingRestaurant = restaurants.find(r => r.id === review.restaurantId);
          const restaurantName = matchingRestaurant ? matchingRestaurant.name : "Unknown Restaurant";
          const formattedDate = review.createdAt
            ? review.createdAt.toDate().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
              })
            : "";
          

            return (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeaderRow}>
                  <Image
                    source={PLACEHOLDER_IMAGE} // placeholder
                    style={styles.reviewUserImage}
                  />
                  <View style={styles.reviewHeaderTextContent}>
                    {/* Restaurant name header */}
                    <Text style={styles.reviewHeader}>{restaurantName}</Text>
                    {/* Reviewer's username */}
                    <Text style={styles.reviewUserName}>
                      {review.username} 
                    </Text>
                    <DisplayStars rating={review.rating} />
                  </View>
                </View>
                {/* Review Text with truncation */}
                <Text style={styles.reviewText} numberOfLines={3} ellipsizeMode="tail">
                  {review.reviewText || "No review text provided."}
                </Text>
                <Text style={styles.reviewMeta}>
                  {formattedDate}
                </Text>
              </View>
            );  
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colourPalette.lightYellow,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewsContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  sectionHeader: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: colourPalette.textDark,
    marginBottom: hp(2),
  },
  reviewCard: {
    backgroundColor: colourPalette.white,
    borderRadius: wp(2), 
    padding: wp(3), 
    marginBottom: hp(2),
    elevation: 2,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1),
  },
  reviewUserImage: {
    width: wp(12), 
    height: wp(12),
    borderRadius: wp(2),
    marginRight: wp(3.5),
    marginLeft: wp(1),
  },
  reviewHeaderTextContent: {
    flex: 1, 
  },
  reviewUserName: {
    fontSize: wp(4),
    fontWeight: "400", 
    color: colourPalette.textDark,
    marginBottom: hp(0.4), 
  },
  reviewHeader: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: colourPalette.textDark,
    marginBottom: hp(0.5),
    flex: 1
  },
  reviewText: {
    fontSize: wp(4),
    color: colourPalette.textMedium,
    marginBottom: hp(1),
    lineHeight: hp(2)
  },
  reviewMeta: {
    fontSize: wp(3.5),
    color: colourPalette.textDark,
    textAlign: "right",
  },
});