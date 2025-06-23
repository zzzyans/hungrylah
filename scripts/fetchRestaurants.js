// scripts/fetchRestaurants.js

require('dotenv').config();
console.log('projectId:', process.env.FIRESTORE_PROJECT_ID);
console.log('Loaded GOOGLE_PLACES_API_KEY:', process.env.GOOGLE_PLACES_API_KEY);

const { Firestore } = require('@google-cloud/firestore');
const { Client } = require('@googlemaps/google-maps-services-js');

class PlacesService {
  constructor(apiKey) {
    this.client = new Client();
    this.apiKey = apiKey;
  }

  /**
   * Perform a Nearby Search with optional keyword.
   * @param {{ lat: number, lng: number }} location 
   * @param {number} radius 
   * @param {string} keyword 
   * @param {string|null} pageToken 
   * @returns {Promise<{ places: any[], nextPageToken: string|null }>}
   */
  async nearbySearch(location, radius, keyword = '', pageToken = null) {
    const params = {
      key: this.apiKey,
      location,
      radius,
      keyword,
      type: 'restaurant',
      ...(pageToken && { pagetoken: pageToken }),
    };
    const res = await this.client.placesNearby({ params });
    return {
      places: res.data.results,
      nextPageToken: res.data.next_page_token || null,
    };
  }
}

class FirestoreService {
  constructor() {
    this.db = new Firestore({
      projectId: process.env.FIRESTORE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    this.collection = this.db.collection('restaurants');
  }

  /**
   * Upsert a place document keyed by its Place ID.
   * @param {object} place 
   */
  async upsertPlace(place) {
    const docRef = this.collection.doc(place.place_id);
    await docRef.set({
      name: place.name,
      location: place.geometry.location,
      address: place.vicinity,
      rating: place.rating || null,
      userRatingsTotal: place.user_ratings_total || 0,
      types: place.types,
      fetchedAt: Firestore.Timestamp.now(),
    });
    console.log(`✓ Wrote ${place.name}`);
  }
}

(async () => {
  const places = new PlacesService(process.env.GOOGLE_PLACES_API_KEY);
  const store  = new FirestoreService();

  // Center on Singapore (example)
  const location = { lat: 1.3521, lng: 103.8198 };
  const radius   = 5000; // in meters

  const seen = new Set();
  let nextPage = null;
  let allPlaces = [];

  // Keywords for diversity — feel free to tweak or expand
  const keywords = ['Chinese','Indian','Malay','Italian','Japanese','Thai','Korean','Mexican','Vietnamese','Mediterranean','French','American'];

  for (const kw of keywords) {
    let pageToken = null;
    // up to 2 pages per cuisine
    for (let i = 0; i < 2; i++) {
      const { places: batch, nextPageToken } = 
        await places.nearbySearch(location, radius, kw, pageToken);

      batch.forEach(p => {
        if (!seen.has(p.place_id) && allPlaces.length < 50) {
          seen.add(p.place_id);
          allPlaces.push(p);
        }
      });

      if (!nextPageToken || allPlaces.length >= 50) break;
      pageToken = nextPageToken;
      // Google requires a short delay before using next_page_token
      await new Promise(r => setTimeout(r, 2000));
    }
    if (allPlaces.length >= 50) break;
  }

  console.log(`Fetched ${allPlaces.length} unique restaurants.`);

  // Write into Firestore
  for (const place of allPlaces) {
    await store.upsertPlace(place);
  }

  console.log('All done. 🍽️');
  process.exit(0);
})();
