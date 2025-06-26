// services/PreferencesService.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default class PreferencesService {
  constructor(userId) {
    if (!userId) {
      throw new Error(
        "User ID is required to initialize PreferencesService."
      );
    }
    this.userPrefsRef = doc(db, "userPreferences", userId);
  }

  // fetch the full prefs document
  async fetchPreferences() {
    try {
      const snap = await getDoc(this.userPrefsRef);
      if (!snap.exists()) return { success: true, data: null };
      const d = snap.data();
      return {
        success: true,
        data: {
          cuisines: d.cuisines || [],
          dietaryRestrictions: d.dietaryRestrictions || [],
          priceRange: d.priceRange || null,
        },
      };
    } catch (error) {
      console.error("PreferencesService.fetchPreferences:", error);
      return { success: false, error };
    }
  }

  async savePreferences(partial) {
    // partial = { cuisines?, dietaryRestrictions?, priceRange? }
    if (!partial || typeof partial !== "object") {
      return {
        success: false,
        error: new Error("Invalid data for savePreferences"),
      };
    }
    try {
      await setDoc(
        this.userPrefsRef,
        { ...partial, updatedAt: new Date() },
        { merge: true }
      );
      return { success: true };
    } catch (error) {
      console.error("PreferencesService.savePreferences:", error);
      return { success: false, error };
    }
  }
}