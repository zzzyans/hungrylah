// components/common/ScreenHeader.js
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { colourPalette } from '../constants/Colors';

const ScreenHeader = ({ title, showBackButton = true }) => {
  const router = useRouter();
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftHeaderContent}>
        {showBackButton && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={hp(3.5)} color={colourPalette.textDark} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.headerTitle}>{title}</Text>

      <View style={styles.rightHeaderContent} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    marginBottom: hp(3),
  },
  leftHeaderContent: { 
    width: wp(10), 
    alignItems: 'flex-start', 
  },
  backButton: {
    padding: wp(1), 
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center', 
    fontSize: hp(3),
    fontWeight: 'bold',
    color: colourPalette.textDark,
  },
  rightHeaderContent: { 
    width: wp(10), 
    alignItems: 'flex-end', 
  },
});

export default ScreenHeader;