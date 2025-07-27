// app/(modals)/restaurantDetails.js 
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, increment, limit, orderBy, query, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import DisplayStars from "../../components/DisplayStars";
import { colourPalette } from "../../constants/Colors";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebaseConfig";
import WriteReviewScreen from "../writeReviewScreen";

const PLACEHOLDER_IMAGE = require("../../assets/images/logo.png");

export default function RestaurantDetailsScreen() {
  const params = useLocalSearchParams(); 
  const router = useRouter(); 
  const { user } = useAuth();
  const restaurantId = params.restaurantId;
  const onRefreshHome = params.onRefreshHome;

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);

  // Fetch restaurant details and reviews when this modal is shown.
  const fetchData = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, "restaurants", restaurantId));
      if (docSnap.exists()) {
        setRestaurant({ id: docSnap.id, ...docSnap.data() });
      }
      const reviewsQuery = query(
        collection(db, "reviews"),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const reviewsSnap = await getDocs(reviewsQuery);
      const fetchedReviews = reviewsSnap.docs
        .map(reviewDoc => ({ id: reviewDoc.id, ...reviewDoc.data() }))
        .filter(review => review.restaurantId === restaurantId); 
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenWriteReviewModal = () => {
    if (restaurant) { 
      setShowWriteReviewModal(true);
    }
  };

  const handleCloseWriteReviewModal = () => {
    setShowWriteReviewModal(false);
    fetchData(); // Re-fetch to get the latest reviews
  };

  const handleCloseDetailsModal = () => {
    router.back(); 
    if (onRefreshHome && typeof onRefreshHome === 'function') {
      onRefreshHome(true); // Force refresh Home
    }
  };

  const handleUpvoteReview = async (reviewId, currentUpvotedBy) => {
    if (!user || !user.uid) {
      Alert.alert("Login Required", "Please log in to upvote reviews.");
      return;
    }

    const reviewRef = doc(db, "reviews", reviewId);
    const hasUpvoted = currentUpvotedBy && currentUpvotedBy.includes(user.uid);

    try {
      if (hasUpvoted) {
        // User has already upvoted, so unvote
        await updateDoc(reviewRef, {
          helpfulVotes: increment(-1), // Decrement count
          upvotedBy: arrayRemove(user.uid), // Remove user's ID from array
        });
        // Optimistically update UI
        setReviews(prevReviews => prevReviews.map(rev =>
          rev.id === reviewId
            ? { ...rev, helpfulVotes: (rev.helpfulVotes || 0) - 1, upvotedBy: (rev.upvotedBy || []).filter(uid => uid !== user.uid) }
            : rev
        ));
        console.log(`Unvoted review ${reviewId}`);
        Alert.alert("Unvoted", "Your upvote has been removed.");
      } else {
        // User has not upvoted, so upvote
        await updateDoc(reviewRef, {
          helpfulVotes: increment(1), // Increment count
          upvotedBy: arrayUnion(user.uid), // Add user's ID to array
        });
        // Optimistically update UI
        setReviews(prevReviews => prevReviews.map(rev =>
          rev.id === reviewId
            ? { ...rev, helpfulVotes: (rev.helpfulVotes || 0) + 1, upvotedBy: [...(rev.upvotedBy || []), user.uid] }
            : rev
        ));
        console.log(`Upvoted review ${reviewId}`);
        Alert.alert("Upvoted!", "You have upvoted this review.");
      }
    } catch (error) {
      console.error("Error upvoting/unvoting review:", error);
      Alert.alert("Error", "Could not update review vote. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colourPalette.lightBlue} />
      </View>
    );
  }
  if (!restaurant) {
    return (
      <View style={styles.loader}>
        <Text style={styles.noData}>Restaurant details not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.modalContent}>
      <ScrollView contentContainerStyle={styles.innerContent}>
        <View style={styles.modalHeader}>
        <Text style={styles.header}>{restaurant.name}</Text> 
          <TouchableOpacity onPress={handleCloseDetailsModal} style={styles.closeButton}>
            <Ionicons name="close-sharp" size={hp(4)} color={colourPalette.textDark} />
          </TouchableOpacity>
        </View>
        <View style={styles.restaurantInfo}>
          <Image
            source={PLACEHOLDER_IMAGE}
            style={styles.restaurantImage}
          />
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantMeta}>
            {restaurant.cuisineType} • {"$".repeat(restaurant.priceLevel)}
          </Text>
          <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
          <Text style={styles.restaurantRating}>
            Rating: {restaurant.rating?.toFixed(1) || "N/A"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.writeReviewButton}
          onPress={handleOpenWriteReviewModal}
        >
          <Text style={styles.writeReviewButtonText}>Write a Review!</Text>
        </TouchableOpacity>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionHeader}>Recent Reviews</Text>
          {reviews.length > 0 ? (
            reviews.map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <DisplayStars rating={review.rating} />
                <Text style={styles.reviewText} numberOfLines={3} ellipsizeMode="tail">
                  {review.reviewText || "No review text."}
                </Text>
                <View style={styles.reviewCardFooter}> 
                  <Text style={styles.reviewDate}>
                    {review.createdAt && review.createdAt.toDate().toLocaleDateString("en-GB", {day: "2-digit", month: "2-digit"})}
                  </Text>

                  {/* Upvote Button */}
                  <TouchableOpacity
                    style={styles.upvoteButton}
                    onPress={() => handleUpvoteReview(review.id, review.upvotedBy)}
                  >
                    <Ionicons 
                      name={review.upvotedBy && review.upvotedBy.includes(user?.uid) ? "thumbs-up" : "thumbs-up-outline"} 
                      size={wp(5)} 
                      color={colourPalette.lightBlue} 
                    />
                    <Text style={styles.upvoteCount}>{review.helpfulVotes || 0}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noReviewsText}>No reviews for this restaurant yet.</Text>
          )}
        </View>
      </ScrollView>
      {showWriteReviewModal && restaurant && (
        <WriteReviewScreen
          isVisible={showWriteReviewModal}
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          onClose={handleCloseWriteReviewModal}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContent: { 
    width: wp(90),
    maxHeight: hp(80),
    backgroundColor: colourPalette.lightYellow,
    borderRadius: wp(5),
    overflow: "hidden",
    alignSelf: 'center', 
    marginTop: hp(13),
    marginBottom: hp(9), 
  },
  innerContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
    paddingBottom: hp(3),
  },
  loader: { 
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colourPalette.lightYellow, 
  },
  noData: { 
    fontSize: hp(2.2),
    color: colourPalette.textDark,
  },
  closeButtonSmall: { 
    backgroundColor: colourPalette.lightMint,
    padding: wp(2),
    borderRadius: wp(1),
    marginTop: hp(2),
  },
  closeButtonSmallText: { 
    color: colourPalette.white,
    fontSize: hp(2),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  header: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: colourPalette.textDark,
    flexShrink: 1,
    marginRight: wp(2),
  },
  closeButton: {
    padding: wp(1),
    borderRadius: wp(2),
  },
  restaurantInfo: {
    alignItems: "center",
    marginBottom: hp(3),
  },
  restaurantImage: {
    width: wp(80),
    height: hp(25),
    borderRadius: wp(4),
    marginBottom: hp(3.5),
  },
  restaurantName: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: colourPalette.textDark,
    marginBottom: hp(1),
  },
  restaurantMeta: {
    fontSize: wp(4),
    color: colourPalette.textMedium,
    marginBottom: hp(1),
  },
  restaurantAddress: {
    fontSize: wp(4),
    color: colourPalette.textMedium,
    marginBottom: hp(1),
  },
  restaurantRating: {
    fontSize: wp(4),
    color: colourPalette.lightBlue,
    marginBottom: hp(1),
  },
  writeReviewButton: {
    backgroundColor: colourPalette.lightBlue,
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    alignItems: "center",
    marginBottom: hp(3),
  },
  writeReviewButtonText: {
    color: colourPalette.white,
    fontSize: wp(4),
    fontWeight: "bold",
  },
  reviewsSection: {
    marginTop: hp(0),
  },
  sectionHeader: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: colourPalette.textDark,
    marginBottom: hp(2),
  },
  reviewCard: {
    backgroundColor: colourPalette.white,
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: hp(2),
    elevation: 2,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  reviewText: {
    fontSize: wp(4),
    color: colourPalette.textMedium,
    marginTop: hp(1),
    marginBottom: hp(1),
  },
  reviewDate: {
    fontSize: wp(3.5),
    color: colourPalette.textDark,
    textAlign: "right",
  },
  reviewCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(1),
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
    backgroundColor: colourPalette.lightMint + '40', 
    gap: wp(1),
  },
  upvoteCount: {
    fontSize: wp(3.5),
    color: colourPalette.textDark,
    fontWeight: '600',
  },
  noReviewsText: { 
    fontSize: hp(2),
    color: colourPalette.textMedium,
    textAlign: "center",
    paddingVertical: hp(2),
  },
  starDisplay: { 
    flexDirection: "row",
    marginBottom: hp(1), 
  },
});