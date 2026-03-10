/**
 * ARWallService.js
 * Handles Firestore CRUD for AR Community Walls and messages.
 * Also manages AR stamps collection for users.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    increment,
    query,
    orderBy,
    limit,
    serverTimestamp,
    where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// =============================================
// 1. Wall Operations
// =============================================

/**
 * Fetch all AR-enabled places from the 'places' collection
 * that have geolocation data (latitude & longitude).
 */
export const fetchARPlaces = async () => {
    try {
        const placesRef = collection(db, "places");
        const snapshot = await getDocs(placesRef);

        const places = snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter(
                (p) =>
                    p.geolocation &&
                    p.geolocation.latitude &&
                    p.geolocation.longitude
            );

        return places;
    } catch (error) {
        console.error("[ARWallService] Error fetching AR places:", error);
        return [];
    }
};

/**
 * Ensure a wall document exists for a place.
 * Creates one if it doesn't exist yet.
 */
export const ensureWallExists = async (place) => {
    try {
        const wallRef = doc(db, "ar_walls", place.id);
        const wallSnap = await getDoc(wallRef);

        if (!wallSnap.exists()) {
            await setDoc(wallRef, {
                placeId: place.id,
                placeName: place.name,
                wallLocation: {
                    latitude: place.geolocation.latitude,
                    longitude: place.geolocation.longitude,
                },
                totalMessages: 0,
                lastActivity: serverTimestamp(),
            });
        }

        return wallRef;
    } catch (error) {
        console.error("[ARWallService] Error ensuring wall:", error);
        throw error;
    }
};

// =============================================
// 2. Message Operations
// =============================================

/**
 * Fetch messages for a specific wall, ordered by creation time.
 * @param {string} placeId - The place/wall ID
 * @param {number} maxMessages - Max messages to fetch (default 50)
 */
export const fetchWallMessages = async (placeId, maxMessages = 50) => {
    try {
        const messagesRef = collection(db, "ar_walls", placeId, "messages");
        const q = query(
            messagesRef,
            orderBy("createdAt", "desc"),
            limit(maxMessages)
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate?.() || new Date(),
        }));
    } catch (error) {
        console.error("[ARWallService] Error fetching messages:", error);
        return [];
    }
};

/**
 * Post a new message to a wall.
 * Also increments the wall's totalMessages counter.
 */
export const postWallMessage = async (placeId, message) => {
    try {
        // Ensure wall exists
        const wallRef = doc(db, "ar_walls", placeId);

        // Add message to subcollection
        const messagesRef = collection(db, "ar_walls", placeId, "messages");
        const newMsg = await addDoc(messagesRef, {
            ...message,
            createdAt: serverTimestamp(),
        });

        // Update wall metadata
        await updateDoc(wallRef, {
            totalMessages: increment(1),
            lastActivity: serverTimestamp(),
        });

        return newMsg.id;
    } catch (error) {
        console.error("[ARWallService] Error posting message:", error);
        throw error;
    }
};

// =============================================
// 3. Stamps / Collection Operations
// =============================================

/**
 * Check if a user has already collected a stamp for a place.
 */
export const hasStamp = async (userId, placeId) => {
    try {
        const stampRef = doc(db, "users", userId, "ar_stamps", placeId);
        const stampSnap = await getDoc(stampRef);
        return stampSnap.exists();
    } catch (error) {
        console.error("[ARWallService] Error checking stamp:", error);
        return false;
    }
};

/**
 * Collect a stamp for a place.
 */
export const collectStamp = async (userId, place) => {
    try {
        const stampRef = doc(db, "users", userId, "ar_stamps", place.id);
        await setDoc(stampRef, {
            placeId: place.id,
            placeName: place.name,
            category: place.category?.[0] || "General",
            collectedAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error("[ARWallService] Error collecting stamp:", error);
        return false;
    }
};

/**
 * Get all stamps collected by a user.
 */
export const getUserStamps = async (userId) => {
    try {
        const stampsRef = collection(db, "users", userId, "ar_stamps");
        const snapshot = await getDocs(stampsRef);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            collectedAt: d.data().collectedAt?.toDate?.() || new Date(),
        }));
    } catch (error) {
        console.error("[ARWallService] Error fetching stamps:", error);
        return [];
    }
};

// =============================================
// 4. Utility — Distance Calculation
// =============================================

/**
 * Calculate distance between two coordinates using Haversine formula.
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Calculate bearing (compass direction) from point 1 to point 2.
 * @returns {number} Bearing in degrees (0-360)
 */
export const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
    const x =
        Math.cos((lat1 * Math.PI) / 180) *
        Math.sin((lat2 * Math.PI) / 180) -
        Math.sin((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.cos(dLon);
    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
};

/**
 * Format distance for display
 */
export const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
};

// =============================================
// 5. Dev/Test — Create a wall at current location
// =============================================

/**
 * Creates a test AR wall at the given coordinates.
 * This writes a place doc + wall doc so the AR tab picks it up.
 * @param {number} latitude
 * @param {number} longitude
 */
export const createTestWallAtLocation = async (latitude, longitude) => {
    try {
        const testId = "test_wall_" + Date.now();

        // 1. Create a place document so fetchARPlaces finds it
        const placeRef = doc(db, "places", testId);
        await setDoc(placeRef, {
            name: "📍 My Test Wall",
            description: "A test AR community wall placed at your current location for testing.",
            geolocation: {
                latitude,
                longitude,
                district: "Test District",
                province: "Test Province",
                address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            },
            category: ["AR Test"],
            rating: 5.0,
            image_urls: [
                "https://images.unsplash.com/photo-1614107151491-6876eecbff89?w=400",
            ],
            popularity_score: 10,
            isTestWall: true,
        });

        // 2. Create the corresponding wall document
        const wallRef = doc(db, "ar_walls", testId);
        await setDoc(wallRef, {
            placeId: testId,
            placeName: "📍 My Test Wall",
            wallLocation: { latitude, longitude },
            totalMessages: 0,
            lastActivity: serverTimestamp(),
        });

        console.log("[ARWallService] Test wall created at:", latitude, longitude);
        return testId;
    } catch (error) {
        console.error("[ARWallService] Error creating test wall:", error);
        throw error;
    }
};
