import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { colourPalette } from "../constants/Colors";

const SelectableItem = ({ label, onPress, isSelected }) => {
  return (
    <TouchableOpacity
      style={[styles.item, isSelected && styles.itemSelected]}
      onPress={onPress}
      activeOpacity={0.7} 
    >
      <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: colourPalette.white,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3.5),
    borderRadius: wp(5), // Pill shape
    borderWidth: 1,
    borderColor: colourPalette.lightMint,
    // Add some margin if items are directly next to each other without a gap from parent
    // marginRight: wp(2),
    // marginBottom: hp(1), // If they wrap and need vertical spacing
  },
  itemSelected: {
    backgroundColor: colourPalette.lightBlue,
    borderColor: colourPalette.lightBlue,
  },
  itemText: {
    fontSize: hp(1.8),
    color: colourPalette.textDark,
  },
  itemTextSelected: {
    color: colourPalette.white,
    fontWeight: "500",
  },
});

export default SelectableItem;