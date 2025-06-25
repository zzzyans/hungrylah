// scripts/fetchRestaurants.js

require('dotenv').config();
const path = require('path');

const { Firestore, Timestamp } = require('@google-cloud/firestore');
const { Client } = require('@googlemaps/google-maps-services-js');

// Configuration
const TARGET_COUNT = 50;
const CUISINE_KEYWORDS = ['Chinese','Indian','Malay','Italian','Japanese','Thai','Korean','Mexcian','Vietnamese','Mediterranean','French','American'];
const PRICE_LEVELS = [1,2,3,4];

// Compute balanced quotas
const cuisineQuota = Math.floor(TARGET_COUNT / CUISINE_KEYWORDS.length);
const priceQuota   = Math.floor(TARGET_COUNT / PRICE_LEVELS.length);

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
    async nearbySearch(location, radius, keyword = '', pageToken = null, priceLevel = null) {
        const params = {
            key: this.apiKey,
            location,
            radius,
            keyword,
            type: 'restaurant',
            region: 'SG',
            ...(priceLevel != null && { minprice: priceLevel, maxprice: priceLevel }),
            ...(pageToken && { pagetoken: pageToken }),
        };
        const res = await this.client.placesNearby({ params });
        return {
            places: res.data.results,
            nextPageToken: res.data.next_page_token || null,
        };
    }

    async textSearch(query, pageToken = null) {
        const params = {
            key: this.apiKey,
            query,
            region: "SG",
            ...(pageToken && { pagetoken: pageToken }),
        };
        const res = await this.client.textSearch({ params });
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
     * Upsert a restaurant record
     * @param {object} record
     */
    async upsertRestaurant(record) {
        if (!record.name || !record.geometry?.location || !record.vicinity
            || !record.meta.cuisineType || !record.meta.priceLevel) {
            return;
        }

        const docRef = this.collection.doc(record.place_id);
        await docRef.set({
            name: record.name,
            cuisineType: record.meta.cuisineType,
            priceLevel: record.meta.priceLevel,
            location: record.geometry.location,
            address: record.vicinity,
            rating: record.rating ?? null,
            types: record.types,
            fetchedAt: Timestamp.now(),
        });
        console.log(`✓ Wrote ${record.name} [${record.meta.cuisineType}]`);
    }
}

(async () => {

    const placesSvc = new PlacesService(process.env.GOOGLE_PLACES_API_KEY);
    const storeSvc  = new FirestoreService();

    const radius   = 5000; // in meters

    const SEARCH_CENTERS = [
        { lat:1.35, lng:103.95 }, // Tampines
        { lat:1.39390, lng:103.89 }, // Sengkang
        { lat:1.2801, lng:103.8447 }, // Bugis
        { lat:1.3521, lng:103.8198 }, // Central
        { lat:1.2954, lng:103.7767 }, // East Coast
        { lat:1.3333, lng:103.7434 }, // Jurong East
    ];

    // 1) Nearby searches from multiple centers
    const pool = [];
    for (const center of SEARCH_CENTERS) {
        for (const cuisine of CUISINE_KEYWORDS) {
            let pageToken = null;
            for (let i = 0; i < 2; i++) {
                const { places, nextPageToken } =
                await placesSvc.nearbySearch(center, radius, cuisine, pageToken);
            
                const SG_BOUNDS = {
                    north: 1.4700,
                    south: 1.1300,
                    east:  104.0930,
                    west:  103.6020,
                };
                
                function isInSG({ lat, lng }) {
                    return (
                        lat <= SG_BOUNDS.north &&
                        lat >= SG_BOUNDS.south &&
                        lng <= SG_BOUNDS.east &&
                        lng >= SG_BOUNDS.west
                    );
                }

                places.forEach(p => {
                    const loc = p.geometry?.location;
                    if (loc && isInSG(loc) && p.price_level != null && !pool.some(x => x.place_id === p.place_id)) {
                        p.meta = {
                            cuisineType: cuisine,
                            priceLevel: p.price_level,
                        };
                        pool.push(p);
                    }
                });
        
                if (!nextPageToken) break;
                pageToken = nextPageToken;
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }

    // 2) Text search to catch other spots
    for (const cuisine of CUISINE_KEYWORDS) {
        let pageToken = null;
        const query = `${cuisine} restaurant Singapore`;
        for (let i = 0; i < 2; i++) {
            const { places, nextPageToken } = await placesSvc.textSearch(query, pageToken);
            places.forEach(p => {
                if (
                    p.price_level != null &&
                    !pool.some(x => x.place_id === p.place_id)
                ) {
                    p.meta = {
                        cuisineType: cuisine,
                        priceLevel: p.price_level
                    };
                    pool.push(p);
                }
            });
                if (!nextPageToken) break;
                pageToken = nextPageToken;
                await new Promise(r => setTimeout(r, 2000));
        }
    }

    console.log(`Pool size: ${pool.length}`);

    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const selection = pool.slice(0, TARGET_COUNT);
    console.log(`Selected: ${selection.length}`);

    // Write to Firestore
    for (const rec of selection) {
        await storeSvc.upsertRestaurant(rec);
    }

    console.log('All done.');
    process.exit(0);
})();
