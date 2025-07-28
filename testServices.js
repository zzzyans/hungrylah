// testServices.js
import FavouriteService from "./services/FavouriteService";
import InteractionService from "./services/InteractionService";
import PreferencesService from "./services/PreferencesService";
import RecommendationService from "./services/RecommendationService";

const testRestaurant = {
  id: "ChIJ-QhpgCcR2jERakSJtK0yiSY",
  name: "Swensen's @ Plantation Plaza",
  cuisineType: "American",
  priceLevel: 2,
  photoURL: "https://via.placeholder.com/150",
};

const newUserId = "TestNewUser123";           // no prefs/reviews
const prefsOnlyUserId = "TestPrefsOnly456";   // prefs, no reviews
const heavyReviewUserId = "TestHeavyReview789"; // >3 reviews

async function testRecommendationService() {
  console.log("=== RecommendationService Tests ===");

  // 1. New user (no prefs/reviews)
  try {
    const recsNew = await RecommendationService.getRecommendations(
      newUserId
    );
    console.log("[New User] Recommendations:", recsNew);
  } catch (err) {
    console.error("[New User] Error:", err);
  }

  // 2. Prefs-only user (no reviews)
  try {
    const recsPrefs = await RecommendationService.getRecommendations(
      prefsOnlyUserId
    );
    console.log("[Prefs-Only User] Recommendations:", recsPrefs);
  } catch (err) {
    console.error("[Prefs-Only User] Error:", err);
  }

  // 3. Heavy-review user (>3 reviews)
  try {
    const recsHeavy = await RecommendationService.getRecommendations(
      heavyReviewUserId
    );
    console.log("[Heavy-Review User] Recommendations:", recsHeavy);
  } catch (err) {
    console.error("[Heavy-Review User] Error:", err);
  }

  // 4. computeScore function
  try {
    const score = RecommendationService.computeScore(
      testRestaurant,
      { cuisines: ["American"], priceRange: 2 }
    );
    console.log("[computeScore] Score:", score);
  } catch (err) {
    console.error("[computeScore] Error:", err);
  }
}

async function testFavouriteService() {
  console.log("=== FavouriteService Tests ===");

  // addFavourite & getFavourites
  try {
    await FavouriteService.addFavourite(newUserId, testRestaurant);
    const favsAfterAdd = await FavouriteService.getFavourites(
      newUserId
    );
    console.log("[Add Favourite] Favourites:", favsAfterAdd);
  } catch (err) {
    console.error("[Add Favourite] Error:", err);
  }

  // removeFavourite & getFavourites
  try {
    await FavouriteService.removeFavourite(newUserId, testRestaurant.id);
    const favsAfterRemove = await FavouriteService.getFavourites(
      newUserId
    );
    console.log("[Remove Favourite] Favourites:", favsAfterRemove);
  } catch (err) {
    console.error("[Remove Favourite] Error:", err);
  }

  // getFavouriteIds
  try {
    const favIds = await FavouriteService.getFavouriteIds(newUserId);
    console.log("[Favourite IDs] IDs:", favIds);
  } catch (err) {
    console.error("[Favourite IDs] Error:", err);
  }
}

async function testPreferencesService() {
  console.log("=== PreferencesService Tests ===");

  // fetchPreferences for new user
  try {
    const prefsNew = await new PreferencesService(newUserId)
      .fetchPreferences();
    console.log("[New User] Fetched Preferences:", prefsNew);
  } catch (err) {
    console.error("[New User] Error:", err);
  }

  // savePreferences and fetchPreferences for prefs-only user
  const prefsSvc = new PreferencesService(prefsOnlyUserId);
  try {
    const saveResult = await prefsSvc.savePreferences({
      cuisines: ["Italian", "Mexican"],
      priceRange: "2",
    });
    console.log("[Save Preferences] Result:", saveResult);
  } catch (err) {
    console.error("[Save Preferences] Error:", err);
  }

  try {
    const prefsFetched = await prefsSvc.fetchPreferences();
    console.log("[Fetch Preferences] Data:", prefsFetched);
  } catch (err) {
    console.error("[Fetch Preferences] Error:", err);
  }
}

async function testInteractionService() {
  console.log("=== InteractionService Tests ===");

  // addDislike & getDislikeIds
  try {
    await InteractionService.addDislike(newUserId, testRestaurant.id);
    const dislikes = await InteractionService.getDislikeIds(newUserId);
    console.log("[Add Dislike] Dislike IDs:", dislikes);
  } catch (err) {
    console.error("[Add Dislike] Error:", err);
  }
}

(async () => {
  await testRecommendationService();
  await testFavouriteService();
  await testPreferencesService();
  await testInteractionService();
})();