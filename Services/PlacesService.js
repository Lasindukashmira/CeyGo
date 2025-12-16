import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    collection, query, orderBy, limit, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp, where, runTransaction, getDoc, startAfter, // Added for pagination
    setDoc,
    deleteDoc
} from "firebase/firestore";
import { db } from '../firebaseConfig';

const CACHE_KEY = 'cached_top_places';
const CACHE_EXPIRY_KEY = 'cached_top_places_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const getTopPlaces = async (forceRefresh = false) => {
    // 1. Check Cache
    try {
        if (!forceRefresh) {
            const cachedData = await AsyncStorage.getItem(CACHE_KEY);
            const expiry = await AsyncStorage.getItem(CACHE_EXPIRY_KEY);

            if (cachedData && expiry && Date.now() < parseInt(expiry)) {
                console.log('Returning cached top places');
                return JSON.parse(cachedData);
            }
        }
    } catch (error) {
        console.warn('Error reading cache:', error);
    }

    // 2. Fetch from Firestore
    try {
        console.log('Fetching top places from Firestore...');
        const placesRef = collection(db, 'places');
        const q = query(placesRef, orderBy('avgRating', 'desc'), limit(10));
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

export const incrementViewCount = async (placeId) => {
    if (!placeId) return;
    try {
        const placeRef = doc(db, "places", placeId);
        await updateDoc(placeRef, {
            Views: increment(1)
        });
        console.log(`Incremented views for place ${placeId}`);
    } catch (error) {
        console.error("Error incrementing view count:", error);
    }
};

// Get single place details
export const getPlaceDetails = async (placeId) => {
    try {
        const placeRef = doc(db, "places", placeId);
        const placeSnap = await getDocs(query(collection(db, "places"), where("__name__", "==", placeId)));
        // OR simpler:
        const snap = await getDoc(placeRef);

        if (snap.exists()) {
            return { id: snap.id, ...snap.data() };
        }
        return null;
    } catch (e) {
        console.error("Error fetching place details:", e);
        return null;
    }
};

// Check if user has review
export const getUserReview = async (placeId, userId) => {
    try {
        const q = query(
            collection(db, "placeReview"),
            where("placeId", "==", placeId),
            where("userId", "==", userId),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        }
        return null;
    } catch (e) {
        console.error("Error fetching user review:", e);
        return null;
    }
};

// Get Top Review for a Place
export const getTopPlaceReview = async (placeId) => {
    try {
        // Optimistic Approach: Try the perfect compound query
        // This requires an index: placeId ASC, rating DESC, createdAt DESC
        const q = query(
            collection(db, "placeReview"),
            where("placeId", "==", placeId),
            orderBy("rating", "desc"),
            orderBy("createdAt", "desc"),
            limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            return await formatReviewData(snapshot.docs[0]);
        }
        return null;
    } catch (e) {
        // Standard error code for missing index is 'failed-precondition'
        if (e.code === 'failed-precondition' || e.message.includes("index")) {
            console.warn("Missing index for top review, falling back to client-side sort.");
            try {
                // FALLBACK: Fetch recent reviews and sort in memory
                // This only needs the standard single-field index on placeId
                const qFallback = query(
                    collection(db, "placeReview"),
                    where("placeId", "==", placeId),
                    limit(50) // Fetch reasonable amount to find a good one
                );
                const snapshot = await getDocs(qFallback);

                if (!snapshot.empty) {
                    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    // Sort by Rating (Desc), then Date (Desc)
                    reviews.sort((a, b) => {
                        if (b.rating !== a.rating) {
                            return b.rating - a.rating; // Highest rating first
                        }
                        // If ratings equal, newest first
                        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                        return dateB - dateA;
                    });

                    return await formatReviewData({ id: reviews[0].id, data: () => reviews[0] });
                }
            } catch (e2) {
                console.error("Fallback query failed:", e2);
            }
        } else {
            console.error("Error fetching top review:", e);
        }
        return null;
    }
};

// Helper to format review and fetch user logic
const formatReviewData = async (docSnapshot) => {
    const reviewData = typeof docSnapshot.data === 'function' ? docSnapshot.data() : docSnapshot;
    const reviewId = docSnapshot.id;

    let username = "Anonymous User";
    if (reviewData.userId) {
        try {
            const userDoc = await getDoc(doc(db, "users", reviewData.userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();

                username = (userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : null) || "Anonymous User";
            }
        } catch (err) {
            console.log("Error fetching user for review:", err);
        }
    }

    return {
        id: reviewId,
        ...reviewData,
        username: username
    };
};

// Add or Update Review with Aggregation
export const addPlaceReview = async (userId, placeId, rating, reviewText) => {
    if (!userId || !placeId || !rating) return { success: false, error: "Missing fields" };

    try {
        const result = await runTransaction(db, async (transaction) => {
            // 1. Get Place Ref and Doc
            const placeRef = doc(db, "places", placeId);
            const placeDoc = await transaction.get(placeRef);

            if (!placeDoc.exists()) {
                throw new Error("Place does not exist!");
            }

            // 2. Check for existing review
            // Note: In transactions, queries must be done before writes? 
            // Actually, for query in transaction we need to pass the transaction to getDocs but client SDK doesn't support query in transaction easily like admin SDK.
            // WORKAROUND: We read the review doc FIRST outside transaction or use a deterministic ID?
            // Using a deterministic ID (userId_placeId) is best for specific lookups, but we are using auto-ID collections.
            // Standard Pattern: Check existence first (optimistic) or limit 1.
            // But reading a query inside transaction requires execution ensures consistency.
            // Client SDK 'transaction.get' expects a DocumentReference. It cannot do queries.
            // CRITICAL: We really should use deterministic IDs for reviews: `placeReviews/${placeId}_${userId}`
            // IF we cant change structure, we have to read the review doc ref *before* transaction? No, that breaks isolation.
            // Let's assume we can't change ID structure easily now without migrating. 
            // We will do a query *first* to find the ID. 
            // If we find it, we use that ID in transaction.get(ref). 
            // If not found, we assume create. 
            // Is this race-condition safe?
            // If user A submits, we query -> null. User A starts entry.
            // User A submits again quickly -> query -> null. User A starts entry.
            // Transaction on placeRef will lock place.
            // But we might create two reviews?
            // "Single Review per User" enforcement: 
            // Ideally, document ID should be `${userId}_${placeId}`. 
            // Since user wants "Add or Update", let's try to find the ID.

            // To ensure safety, let's just query first. The UI prevents double submission mostly.
            // For standard Firestore rules, we'd use robust IDs.
            // Let's query matching review first.
            const q = query(
                collection(db, "placeReview"),
                where("placeId", "==", placeId),
                where("userId", "==", userId),
                limit(1)
            );
            const snapshot = await getDocs(q); // Read outside transaction (safe enough for this app scale)
            const existingReviewDoc = !snapshot.empty ? snapshot.docs[0] : null;
            const existingReviewRef = existingReviewDoc ? existingReviewDoc.ref : doc(collection(db, "placeReview"));

            // 3. Get current Place Data (Inside Transaction - Locks the place)
            const placeData = placeDoc.data();
            // Initialize stats if missing
            const currentStats = placeData.ratingStats || { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
            const currentReviewCount = placeData.reviewCount || 0;

            let newStats = { ...currentStats };
            let newReviewCount = currentReviewCount;

            // 4. Calculate New Stats
            if (existingReviewDoc) {
                // --- UPDATE ---
                // We must READ the review doc inside transaction to ensure we have latest version if getting concurrent updates?
                // But we already have the Ref. Let's get it.
                const reviewSnap = await transaction.get(existingReviewRef);
                if (!reviewSnap.exists()) { throw "Review disappeared"; } // Edge case

                const oldRating = reviewSnap.data().rating;

                // If rating changed, update stats
                if (oldRating !== rating) {
                    newStats[oldRating.toString()] = Math.max(0, (newStats[oldRating.toString()] || 1) - 1);
                    newStats[rating.toString()] = (newStats[rating.toString()] || 0) + 1;
                }

                // Update Review
                transaction.update(existingReviewRef, {
                    rating: rating,
                    reviewText: reviewText,
                    edited: true,
                    updatedAt: serverTimestamp()
                });

            } else {
                // --- CREATE ---
                newStats[rating.toString()] = (newStats[rating.toString()] || 0) + 1;
                newReviewCount += 1;

                transaction.set(existingReviewRef, {
                    userId: userId,
                    placeId: placeId,
                    rating: rating,
                    reviewText: reviewText,
                    edited: false,
                    createdAt: serverTimestamp()
                });
            }

            // 5. Calculate Average
            let totalScore = 0;
            let totalCount = 0;
            for (let i = 1; i <= 5; i++) {
                const count = newStats[i.toString()] || 0;
                totalScore += i * count;
                totalCount += count;
            }
            // Fallback to reviewCount if stats are inconsistent, but prefer calculated total
            // If distinct discrepancy, prefer newReviewCount for count, but calculated for score.
            // Let's just use calculated totalCount to be self-consistent with stats.

            const newAvg = totalCount > 0 ? (totalScore / totalCount) : 0;

            // 6. Update Place
            transaction.update(placeRef, {
                avgRating: parseFloat(newAvg.toFixed(1)),
                reviewCount: totalCount, // Sync with stats count
                ratingStats: newStats,
                rating: parseFloat(newAvg.toFixed(1)) // Update main rating display for PlaceCard
            });

            return {
                success: true,
                action: existingReviewDoc ? 'updated' : 'created',
                newAvg: parseFloat(newAvg.toFixed(1))
            };
        });

        console.log("Review transaction successful:", result);
        return result;

    } catch (e) {
        console.error("Error submitting review transaction: ", e);
        return { success: false, error: e.message };
    }
};
// Get Reviews for a place with pagination
export const getPlaceReviews = async (placeId, lastDoc = null, limitCount = 10) => {
    try {
        let q = query(
            collection(db, "placeReview"),
            where("placeId", "==", placeId),
            orderBy("createdAt", "desc"),
            limit(limitCount)
        );

        if (lastDoc) {
            // Check if we can start after
            // Note: startAfter requires a DocumentSnapshot, not just an ID usually
            // If caller passes snapshot, use it.
            q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);
        const reviews = [];

        for (const docSnap of snapshot.docs) {
            const reviewData = docSnap.data();
            let username = "Anonymous User";
            let userImage = null; // Add user image support if available

            if (reviewData.userId) {
                try {
                    const userDoc = await getDoc(doc(db, "users", reviewData.userId));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        username = userData.fullName ||
                            userData.name ||
                            userData.username ||
                            (userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : null) ||
                            userData.email ||
                            "Anonymous User";
                        // userImage = userData.profilePicture; // If we have profile pics
                    }
                } catch (e) { /* ignore */ }
            }

            reviews.push({
                id: docSnap.id,
                ...reviewData,
                username,
                userImage
            });
        }

        return {
            reviews,
            lastDoc: snapshot.docs[snapshot.docs.length - 1]
        };

    } catch (e) {
        console.error("Error fetching reviews:", e);
        if (e.message.includes("index")) {
            console.warn("Index missing for pagination, falling back to simple query");
            // Fallback simple query
            try {
                const q2 = query(collection(db, "placeReview"), where("placeId", "==", placeId), limit(20));
                const snap2 = await getDocs(q2);
                const reviews = [];
                // ... repeated fetch user logic ...
                for (const docSnap of snap2.docs) {
                    const reviewData = docSnap.data();
                    let username = "Anonymous User";
                    if (reviewData.userId) {
                        try {
                            const userDoc = await getDoc(doc(db, "users", reviewData.userId));
                            if (userDoc.exists()) username = userDoc.data().fullName || "User";
                        } catch (e) { }
                    }
                    reviews.push({ id: docSnap.id, ...reviewData, username });
                }
                return { reviews, lastDoc: null };
            } catch (e2) { }
        }
        return { reviews: [], lastDoc: null };
    }
};

// Get Places with Pagination (for Explore Screen)
export const getPagedPlaces = async (lastDoc = null, limitCount = 10, searchTerm = "") => {
    try {
        let constraints = [
            orderBy("popularity_score", "desc"), // Default sort
            limit(limitCount)
        ];

        if (lastDoc) {
            constraints.push(startAfter(lastDoc));
        }

        const q = query(collection(db, "places"), ...constraints);
        const snapshot = await getDocs(q);

        const places = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            places,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        };
    } catch (e) {
        console.error("Error fetching paged places:", e);
        return { places: [], lastDoc: null };
    }
};

// Search Destinations by Name, Category, or Tags
export const searchDestinations = async (searchTerm) => {
    if (!searchTerm) return [];
    try {
        const term = searchTerm.trim();
        const capitalizedTerm = term.charAt(0).toUpperCase() + term.slice(1);
        const lowerTerm = term.toLowerCase(); // For array checks if stored lowercase

        // 1. Name Prefix Search (Case sensitive in Firestore usually, assumes Title Case data)
        const nameQuery = query(
            collection(db, "places"),
            where("name", ">=", capitalizedTerm),
            where("name", "<=", capitalizedTerm + "\uf8ff"),
            limit(10)
        );

        // 2. Category Search (Array Contains)
        // Try both capitalized and exact term to be safe
        const categoryQuery1 = query(
            collection(db, "places"),
            where("category", "array-contains", capitalizedTerm),
            limit(10)
        );
        const categoryQuery2 = query(
            collection(db, "places"),
            where("categories", "array-contains", capitalizedTerm), // Handle potential field name variance
            limit(10)
        );

        // 3. Tags Search (Array Contains) - assuming 'tags' field
        const tagsQuery = query(
            collection(db, "places"),
            where("tags", "array-contains", lowerTerm),
            limit(10)
        );


        // Execute parallel
        const [nameSnap, catSnap1, catSnap2, tagsSnap] = await Promise.all([
            getDocs(nameQuery),
            getDocs(categoryQuery1),
            getDocs(categoryQuery2),
            getDocs(tagsQuery)
        ]);

        // Merge and Deduplicate
        const resultsMap = new Map();

        const addToMap = (docs) => {
            docs.forEach(doc => {
                if (!resultsMap.has(doc.id)) {
                    resultsMap.set(doc.id, { id: doc.id, ...doc.data() });
                }
            });
        };

        addToMap(nameSnap.docs);
        addToMap(catSnap1.docs);
        addToMap(catSnap2.docs);
        addToMap(tagsSnap.docs);

        return Array.from(resultsMap.values());
    } catch (e) {
        console.error("Error searching destinations:", e);
        return [];
    }
};

// --- Favorites System ---

// Get User Favorites
export const getUserFavorites = async (userId) => {
    try {
        const q = query(collection(db, "placeFavorite"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const placeIds = querySnapshot.docs.map(doc => doc.data().placeId);

        if (placeIds.length === 0) return [];

        const placePromises = placeIds.map(id => getDoc(doc(db, "places", id)));
        const placeSnaps = await Promise.all(placePromises);

        return placeSnaps
            .filter(snap => snap.exists())
            .map(snap => ({ id: snap.id, ...snap.data() }));

    } catch (e) {
        console.error("Error fetching favorites:", e);
        return [];
    }
};

// Check if place is favorited by user
export const checkIsFavorite = async (userId, placeId) => {
    try {
        const docRef = doc(db, "placeFavorite", `${userId}_${placeId}`);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } catch (e) {
        console.error("Error checking favorite:", e);
        return false;
    }
};

// Toggle Favorite (Transaction for Consistency)
export const togglePlaceFavorite = async (userId, placeId, isCurrentlyFavorite) => {
    const favRef = doc(db, "placeFavorite", `${userId}_${placeId}`);
    const placeRef = doc(db, "places", placeId);

    try {
        await runTransaction(db, async (transaction) => {
            const placeDoc = await transaction.get(placeRef);
            if (!placeDoc.exists()) throw "Place does not exist!";

            if (isCurrentlyFavorite) {
                // Remove Favorite
                transaction.delete(favRef);
                transaction.update(placeRef, { favoriteCount: increment(-1) });
            } else {
                // Add Favorite
                transaction.set(favRef, {
                    userId,
                    placeId,
                    createdAt: serverTimestamp()
                });
                transaction.update(placeRef, { favoriteCount: increment(1) });
            }
        });
        return !isCurrentlyFavorite; // Return new state
    } catch (e) {
        console.error("Error toggling favorite:", e);
        throw e;
    }
};
