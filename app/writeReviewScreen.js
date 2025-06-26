// app/WriteReviewScreen.jsx 

import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Keyboard, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { colourPalette } from "../constants/Colors";
import { useAuth } from "../context/authContext";
import { db } from "../firebaseConfig";

// STAR RATING COMPONENT 
const StarRating = ({ rating, onRatingChange, maxStars = 5 }) => {
  return (
    <View style={styles.starContainer}>
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onRatingChange(starValue)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={starValue <= rating ? "star" : "star-outline"}
              size={hp(3.5)} 
              color={colourPalette.lightBlue}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// WRITE REVIEW SCREEN 
export default function WriteReviewScreen({ isVisible, restaurantId, restaurantName, onClose }) {
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!rating) {
      Alert.alert("Error", "Please provide a star rating between 1 and 5.");
      return;
    }
    // Check if user is logged in before submitting
    if (!user || !user.uid) {
      Alert.alert("Error", "You must be logged in to submit a review.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a unique review ID if you want to allow multiple reviews per user per restaurant
      await addDoc(collection(db, "reviews"), {
        restaurantId,
        userId: user.uid,
        rating,
        reviewText,
        createdAt: serverTimestamp(),
      });
      Alert.alert("Success", "Review submitted successfully!");
      // Call onClose to dismiss the modal after submission
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Could not submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="fade" 
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.innerModalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.header}>Review {restaurantName}</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close-sharp" size={hp(4)} color={colourPalette.textDark} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Your Rating:</Text>
                <StarRating rating={rating} onRatingChange={setRating} />

                <Text style={styles.label}>Your Review:</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Write your review here..."
                  value={reviewText}
                  onChangeText={setReviewText}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={colourPalette.textMedium}
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmitReview}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colourPalette.white} />
                  ) : (
                    <Text style={styles.buttonText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: wp(90),
    maxHeight: hp(80), 
    backgroundColor: colourPalette.lightYellow,
    borderRadius: wp(5), 
    overflow: "hidden", 
  },
  innerModalContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
    paddingBottom: hp(3),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  closeButton: {
    padding: wp(1),
  },
  header: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: colourPalette.textDark,
    flexShrink: 1,
    marginRight: wp(2),
  },
  label: {
    fontSize: wp(4),
    color: colourPalette.textMedium,
    marginBottom: hp(1),
  },
  starContainer: {
    flexDirection: "row",
    marginBottom: hp(3),
  },
  input: {
    borderWidth: 1,
    borderColor: colourPalette.lightMint,
    borderRadius: 8,
    padding: wp(3),
    fontSize: wp(4),
    backgroundColor: colourPalette.white,
    color: colourPalette.textDark,
  },
  multilineInput: {
    height: hp(15),
    marginBottom: hp(0.5),
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: colourPalette.lightBlue,
    paddingVertical: hp(1.8),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(1),
  },
  buttonText: {
    color: colourPalette.white,
    fontSize: wp(4.5),
    fontWeight: "bold",
  },
});