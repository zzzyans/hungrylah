import axios from "axios";

const BASE_URL = "https://places.googleapis.com/v1/places:searchNearby";
const API_KEY = "AIzaSyD1b2c4g-8a9b2c4g-8a9b2c4g-8a9b2c4g";

/**
 * Fetches “Nearby Search (New)” results from Google Places.
 * @param {Object} options
 * @param {number} options.latitude    Center latitude
 * @param {number} options.longitude   Center longitude
 * @param {number[]} [options.types]   Array of place types, e.g. ["restaurant"]
 * @param {number} [options.radius]    Radius in meters (default: 500)
 * @param {number} [options.maxResults] Max results (default: 10)
 */

export async function fetchNearbyPlaces({
  latitude,
  longitude,
  types = ["restaurant"],
  radius = 1500,
  maxResults = 10,
}) {
  // Build the JSON body exactly as the API expects
  const body = {
    includedTypes: types,
    maxResultCount: maxResults,
    locationRestriction: {
      circle: {
        center: {
          latitude,
          longitude,
        },
        radius,
      },
    },
  };

  try {
    const response = await axios.post(
      BASE_URL,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
          // Only request the fields you need. Adjust the mask as desired:
          "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
        },
      }
    );
    return response.data; // { places: [ ... ], nextPageToken: "…" }
  } catch (error) {
    console.error("GlobalApi.fetchNearbyPlaces error:", error.response?.data || error.message);
    throw error;
  }
}