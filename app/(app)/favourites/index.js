// app/(app)/favourites.js
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { colourPalette } from "../../../constants/Colors";
import { useAuth } from "../../../context/authContext";
import FavouriteService from "../../../services/FavouriteService";
import WriteReviewScreen from "../../writeReviewScreen";

export default function Favourites() {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for managing review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRestaurantForReview, setSelectedRestaurantForReview] = useState(null);

  // Fetch favourites
  const fetchFavourites = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true); // Set loading true on every fetch attempt
    try {
      const favs = await FavouriteService.getFavourites(user.uid);
      setFavourites(favs);
    } catch (err) {
      console.error("Error fetching favourites:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh favourites every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        await fetchFavourites();
      }
      loadData();
    }, [fetchFavourites])
  );

  const handleRemoveFavourite = async (restaurantId) => {
    try {
      await FavouriteService.removeFavourite(user.uid, restaurantId);
      // Refresh list immediately after removal
      fetchFavourites();
    } catch (error) {
      console.error("Error removing favourite:", error);
      Alert.alert("Error", "Could not remove favourite.");
    }
  };

  // Open review modal
  const handleOpenReviewModal = (restaurant) => {
    setSelectedRestaurantForReview(restaurant);
    setShowReviewModal(true);
  };

  // Close review modal and refresh list
  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedRestaurantForReview(null);
    fetchFavourites(); // Refresh favourites after review submission
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colourPalette.lightBlue} />
      </View>
    );
  }

  if (!favourites.length) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.noFavouritesText}>No favourites yet.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Favourites</Text>
      <ScrollView contentContainerStyle={styles.favContainer}>
        {favourites.map((fav) => (
          <View key={fav.id} style={styles.card}>
            <Image
              source={{ uri: fav.photoURL || "https://via.placeholder.com/300" }}
              style={styles.image}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{fav.name}</Text>
              <Text style={styles.meta}>
                {fav.cuisineType} • {"$".repeat(fav.priceLevel)}
              </Text>
              <View style={styles.cardActions}>
                {/* Remove Button */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleRemoveFavourite(fav.restaurantId)}
                >
                  <Ionicons name="trash-outline" size={wp(5)} color={colourPalette.textDark} />
                  <Text style={styles.actionButtonText}>Remove</Text>
                </TouchableOpacity>

                {/* Write Review Button */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleOpenReviewModal(fav)}
                >
                  <Ionicons name="create-outline" size={wp(5)} color={colourPalette.textDark} />
                  <Text style={styles.actionButtonText}>Write Review</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ADDED: Review Modal */}
      {showReviewModal && selectedRestaurantForReview && (
        <WriteReviewScreen
          isVisible={showReviewModal}
          restaurantId={selectedRestaurantForReview.restaurantId}
          restaurantName={selectedRestaurantForReview.name}
          onClose={handleCloseReviewModal} // Pass callback to close modal
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colourPalette.lightYellow,
    paddingHorizontal: wp(5),
  },
  header: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: colourPalette.textDark,
    textAlign: "center",
    marginVertical: hp(3),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colourPalette.lightYellow,
  },
  noFavouritesText: {
    color: colourPalette.textDark,
    fontSize: hp(2.2),
  },
  favContainer: {
    paddingBottom: hp(4),
  },
  card: {
    backgroundColor: colourPalette.white,
    borderRadius: 15,
    marginBottom: hp(3),
    elevation: 5,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: hp(20),
  },
  cardContent: {
    padding: wp(4),
  },
  cardTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: colourPalette.textDark,
  },
  meta: {
    fontSize: wp(3.5),
    color: colourPalette.textMedium,
    marginVertical: hp(1),
  },
  cardActions: {                    
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: colourPalette.lightMint,
    paddingTop: hp(1.5),
  },
  actionButton: {                          
    alignItems: "center",
    justifyContent: "center",
    padding: wp(1),
    flexDirection: "row", // for icon and text
    gap: wp(1),
  },
  actionButtonText: {                    
    fontSize: wp(3.5),
    color: colourPalette.textDark,
    fontWeight: "500",
  },
});