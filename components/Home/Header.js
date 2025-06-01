import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TextInput, View } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { colourPalette } from "../../constants/Colors";

export default function Header() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")} 
        style={styles.logo}
      />
      {/* search bar container */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={hp(2.5)} 
          color={colourPalette.lightLavender} 
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search for restaurants, cuisines..."
          placeholderTextColor={colourPalette.gray} 
          style={styles.searchBar}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3), 
  },
  logo: {
    width: hp(6),
    height: hp(6),
    resizeMode: "contain", 
  },
  searchContainer: {
    flex: 1, 
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colourPalette.white, 
    borderRadius: hp(5), 
    borderWidth: 1,
    borderColor: colourPalette.lightMint, 
    height: hp(5.5), 
  },
  searchIcon: {
    paddingLeft: wp(3),
  },
  searchBar: {
    flex: 1, 
    paddingHorizontal: wp(2.5), 
    fontSize: hp(1.8), 
    color: colourPalette.textDark, 
  },
});