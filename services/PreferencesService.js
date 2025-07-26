// services/PreferencesService.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default class PreferencesService {
  constructor(userId) {
    if (!userId) {
      throw new Error("User ID is required to initialize PreferencesService.");
    }
    this.userPrefsRef = doc(db, "userPreferences", userId);
    console.log(`[PreferencesService] Initialized for user ${userId}`);
  }

  async fetchPreferences() {
    try {
      const snap = await getDoc(this.userPrefsRef);
      if (!snap.exists()) {
        console.log("[PreferencesService.fetchPreferences] No preferences found.");
        return { success: true, data: null };
      }
      const d = snap.data();
      console.log("[PreferencesService.fetchPreferences] Fetched preferences:", d);
      return {
        success: true,
        data: {
          cuisines: d.cuisines || [],
          dietaryRestrictions: d.dietaryRestrictions || [],
          priceRange: d.priceRange || null,
        },
      };
    } catch (error) {
      console.error("PreferencesService.fetchPreferences Error:", error);
      return { success: false, error };
    }
  }

  async savePreferences(partial) {
    if (!partial || typeof partial !== "object") {
      console.error("[PreferencesService.savePreferences] Invalid preferences data:", partial);
      return { success: false, error: new Error("Invalid data for savePreferences") };
    }
    try {
      console.log("[PreferencesService.savePreferences] Saving preferences:", partial);
      await setDoc(
        this.userPrefsRef,
        { ...partial, updatedAt: new Date() },
        { merge: true }
      );
      console.log("[PreferencesService.savePreferences] Preferences saved successfully.");
      return { success: true };
    } catch (error) {
      console.error("PreferencesService.savePreferences Error:", error);
      return { success: false, error };
    }
  }
  
}