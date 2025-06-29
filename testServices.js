// testServices.js
import FavouriteService from "./services/FavouriteService";
import PreferencesService from "./services/PreferencesService";
import RecommendationService from "./services/RecommendationService";

const testUserId = "No9EtPKaZfQQFSBdcni9VJWDlL83";
const testRestaurant = {
  id: "ChIJ-QhpgCcR2jERakSJtK0yiSY",
  name: "Swensen's @ Plantation Plaza",
  cuisineType: "American",
  priceLevel: 2,
  photoURL: "https://via.placeholder.com/150",
};

async function testRecommendationService() {
  console.log("=== Testing RecommendationService ===");
  const recommendations = await RecommendationService.getRecommendations(testUserId);
  console.log("Recommendations:", recommendations);
}

async function testFavouriteService() {
  console.log("=== Testing FavouriteService ===");
  await FavouriteService.addFavourite(testUserId, testRestaurant);
  const favsAfterAdd = await FavouriteService.getFavourites(testUserId);
  console.log("Favourites after adding:", favsAfterAdd);
  await FavouriteService.removeFavourite(testUserId, testRestaurant.id);
  const favsAfterRemove = await FavouriteService.getFavourites(testUserId);
  console.log("Favourites after removal:", favsAfterRemove);
}

async function testPreferencesService() {
  console.log("=== Testing PreferencesService ===");
  const prefsSvc = new PreferencesService(testUserId);
  const prefs = await prefsSvc.fetchPreferences();
  console.log("Fetched preferences:", prefs);
  const result = await prefsSvc.savePreferences({ cuisines: ["Italian", "Mexican"], priceRange: "2" });
  console.log("Save preferences result:", result);
}

// Run the tests
(async () => {
  await testRecommendationService();
  await testFavouriteService();
  await testPreferencesService();
})();