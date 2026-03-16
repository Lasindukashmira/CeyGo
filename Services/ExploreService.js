import { collection, query, where, getDocs, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getNearbyHotels, getTopRestaurants } from './TripAdvisorService';

export const getUnifiedServices = async (type, options = {}) => {
    const {
        district = '',
        searchQuery = '',
        filters = {},
        limitCount = 10,
        isLoadMore = false,
        lastDoc = null,
        apiOffset = 0,
        userPreferences = []
    } = options;

    try {
        console.log(`[ExploreService] Fetching ${type}s... district=${district}, search=${searchQuery}, loadMore=${isLoadMore}, offset=${apiOffset}`);

        // 1. Fetch from Firestore (CeyGo Providers)
        const firestoreQuery = buildFirestoreQuery(type, { district, searchQuery, filters, limitCount, isLoadMore, lastDoc, userPreferences });
        const firestoreSnapshot = await getDocs(firestoreQuery);
        
        const firestoreResults = firestoreSnapshot.docs.map(doc => ({
            id: doc.id,
            source: 'ceygo',
            ...doc.data()
        }));

        let nextLastDoc = firestoreSnapshot.docs.length > 0 
            ? firestoreSnapshot.docs[firestoreSnapshot.docs.length - 1] 
            : lastDoc;

        // 2. Fetch from External API (API results pagination)
        let apiResults = [];
        let hasMoreApi = false;
        let nextApiOffset = apiOffset;

        if (type === 'hotel' || type === 'restaurant') {
            let allApiResults = [];
            if (type === 'hotel') {
                allApiResults = await getNearbyHotels(district || 'Sri Lanka', district, false);
            } else {
                allApiResults = await getTopRestaurants(district || 'Sri Lanka', false);
            }

            // Format API results to match CeyGo structure loosely
            const formattedApiResults = allApiResults.map(item => ({
                id: item.id || item.property_token,
                property_token: item.property_token,
                serpapi_link: item.serpapi_link,
                source: 'api',
                name: item.name,
                image: item.image,
                rating: item.rating,
                reviewCount: item.reviewCount,
                location: {
                    address: item.location,
                    district: district
                },
                pricing: {
                    priceLKR: item.priceLKR || (item.price ? Math.round(item.price * 300) : null),
                    basePrice: item.price
                },
                type: type,
                amenities: item.amenities || [],
                tags: item.tags || []
            }));

            // Filter API results that might already be in Firestore (by name check as fallback)
            const firestoreNames = new Set(firestoreResults.map(r => r.name.toLowerCase()));
            const uniqueApiResults = formattedApiResults.filter(r => !firestoreNames.has(r.name.toLowerCase()));

            // Calculate how many to pull from API based on limitCount minus fetched firestore count
            const neededFromApi = Math.max(0, limitCount - firestoreResults.length);
            
            // Slice the necessary API offset buffer
            apiResults = uniqueApiResults.slice(apiOffset, apiOffset + neededFromApi);
            nextApiOffset = apiOffset + apiResults.length;
            hasMoreApi = nextApiOffset < uniqueApiResults.length;
        }

        // 3. Merge and deduplicate
        const combinedResults = [...firestoreResults, ...apiResults];

        return {
            results: combinedResults,
            hasMore: firestoreSnapshot.docs.length === limitCount || (type !== 'tour' && hasMoreApi),
            lastDoc: nextLastDoc,
            apiOffset: nextApiOffset
        };

    } catch (error) {
        console.error(`[ExploreService] Error fetching unified ${type}s:`, error);
        return { results: [], hasMore: false, lastDoc: null, apiOffset: 0 };
    }
};

/**
 * Builds a Firestore query with filters
 */
const buildFirestoreQuery = (type, { district, searchQuery, filters, limitCount, isLoadMore, lastDoc, userPreferences }) => {
    let q = collection(db, 'services');
    let constraints = [where('type', '==', type), where('status', '==', 'active')];

    if (district) {
        constraints.push(where('location.district', '==', district));
    }
    
    // REMOVED non-existent 'tags' query logic that was causing 0 results
    
    if (filters.minPrice) {
        constraints.push(where('pricing.priceLKR', '>=', filters.minPrice));
    }
    
    if (filters.maxPrice) {
        constraints.push(where('pricing.priceLKR', '<=', filters.maxPrice));
    }

    if (filters.minRating) {
        constraints.push(where('avgRating', '>=', filters.minRating));
    }

    constraints.push(limit(limitCount));

    if (isLoadMore && lastDoc) {
        constraints.push(startAfter(lastDoc));
    }

    return query(q, ...constraints);
};
