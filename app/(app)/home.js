import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import Cuisines from "../../components/Home/Cuisines";
import GoogleMapView from "../../components/Home/GoogleMapView";
import Header from "../../components/Home/Header";
import { colourPalette } from "../../constants/Colors";

export default function Home() {

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      {/* overall container */}
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <Header />
        </View>

        <View style={styles.mapContainer}>
          <GoogleMapView />
        </View>
        
        <View style={styles.cuisinesSection}>
          <Cuisines />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colourPalette.lightYellow, 
  },
  scrollViewContent: {
    paddingBottom: hp(3), 
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(4), 
    paddingTop: hp(8), 
  },
  headerWrapper: {
    marginBottom: hp(2.5), 
  },
  mapContainer: {
    height: hp(35), 
    borderRadius: wp(4),
    overflow: "hidden", 
    marginBottom: hp(3),
    backgroundColor: colourPalette.lightYellow, 
  }
});