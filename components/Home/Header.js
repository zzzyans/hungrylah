import { Ionicons } from "@expo/vector-icons";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { colourPalette } from "../../constants/Colors";
import DataCacheService from "../../services/DataCacheService";

export default function Header({ onSelect }) {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allRestaurants, setAllRestaurants] = useState([]);

  // Fetch all restaurants once when component mounts (using cache)
  useEffect(() => {
    const fetchAllRestaurants = async () => {
      try {
        const restaurants = await DataCacheService.getRestaurants();
        setAllRestaurants(restaurants);
        console.log(`[Header] Loaded ${restaurants.length} restaurants from cache`);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      }
    };
    
    fetchAllRestaurants();
  }, []);

  // Debounced search function (300ms delay)
  const runSearch = debounce((text) => {
    if (text.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      try {
        const searchTerm = text.toLowerCase().trim();
        const filtered = allRestaurants.filter(restaurant => {
          const name = restaurant.name?.toLowerCase() || '';
          const cuisine = restaurant.cuisineType?.toLowerCase() || '';
          return name.includes(searchTerm) || cuisine.includes(searchTerm);
        });
        
        console.log(`[Header] Search for "${text}" found ${filtered.length} results`);
        setResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 100);
  }, 300);

  // Trigger search when text changes
  useEffect(() => {
    runSearch(searchText);
    return () => runSearch.cancel();
  }, [searchText]);

  const handleSelect = (item) => {
    setSearchText(item.name);
    setResults([]);
    if (onSelect) onSelect(item);
  };

  const clearSearch = () => {
    setSearchText("");
    setResults([]);
  };

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
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons
              name="close-circle"
              size={hp(2.5)}
              color={colourPalette.gray}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Google-style dropdown results */}
      {(results.length > 0 || isSearching) && (
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingItem}>
              <ActivityIndicator size="small" color={colourPalette.lightBlue} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelect(item)}
                >
                  <Ionicons
                    name="restaurant"
                    size={hp(2.2)}
                    color={colourPalette.lightLavender}
                    style={styles.resultIcon}
                  />
                  <View style={styles.resultContent}>
                    <Text style={styles.resultText}>{item.name}</Text>
                    {item.cuisineType && (
                      <Text style={styles.resultSubtext}>{item.cuisineType}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3), 
    paddingBottom: hp(2),
    paddingTop: hp(1.5),
    marginHorizontal: wp(5),
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
  clearButton: {
    paddingRight: wp(3),
  },
  resultsContainer: {
    position: 'absolute',
    top: hp(7),
    left: wp(10),
    right: wp(5),
    backgroundColor: colourPalette.white,
    borderRadius: hp(1),
    maxHeight: hp(40),
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: colourPalette.lightMint,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderBottomWidth: 1,
    borderBottomColor: colourPalette.lightMint,
  },
  resultIcon: {
    marginRight: wp(2),
  },
  resultContent: {
    flex: 1,
  },
  resultText: {
    fontSize: hp(1.8),
    color: colourPalette.textDark,
    fontWeight: '500',
  },
  resultSubtext: {
    fontSize: hp(1.5),
    color: colourPalette.textMedium,
    marginTop: hp(0.2),
  },
  loadingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
  },
  loadingText: {
    fontSize: hp(1.6),
    color: colourPalette.textMedium,
    marginLeft: wp(2),
  },
});