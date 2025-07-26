import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import DisplayStars from "../../../components/DisplayStars";
import Header from "../../../components/Home/Header";
import RestaurantMap from "../../../components/Home/RestaurantMap";
import { colourPalette } from "../../../constants/Colors";
import DataCacheService from "../../../services/DataCacheService";

const PLACEHOLDER_IMAGE = require("../../../assets/images/chinese.jpg");

export default function Home() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Handle search selection
  const handleSearchSelect = (selectedRestaurant) => {
    router.push({
      pathname: "(modals)/restaurantDetails",
      params: { restaurantId: selectedRestaurant.id },
    });
  };

  // Load data with caching and parallel fetching
  const loadData = useCallback(async () => {
    if (initialLoad) {
      setLoading(true);
    }
    
    try {
      // Fetch restaurants and reviews in parallel
      const [restaurantsData, reviewsData] = await Promise.all([
        DataCacheService.getRestaurants(),
        DataCacheService.getRecentReviews(10)
      ]);

      setRestaurants(restaurantsData);

      // Process reviews with usernames efficiently
      const uniqueUserIds = [...new Set(reviewsData.map(review => review.userId))];
      
      // Fetch user data in parallel
      const userPromises = uniqueUserIds.map(userId => DataCacheService.getUser(userId));
      const usersData = (await Promise.all(userPromises)).filter(Boolean);

      const usernameMap = new Map(usersData.map(user => [user.id, user.username]));

      const reviewsWithUsernames = reviewsData.map(review => ({
        ...review,
        username: usernameMap.get(review.userId) || "Anonymous",
      }));

      setReviews(reviewsWithUsernames);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [initialLoad]);

  // Load data on mount and focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Preload data when component mounts
  useEffect(() => {
    DataCacheService.preloadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colourPalette.lightBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header onSelect={handleSearchSelect} />
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