import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const CACHE_KEY = 'cached_top_places';
const CACHE_EXPIRY_KEY = 'cached_top_places_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const getTopPlaces = async () => {
    // 1. Check Cache
    try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        const expiry = await AsyncStorage.getItem(CACHE_EXPIRY_KEY);

        if (cachedData && expiry && Date.now() < parseInt(expiry)) {
            console.log('Returning cached top places');
            return JSON.parse(cachedData);
        }
    } catch (error) {
        console.warn('Error reading cache:', error);
    }

    // 2. Fetch from Firestore
    try {
        console.log('Fetching top places from Firestore...');
        const placesRef = collection(db, 'places');
        const q = query(placesRef, orderBy('popularity_score', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);

        const places = [];
        querySnapshot.forEach((doc) => {
            places.push({ id: doc.id, ...doc.data() });
        });

        // 3. Save to Cache (if we got data)
        if (places.length > 0) {
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(places));
            await AsyncStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
            console.log(`Cached ${places.length} places locally.`);
        }

        return places;
    } catch (error) {
        console.error('Error fetching top places from Firestore:', error);

        // Fallback: Try to return expired cache if fetch failed (better than nothing)
        try {
            const cachedData = await AsyncStorage.getItem(CACHE_KEY);
            if (cachedData) {
                console.log('Returning expired cache due to fetch error');
                return JSON.parse(cachedData);
            }
        } catch (e) { /* ignore */ }

        return []; // Return empty if absolutely nothing matches
    }
};

export const clearPlacesCache = async () => {
    try {
        await AsyncStorage.removeItem(CACHE_KEY);
        await AsyncStorage.removeItem(CACHE_EXPIRY_KEY);
        console.log('Places cache cleared');
    } catch (error) {
        console.warn('Error clearing cache:', error);
    }
};
