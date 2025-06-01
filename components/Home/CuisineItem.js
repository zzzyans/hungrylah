import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { colourPalette } from "../../constants/Colors";

export default function CuisineItem({ Cuisine }) {
  return (
    <View style={styles.container}>
      <Text style={styles.nameText}>{Cuisine.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colourPalette.white, 
    paddingVertical: hp(1.5), 
    paddingHorizontal: wp(4), 
    borderRadius: wp(5), 
    alignItems: "center", 
    justifyContent: "center",
    borderWidth: 1, 
    borderColor: colourPalette.lightMint, 
    minWidth: wp(22),
    height: hp(5.5),
  },
  nameText: {
    fontSize: hp(1.7), 
    color: colourPalette.textDark, 
    fontWeight: "500", 
  },
});