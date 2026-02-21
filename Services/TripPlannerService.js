/**
 * TripPlannerService.js
 * Orchestrates data fetching from Firestore + external APIs,
 * then calls the AI to generate a structured trip plan.
 */

import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getNearbyHotels, getTopRestaurants } from "./TripAdvisorService";
import { generateWithGemini } from "./GeminiService";
import { districs } from "../constData";

// ==========================================
// 1. Fetch Places from Firestore
// ==========================================
const fetchPlacesByDistrict = async (district) => {
    try {
        console.log(`[TripPlanner] Fetching places for district: ${district}`);

        const placesRef = collection(db, "places");

        // Query by district only — no orderBy to avoid composite index requirement
        const q = query(
            placesRef,
            where("geolocation.district", "==", district),
            limit(20) // Limit to 20 raw, sort and slice to 10 later
        );

        const snapshot = await getDocs(q);
        let places = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log(`[TripPlanner] Found ${places.length} places in ${district}`);

        // If no places found, try broader search without district filter
        if (places.length === 0) {
            console.log(`[TripPlanner] No places in ${district}, trying broader search...`);
            const broaderQ = query(placesRef, limit(30));
            const broaderSnap = await getDocs(broaderQ);
            places = broaderSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
        }

        // Sort by rating client-side and take top 20
        places.sort((a, b) => (b.avgRating || b.rating || 0) - (a.avgRating || a.rating || 0));
        places = places.slice(0, 10); // REDUCED to 10 to avoid 504 Timeout

        // Simplify data for AI (only send what's needed)
        return places.map(a => ({
            name: a.name,
            category: a.category || [],
            rating: a.avgRating || a.rating || 0,
            description: a.description ? a.description.substring(0, 100) : "",
            entryFeeLKR: a.pricing?.priceLKR || 0,
        }));
    } catch (error) {
        console.error("[TripPlanner] Error fetching places:", error);
        return [];
    }
};

// ==========================================
// 2. Fetch Hotels
// ==========================================
const fetchHotelsForDistrict = async (district) => {
    try {
        console.log(`[TripPlanner] Fetching hotels for ${district}...`);
        const hotels = await getNearbyHotels(district, "Sri Lanka", false);

        // Take top 10, simplify for AI
        return hotels.slice(0, 10).map(h => ({
            name: h.name,
            rating: h.rating || 0,
            priceLKR: h.priceLKR || (h.price ? Math.round(h.price * 300) : 0),
            amenities: (h.amenities || []).slice(0, 5),
        }));
    } catch (error) {
        console.error("[TripPlanner] Error fetching hotels:", error);
        return [];
    }
};

// ==========================================
// 3. Fetch Restaurants
// ==========================================
const fetchRestaurantsForDistrict = async (district) => {
    try {
        console.log(`[TripPlanner] Fetching restaurants for ${district}...`);
        const restaurants = await getTopRestaurants(district, false);

        // Take top 10, simplify for AI
        return restaurants.slice(0, 10).map(r => ({
            name: r.name,
            rating: r.rating || 0,
            cuisine: r.type || r.cuisine || "Sri Lankan",
            avgPriceLKR: r.priceLKR || (r.price ? Math.round(r.price * 300) : 0),
        }));
    } catch (error) {
        console.error("[TripPlanner] Error fetching restaurants:", error);
        return [];
    }
};

// ==========================================
// 4. Build AI Prompt (LKR + Multiple Hotels)
// ==========================================
const buildPrompt = (tripData, places, hotels, restaurants) => {
    const destination = tripData.isSurprise ? "a surprise destination in Sri Lanka" : tripData.destination;

    return `You are an expert Sri Lankan travel planner. Create a detailed ${tripData.duration}-day trip itinerary for ${destination}, Sri Lanka.

TRIP DETAILS:
- Destination: ${destination}
- Duration: ${tripData.duration} days
- Start Date: ${tripData.startDate}
- End Date: ${tripData.endDate}
- Travelers: ${tripData.travelers}
- Budget Tier: ${tripData.budget} (Economy = budget-friendly, Standard = mid-range, Luxury = high-end)
- Interests: ${tripData.interests.length > 0 ? tripData.interests.join(", ") : "General sightseeing"}

AVAILABLE PLACES & ATTRACTIONS:
${places.length > 0 ? places.map(a => `- ${a.name} (Rating: ${a.rating}/5, Category: ${a.category.join(", ")}, Entry: Rs.${a.entryFeeLKR})`).join("\n") : "- Use your knowledge of popular places in this area"}

AVAILABLE HOTELS & RESORTS:
${hotels.length > 0 ? hotels.map(h => `- ${h.name} (Rating: ${h.rating}/5, Rs.${h.priceLKR}/night)`).join("\n") : "- Suggest appropriate hotels for the budget tier"}

AVAILABLE RESTAURANTS:
${restaurants.length > 0 ? restaurants.map(r => `- ${r.name} (Rating: ${r.rating}/5, Cuisine: ${r.cuisine}, Avg: Rs.${r.avgPriceLKR}/person)`).join("\n") : "- Suggest appropriate restaurants for the area"}

CRITICAL INSTRUCTIONS:
1. ALL prices MUST be in Sri Lankan Rupees (LKR / Rs.)
2. Use the REAL places, hotels, and restaurants listed above when available
3. Each day must have morning, afternoon, and evening activities
4. Include meal recommendations (breakfast, lunch, dinner) from the restaurants listed
5. For hotels: suggest 3 different hotel options from the list above (budget, mid-range, premium) so the user can choose. Pick one as the "recommended" option matching their budget tier
6. Estimate costs in LKR for everything
7. Budget breakdown must be in LKR
8. Make the plan realistic with proper time management
9. For "${tripData.budget}" budget: ${tripData.budget === "Economy" ? "focus on affordable options, street food, budget stays under Rs.5,000/night" : tripData.budget === "Luxury" ? "focus on premium experiences, fine dining, luxury hotels Rs.25,000+/night" : "balance comfort and value, hotels Rs.8,000-20,000/night"}

Return ONLY valid JSON in this exact format:
{
  "tripTitle": "A catchy title for the trip",
  "summary": "A 2-3 sentence summary of what this trip offers",
  "destination": "${destination}",
  "duration": ${tripData.duration},
  "travelers": "${tripData.travelers}",
  "budgetTier": "${tripData.budget}",
  "hotelOptions": [
    { "name": "Budget Hotel Name", "priceLKR": 0, "rating": 0, "tier": "Budget", "recommended": false },
    { "name": "Mid-range Hotel Name", "priceLKR": 0, "rating": 0, "tier": "Standard", "recommended": true },
    { "name": "Premium Hotel Name", "priceLKR": 0, "rating": 0, "tier": "Luxury", "recommended": false }
  ],
  "dailyPlan": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "A theme for the day like 'Cultural Exploration'",
      "morning": {
        "time": "8:00 AM - 12:00 PM",
        "activity": "Activity description",
        "place": "Place name",
        "tips": "Practical tip",
        "estimatedCostLKR": 0
      },
      "afternoon": {
        "time": "12:00 PM - 5:00 PM",
        "activity": "Activity description",
        "place": "Place name",
        "tips": "Practical tip",
        "estimatedCostLKR": 0
      },
      "evening": {
        "time": "5:00 PM - 9:00 PM",
        "activity": "Activity description",
        "place": "Place name",
        "tips": "Practical tip",
        "estimatedCostLKR": 0
      },
      "meals": {
        "breakfast": { "restaurant": "Name", "cuisine": "Type", "estimatedCostLKR": 0 },
        "lunch": { "restaurant": "Name", "cuisine": "Type", "estimatedCostLKR": 0 },
        "dinner": { "restaurant": "Name", "cuisine": "Type", "estimatedCostLKR": 0 }
      },
      "transport": "Transport info for the day"
    }
  ],
  "budget": {
    "accommodation": 0,
    "food": 0,
    "transport": 0,
    "activities": 0,
    "miscellaneous": 0,
    "total": 0,
    "currency": "LKR",
    "perPersonPerDay": 0
  },
  "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"],
  "packingList": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]
}`;
};

// ==========================================
// 5. Main Generate Function
// ==========================================
export const generateTripPlan = async (tripData) => {
    console.log("[TripPlanner] Starting trip plan generation...");

    const destination = tripData.isSurprise
        ? pickRandomDistrict()
        : tripData.destination;

    const resolvedTripData = { ...tripData, destination };

    // Fetch all data in parallel — ONE batch of fetches
    const [places, hotels, restaurants] = await Promise.all([
        fetchPlacesByDistrict(destination),
        fetchHotelsForDistrict(destination),
        fetchRestaurantsForDistrict(destination),
    ]);

    console.log(`[TripPlanner] Data collected: ${places.length} places, ${hotels.length} hotels, ${restaurants.length} restaurants`);

    // Build prompt and send ONE request to AI
    const prompt = buildPrompt(resolvedTripData, places, hotels, restaurants);
    console.log("[TripPlanner] Sending ONE request to AI...");

    const plan = await generateWithGemini(prompt);

    console.log("[TripPlanner] Plan generated successfully!");

    // Attach metadata
    return {
        ...plan,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        rawTripData: resolvedTripData,
        image: getDestinationImage(destination),
    };
};

// ==========================================
// Helpers
// ==========================================
const pickRandomDistrict = () => {
    const popularDistricts = ["Kandy", "Galle", "Colombo", "Nuwara Eliya", "Ella", "Sigiriya", "Trincomalee", "Jaffna"];
    return popularDistricts[Math.floor(Math.random() * popularDistricts.length)];
};

const getDestinationImage = (destination) => {
    const district = districs.find(d => d.name === destination);
    if (district && district.image) {
        return district.image;
    }
    const fallbackImages = {
        "Kandy": "https://images.unsplash.com/photo-1586619782390-50d4d8fc38b3?w=800",
        "Galle": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        "Colombo": "https://images.unsplash.com/photo-1580746738099-75d2f4a8d79c?w=800",
        "Nuwara Eliya": "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=800",
    };
    return fallbackImages[destination] || "https://images.unsplash.com/photo-1546708773-e578c7bd5f68?w=800";
};
