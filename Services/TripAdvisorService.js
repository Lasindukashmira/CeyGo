import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://serpapi.com/search.json';

// Get API key at runtime
const getApiKey = () => {
    const key = process.env.EXPO_PUBLIC_SERP_API_KEY;
    if (!key) {
        console.warn('SERPAPI Key not found. Make sure EXPO_PUBLIC_SERP_API_KEY is set in .env and restart Expo.');
    }
    return key;
};

// Cache keys
const HOTELS_CACHE_KEY = 'cached_google_hotels';
const RESTAURANTS_CACHE_KEY = 'cached_google_restaurants';
const CACHE_EXPIRY_SUFFIX = '_expiry';
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Fetches top hotels from Google Hotels via SERPAPI
 * Uses: engine=google_hotels
 * Response: properties[] with rate_per_night, overall_rating, images, amenities
 */
export const getTopHotels = async (location = 'Sri Lanka', forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh) {
        const cached = await getCachedData(HOTELS_CACHE_KEY);
        if (cached) return cached;
    }

    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            console.log('No API key, using fallback hotels');
            return getFallbackHotels();
        }

        console.log('Fetching hotels from Google Hotels API...');

        // Calculate check-in/out dates (next week)
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 7);
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 2);

        const formatDate = (date) => date.toISOString().split('T')[0];

        const params = {
            engine: 'google_hotels',
            q: location,
            check_in_date: formatDate(checkIn),
            check_out_date: formatDate(checkOut),
            adults: 2,
            currency: 'USD',
            gl: 'us',
            hl: 'en',
            api_key: apiKey,
        };

        console.log('Request params:', JSON.stringify(params, null, 2));

        const response = await axios.get(BASE_URL, { params });

        const data = response.data;

        // DEBUG: Log response structure
        console.log('Google Hotels Response Keys:', Object.keys(data));
        if (data.properties && data.properties.length > 0) {
            console.log('Found', data.properties.length, 'hotels');
        }

        if (data.error) {
            console.error('SERPAPI Error:', data.error);
            return getFallbackHotels();
        }

        const hotels = parseGoogleHotelResults(data);

        if (hotels.length > 0) {
            await setCachedData(HOTELS_CACHE_KEY, hotels);
        }

        return hotels.length > 0 ? hotels : getFallbackHotels();
    } catch (error) {
        console.error('Error fetching hotels:', error.message);
        if (error.response) {
            console.error('Error response:', JSON.stringify(error.response.data, null, 2));
        }
        return getFallbackHotels();
    }
};

/**
 * Fetches top restaurants from Google Maps via SERPAPI
 * Uses: engine=google_maps (Local Results)
 */
export const getTopRestaurants = async (location = 'Sri Lanka', forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh) {
        const cached = await getCachedData(RESTAURANTS_CACHE_KEY);
        if (cached) return cached;
    }

    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            console.log('No API key, using fallback restaurants');
            return getFallbackRestaurants();
        }

        console.log('Fetching restaurants from Google Maps API...');

        const params = {
            engine: 'google_maps',
            q: `restaurants ${location}`,
            ll: '@7.8731,80.7718,8z', // Sri Lanka center coordinates
            hl: 'en',
            api_key: apiKey,
        };

        console.log('Restaurant request params:', JSON.stringify(params, null, 2));

        const response = await axios.get(BASE_URL, { params });

        const data = response.data;

        // DEBUG: Log response structure
        console.log('Google Maps Response Keys:', Object.keys(data));
        if (data.local_results && data.local_results.length > 0) {
            console.log('Found', data.local_results.length, 'restaurants');
        }

        if (data.error) {
            console.error('SERPAPI Error:', data.error);
            return getFallbackRestaurants();
        }

        const restaurants = parseGoogleMapsResults(data);

        if (restaurants.length > 0) {
            await setCachedData(RESTAURANTS_CACHE_KEY, restaurants);
        }

        return restaurants.length > 0 ? restaurants : getFallbackRestaurants();
    } catch (error) {
        console.error('Error fetching restaurants:', error.message);
        if (error.response) {
            console.error('Error response:', JSON.stringify(error.response.data, null, 2));
        }
        return getFallbackRestaurants();
    }
};

/**
 * Parse Google Hotels API response
 * properties[] contains: name, rate_per_night, overall_rating, reviews, images, hotel_class, amenities
 */
const parseGoogleHotelResults = (data) => {
    const properties = data.properties || [];

    console.log(`Parsing ${properties.length} Google Hotel results`);

    return properties.slice(0, 10).map((item, index) => {
        // Extract price - Google Hotels provides rate_per_night.extracted_lowest
        let price = 25000; // Default LKR
        if (item.rate_per_night?.extracted_lowest) {
            price = Math.round(item.rate_per_night.extracted_lowest);
        } else if (item.rate_per_night?.lowest) {
            price = extractPrice(item.rate_per_night.lowest);
        } else if (item.total_rate?.extracted_lowest) {
            price = Math.round(item.total_rate.extracted_lowest / 2); // Divide by nights
        }

        // Get the best image
        let imageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
        if (item.images && item.images.length > 0) {
            imageUrl = item.images[0].original_image || item.images[0].thumbnail || imageUrl;
        }

        // Extract amenities as icon names
        const amenityIcons = mapAmenitiesToIcons(item.amenities || []);

        return {
            id: item.property_token || `hotel_${index}`,
            name: item.name || 'Unknown Hotel',
            location: item.description || location || 'Sri Lanka',
            rating: item.overall_rating || 4.5,
            reviewCount: item.reviews || 0,
            price: price,
            image: imageUrl,
            tags: extractHotelTags(item),
            amenities: amenityIcons,
            type: 'Hotel',
            link: item.link || null,
            hotelClass: item.extracted_hotel_class || null,
            gpsCoordinates: item.gps_coordinates || null,
        };
    });
};

/**
 * Parse Google Maps Local Results for restaurants
 * local_results[] contains: title, rating, reviews, address, price, thumbnail, type
 */
const parseGoogleMapsResults = (data) => {
    const results = data.local_results || [];

    console.log(`Parsing ${results.length} Google Maps restaurant results`);

    return results.slice(0, 10).map((item, index) => {
        // Extract price level ($-$$$$)
        let price = 3500;
        if (item.price) {
            const dollarCount = (item.price.match(/\$/g) || []).length;
            price = dollarCount * 2000 + 1500;
        }

        return {
            id: item.place_id || `restaurant_${index}`,
            name: item.title || 'Unknown Restaurant',
            location: item.address || 'Sri Lanka',
            rating: item.rating || 4.5,
            reviewCount: item.reviews || 0,
            price: price,
            image: item.thumbnail || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
            tags: extractRestaurantTags(item),
            amenities: ['silverware-fork-knife', 'glass-cocktail', 'wifi'],
            type: 'Restaurant',
            cuisine: item.type ? [item.type] : ['Restaurant'],
            link: item.website || null,
            priceLevel: item.price || null,
        };
    });
};

/**
 * Extract price from string
 */
const extractPrice = (priceStr) => {
    if (!priceStr) return null;
    const match = priceStr.replace(/,/g, '').match(/[\d.]+/);
    if (match) {
        return Math.round(parseFloat(match[0]));
    }
    return null;
};

/**
 * Map amenity names to MaterialCommunityIcons names
 */
const mapAmenitiesToIcons = (amenities) => {
    const iconMap = {
        'free wi-fi': 'wifi',
        'wi-fi': 'wifi',
        'wifi': 'wifi',
        'pool': 'pool',
        'swimming pool': 'pool',
        'pools': 'pool',
        'spa': 'spa',
        'restaurant': 'silverware-fork-knife',
        'fitness': 'dumbbell',
        'gym': 'dumbbell',
        'fitness center': 'dumbbell',
        'parking': 'car',
        'free parking': 'car',
        'air conditioning': 'air-conditioner',
        'air-conditioned': 'air-conditioner',
        'breakfast': 'food-croissant',
        'free breakfast': 'food-croissant',
        'bar': 'glass-cocktail',
        'beach': 'beach',
        'beach access': 'beach',
        'airport shuttle': 'bus',
        'shuttle': 'bus',
        'hot tub': 'hot-tub',
        'pet-friendly': 'paw',
        'ev charger': 'ev-station',
    };

    const icons = [];
    const lowerAmenities = amenities.map(a => a.toLowerCase());

    for (const amenity of lowerAmenities) {
        for (const [key, icon] of Object.entries(iconMap)) {
            if (amenity.includes(key) && !icons.includes(icon)) {
                icons.push(icon);
                break;
            }
        }
        if (icons.length >= 4) break;
    }

    // Default icons if none found
    if (icons.length === 0) {
        return ['wifi', 'pool', 'silverware-fork-knife', 'spa'];
    }

    return icons;
};

/**
 * Extract tags for hotels
 */
const extractHotelTags = (item) => {
    const tags = [];
    if (item.extracted_hotel_class) {
        tags.push(`${item.extracted_hotel_class} Star`);
    } else if (item.hotel_class) {
        tags.push(item.hotel_class);
    }
    if (item.eco_certified) tags.push('Eco-certified');
    if (item.type === 'vacation rental') tags.push('Vacation Rental');
    if (item.overall_rating >= 4.5) tags.push('Top Rated');
    return tags.length > 0 ? tags : ['Hotel'];
};

/**
 * Extract tags for restaurants
 */
const extractRestaurantTags = (item) => {
    const tags = [];
    if (item.type) tags.push(item.type);
    if (item.price) tags.push(item.price);
    if (item.rating >= 4.5) tags.push('Popular');
    return tags.length > 0 ? tags : ['Restaurant'];
};

// ============ Cache Helpers ============

const getCachedData = async (key) => {
    try {
        const data = await AsyncStorage.getItem(key);
        const expiry = await AsyncStorage.getItem(key + CACHE_EXPIRY_SUFFIX);

        if (data && expiry && Date.now() < parseInt(expiry)) {
            console.log(`Returning cached ${key}`);
            return JSON.parse(data);
        }
    } catch (error) {
        console.warn('Cache read error:', error);
    }
    return null;
};

const setCachedData = async (key, data) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
        await AsyncStorage.setItem(key + CACHE_EXPIRY_SUFFIX, (Date.now() + CACHE_DURATION).toString());
        console.log(`Cached ${data.length} items to ${key}`);
    } catch (error) {
        console.warn('Cache write error:', error);
    }
};

// ============ Fallback Data ============

const getFallbackHotels = () => [
    {
        id: 'fallback_h1',
        name: 'Cinnamon Grand Colombo',
        location: 'Colombo, Western Province',
        price: 35000,
        rating: 4.8,
        image: 'https://www.cvent.com/venues/_next/image?url=https%3A%2F%2Fimages.cvent.com%2Fcsn%2Fbe1da351-c8fb-4ff4-b26d-1afa3bac6e17%2Fimages%2F55e2456e89cc413aa2ba16cca3123bb3_large!_!93422dbcfd6ff08924b489746fc72ead.jpg&w=3840&q=80',
        tags: ['5 Star', 'Luxury'],
        amenities: ['wifi', 'pool', 'silverware-fork-knife', 'spa'],
        type: 'Hotel',
    },
    {
        id: 'fallback_h2',
        name: 'Heritance Kandalama',
        location: 'Dambulla, Central Province',
        price: 45000,
        rating: 4.9,
        image: 'https://exploresrilanka.lk/wp-content/uploads/2013/11/1-copy2-1.webp',
        tags: ['Eco-certified', 'Nature'],
        amenities: ['wifi', 'pool', 'leaf', 'spa'],
        type: 'Hotel',
    },
    {
        id: 'fallback_h3',
        name: 'Shangri-La Hambantota',
        location: 'Hambantota, Southern Province',
        price: 52000,
        rating: 4.7,
        image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/8f/bc/d4/shangri-la-hambantota.jpg?w=900&h=500&s=1',
        tags: ['5 Star', 'Resort'],
        amenities: ['wifi', 'pool', 'golf', 'beach'],
        type: 'Hotel',
    },
    {
        id: 'fallback_h4',
        name: '98 Acres Resort & Spa',
        location: 'Ella, Uva Province',
        price: 42000,
        rating: 4.9,
        image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/123777522.jpg',
        tags: ['Boutique', 'Top Rated'],
        amenities: ['wifi', 'terrain', 'spa'],
        type: 'Hotel',
    },
    {
        id: 'fallback_h5',
        name: 'Jetwing Lighthouse',
        location: 'Galle, Southern Province',
        price: 38000,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
        tags: ['Beachfront', 'Heritage'],
        amenities: ['wifi', 'pool', 'beach', 'spa'],
        type: 'Hotel',
    },
];

const getFallbackRestaurants = () => [
    {
        id: 'fallback_r1',
        name: 'Ministry of Crab',
        location: 'Colombo Fort, Colombo',
        price: 8000,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
        tags: ['Seafood', '$$$$'],
        amenities: ['silverware-fork-knife', 'glass-cocktail', 'wifi'],
        type: 'Restaurant',
        cuisine: ['Seafood', 'Asian'],
    },
    {
        id: 'fallback_r2',
        name: 'Nuga Gama at Cinnamon Grand',
        location: 'Colombo 3, Western Province',
        price: 4500,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
        tags: ['Sri Lankan', '$$$'],
        amenities: ['silverware-fork-knife', 'leaf', 'wifi'],
        type: 'Restaurant',
        cuisine: ['Sri Lankan', 'Traditional'],
    },
    {
        id: 'fallback_r3',
        name: 'The Gallery Cafe',
        location: 'Colombo 3, Western Province',
        price: 3500,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
        tags: ['Cafe', 'Popular'],
        amenities: ['coffee', 'silverware-fork-knife', 'wifi'],
        type: 'Restaurant',
        cuisine: ['Cafe', 'Western'],
    },
    {
        id: 'fallback_r4',
        name: 'Upali\'s by Nawaloka',
        location: 'Colombo 2, Western Province',
        price: 2500,
        rating: 4.4,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        tags: ['Sri Lankan', '$$'],
        amenities: ['silverware-fork-knife', 'leaf'],
        type: 'Restaurant',
        cuisine: ['Sri Lankan'],
    },
    {
        id: 'fallback_r5',
        name: 'Curry Leaf - Hilton',
        location: 'Colombo 1, Western Province',
        price: 5500,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
        tags: ['Buffet', '$$$'],
        amenities: ['silverware-fork-knife', 'glass-cocktail', 'spa'],
        type: 'Restaurant',
        cuisine: ['Sri Lankan', 'International'],
    },
];

export const clearHotelCache = async () => {
    try {
        await AsyncStorage.removeItem(HOTELS_CACHE_KEY);
        await AsyncStorage.removeItem(HOTELS_CACHE_KEY + CACHE_EXPIRY_SUFFIX);
        await AsyncStorage.removeItem(RESTAURANTS_CACHE_KEY);
        await AsyncStorage.removeItem(RESTAURANTS_CACHE_KEY + CACHE_EXPIRY_SUFFIX);
        console.log('Hotel & Restaurant cache cleared');
    } catch (error) {
        console.warn('Error clearing cache:', error);
    }
};
