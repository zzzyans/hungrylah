import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { colourPalette } from "../constants/Colors";

export default function DisplayStars({ rating, maxStars = 5 }) {
  return (
    <View style={{ flexDirection: "row" }}>
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        return (
          <Ionicons
            key={index}
            name={starValue <= rating ? "star" : "star-outline"}
            size={wp(4)}
            color={colourPalette.lightBlue}
          />
        );
      })}
    </View>
  );
}