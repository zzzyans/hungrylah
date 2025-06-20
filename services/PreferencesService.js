import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

class UserPreferencesService {
  constructor(userId) {
    if (!userId) {
      throw new Error(
        "User ID is required to initialize UserPreferencesService.",
      );
    }
    this.userId = userId;
    this.userPrefsRef = doc(db, "userPreferences", this.userId);
  }

  async fetchPreferences() {
    try {
      const docSnap = await getDoc(this.userPrefsRef);
      if (docSnap.exists()) {
        const prefs = docSnap.data();
        return {
          success: true,
          data: {
            cuisines: prefs.cuisines || [],
            dietaryRestrictions: prefs.dietaryRestrictions || [],
            priceRange: prefs.priceRange || null,
          },
        };
      }
      return { success: true, data: null }; // no preferences found is not an error
    } catch (e) {
      console.error("Error fetching preferences in service:", e);
      return { success: false, error: e };
    }
  }

  async savePreferences(preferencesData) {
    // preferencesData should be an object like:
    // { cuisines: [], dietaryRestrictions: [], priceRange: "" }
    if (
      !preferencesData ||
      typeof preferencesData.cuisines === "undefined" ||
      typeof preferencesData.dietaryRestrictions === "undefined" ||
      typeof preferencesData.priceRange === "undefined" 
    ) {
      console.error("Invalid preferences data provided to savePreferences");
      return {
        success: false,
        error: new Error("Invalid preferences data."),
      };
    }

    try {
      await setDoc(
        this.userPrefsRef,
        {
          ...preferencesData,
          updatedAt: new Date(),
        },
        { merge: true },
      );
      return { success: true };
    } catch (e) {
      console.error("Error saving preferences in service:", e);
      return { success: false, error: e };
    }
  }
}

export default UserPreferencesService;