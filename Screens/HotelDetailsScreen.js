import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    Image,
    StatusBar,
    Linking,
    Share,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { getHotelDetails } from "../Services/TripAdvisorService";

const { width, height } = Dimensions.get("window");

// Dummy data matching API response structure
const DUMMY_HOTEL = {
    name: "Hilton Colombo",
    description: "This sprawling, upscale resort on the beautiful coast is 3 km from Galle Face Beach and 15 km from city attractions. Posh rooms offer Wi-Fi, minibars and flat-screen TVs, plus tea and coffeemaking facilities and balconies with ocean or garden views. Suites add executive lounge access; some have kitchens. Villas have private pools, gazebos and living areas. Room service is available. Amenities include multiple dining options, beach access and an outdoor pool, plus a gym, a spa, indoor/outdoor events spaces, tennis courts and an amphitheater.",
    address: "2 Sir Chittampalam A Gardiner Mawatha, Colombo 02, Sri Lanka",
    phone: "+94 11 249 2492",
    phone_link: "tel:+94112492492",
    link: "https://www.hilton.com",
    gps_coordinates: {
        latitude: 6.9344,
        longitude: 79.8428,
    },
    check_in_time: "3:00 PM",
    check_out_time: "12:00 PM",
    rate_per_night: {
        lowest: "$180",
        extracted_lowest: 180,
        before_taxes_fees: "$150",
        extracted_before_taxes_fees: 150,
    },
    hotel_class: "5-star hotel",
    extracted_hotel_class: 5,
    overall_rating: 4.6,
    reviews: 8123,
    ratings: [
        { stars: 5, count: 6309 },
        { stars: 4, count: 1153 },
        { stars: 3, count: 322 },
        { stars: 2, count: 97 },
        { stars: 1, count: 242 },
    ],
    reviews_breakdown: [
        { name: "Pool", positive: 405, negative: 24, total_mentioned: 444 },
        { name: "Service", positive: 890, negative: 45, total_mentioned: 980 },
        { name: "Location", positive: 650, negative: 30, total_mentioned: 720 },
        { name: "Rooms", positive: 780, negative: 60, total_mentioned: 890 },
    ],
    amenities: [
        "Free Wi-Fi",
        "Swimming Pool",
        "Spa & Wellness",
        "Fitness Center",
        "Restaurant",
        "Room Service",
        "Airport Shuttle",
        "Business Center",
        "Concierge",
        "Laundry Service",
        "Bar/Lounge",
        "Free Parking",
    ],
    images: [
        { original_image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/123777522.jpg" },
        { original_image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
        { original_image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800" },
        { original_image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800" },
    ],
    prices: [
        {
            source: "Hilton Official",
            logo: "https://www.gstatic.com/travel-hotels/branding/75ce5d87-7090-4e37-a9b2-57848aa21d9f.png",
            official: true,
            rate_per_night: { lowest: "$180", extracted_lowest: 180 },
        },
        {
            source: "Booking.com",
            logo: "https://www.gstatic.com/travel-hotels/branding/ac238c97-1652-4830-8da8-bb8d8883af88.png",
            rate_per_night: { lowest: "$195", extracted_lowest: 195 },
        },
        {
            source: "Hotels.com",
            logo: "https://www.gstatic.com/travel-hotels/branding/f358dd45-ebd1-4af8-988d-d53154b73975.png",
            rate_per_night: { lowest: "$192", extracted_lowest: 192 },
        },
    ],
    nearby_places: [
        {
            name: "Galle Face Green",
            category: "Landmark",
            rating: 4.5,
            transportations: [{ type: "Walk", duration: "5 min" }],
        },
        {
            name: "Gangaramaya Temple",
            category: "Temple",
            rating: 4.7,
            transportations: [{ type: "Taxi", duration: "10 min" }],
        },
        {
            name: "National Museum",
            category: "Museum",
            rating: 4.3,
            transportations: [{ type: "Taxi", duration: "15 min" }],
        },
    ],
    eco_certified: true,
};

const HotelDetailsScreen = ({ route, navigation }) => {
    // Use passed hotel data or fall back to dummy data
    const hotelData = route.params?.hotel || {};
    const [hotel, setHotel] = useState({ ...DUMMY_HOTEL, ...hotelData });
    const [loading, setLoading] = useState(false);

    const [isFavorite, setIsFavorite] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const imageScrollRef = useRef(null);
    const mapRef = useRef(null);

    // Fetch deep details if property_token or serpapi_link is present
    useEffect(() => {
        const fetchDeepDetails = async () => {
            if (hotelData.property_token || hotelData.serpapi_link) {
                setLoading(true);
                const deepDetails = await getHotelDetails(hotelData.property_token, hotelData.serpapi_link);
                if (deepDetails) {
                    // Map SERPAPI response to our hotel object structure
                    const enrichedHotel = {
                        ...hotel,
                        ...deepDetails,
                        images: deepDetails.images || deepDetails.photos || hotel.images,
                        amenities: deepDetails.amenities || hotel.amenities,
                        overall_rating: deepDetails.overall_rating || hotel.overall_rating,
                        reviews: deepDetails.reviews || hotel.reviews,
                        description: deepDetails.description || hotel.description,
                        check_in_time: deepDetails.check_in_time || hotel.check_in_time,
                        check_out_time: deepDetails.check_out_time || hotel.check_out_time,
                        nearby_places: deepDetails.nearby_places || hotel.nearby_places,
                        gps_coordinates: deepDetails.gps_coordinates || hotel.gps_coordinates,
                    };
                    setHotel(enrichedHotel);
                }
                setLoading(false);
            }
        };

        fetchDeepDetails();
    }, [hotelData.property_token]);

    // Animation: Start Zoomed IN, then Zoom OUT (Map)
    useEffect(() => {
        if (mapRef.current && hotel.gps_coordinates) {
            const targetRegion = {
                latitude: hotel.gps_coordinates.latitude,
                longitude: hotel.gps_coordinates.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };

            const timer = setTimeout(() => {
                mapRef.current.animateToRegion(targetRegion, 2000);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [hotel.gps_coordinates, loading]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${hotel.name} on CeyGo!\n\nLocation: ${hotel.address || hotel.location}\nRating: ${hotel.overall_rating || hotel.rating} ⭐\nPrice: ${hotel.rate_per_night?.lowest || `$ ${hotel.price?.toLocaleString()}`} per night`,
                title: hotel.name,
            });
        } catch (error) {
            console.log("Error sharing:", error);
        }
    };

    const handleBookNow = (source) => {
        Alert.alert(
            "Book Hotel",
            `Would you like to book ${hotel.name}${source ? ` via ${source}` : ""}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Proceed", onPress: () => console.log("Booking...") },
            ]
        );
    };

    const handleCall = () => {
        if (hotel.phone_link) {
            Linking.openURL(hotel.phone_link);
        } else {
            Linking.openURL("tel:+94112345678");
        }
    };

    const handleOpenMap = async () => {
        if (hotel.gps_coordinates) {
            const { latitude, longitude } = hotel.gps_coordinates;
            const url = Platform.select({
                ios: `maps:0,0?q=${latitude},${longitude}`,
                android: `geo:0,0?q=${latitude},${longitude}(${hotel.name})`,
            });
            try {
                await Linking.openURL(url);
            } catch (error) {
                const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                await Linking.openURL(webUrl);
            }
        } else {
            const query = encodeURIComponent(hotel.name + " " + (hotel.address || hotel.location));
            const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
            await Linking.openURL(webUrl);
        }
    };

    const handleVisitWebsite = () => {
        if (hotel.link) {
            Linking.openURL(hotel.link);
        }
    };

    // Get amenity icon
    const getAmenityIcon = (amenity) => {
        const amenityLower = amenity.toLowerCase();
        if (amenityLower.includes("wi-fi") || amenityLower.includes("wifi")) return "wifi";
        if (amenityLower.includes("pool")) return "pool";
        if (amenityLower.includes("spa") || amenityLower.includes("wellness")) return "spa";
        if (amenityLower.includes("gym") || amenityLower.includes("fitness")) return "dumbbell";
        if (amenityLower.includes("restaurant") || amenityLower.includes("dining")) return "silverware-fork-knife";
        if (amenityLower.includes("room service")) return "room-service";
        if (amenityLower.includes("shuttle") || amenityLower.includes("airport")) return "airplane";
        if (amenityLower.includes("business")) return "briefcase";
        if (amenityLower.includes("concierge")) return "account-tie";
        if (amenityLower.includes("laundry")) return "washing-machine";
        if (amenityLower.includes("bar") || amenityLower.includes("lounge")) return "glass-cocktail";
        if (amenityLower.includes("parking")) return "car";
        if (amenityLower.includes("breakfast")) return "coffee";
        return "check-circle";
    };

    // Calculate rating percentage for breakdown
    const getTotalRatings = () => {
        return hotel.ratings?.reduce((sum, r) => sum + r.count, 0) || 1;
    };

    const getRatingPercentage = (count) => {
        return ((count / getTotalRatings()) * 100).toFixed(0);
    };

    // Get images array
    const images = hotel.images?.length > 0
        ? hotel.images.map(img => img.original_image || img.thumbnail || img)
        : hotel.image
            ? [hotel.image]
            : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={true}>
                {/* Image Gallery Section */}
                <View style={styles.imageGalleryContainer}>
                    <FlatList
                        ref={imageScrollRef}
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setActiveImageIndex(index);
                        }}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item }} style={styles.galleryImage} resizeMode="cover" />
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                    <LinearGradient
                        colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.6)"]}
                        locations={[0, 0.3, 1]}
                        style={styles.galleryGradient}
                    />

                    {/* Image Indicators */}
                    <View style={styles.imageIndicators}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[styles.indicator, activeImageIndex === index && styles.activeIndicator]}
                            />
                        ))}
                    </View>

                    {/* Header Buttons */}
                    <SafeAreaView style={styles.headerButtons}>
                        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
                                <MaterialIcons name="share" size={22} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerBtn} onPress={() => setIsFavorite(!isFavorite)}>
                                <MaterialCommunityIcons
                                    name={isFavorite ? "heart" : "heart-outline"}
                                    size={24}
                                    color={isFavorite ? "#e53935" : "#fff"}
                                />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    {/* Premium Labels Over Image */}
                    <View style={styles.premiumLabelsContainer}>
                        {loading ? (
                            <View style={[styles.premiumBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={[styles.premiumBadgeText, { marginLeft: 6 }]}>Loading details...</Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.premiumBadge}>
                                    <MaterialCommunityIcons name="star-circle" size={16} color="#FFD700" />
                                    <Text style={styles.premiumBadgeText}>{hotel.hotel_class || "5-star hotel"}</Text>
                                </View>
                                {hotel.eco_certified && (
                                    <View style={[styles.premiumBadge, styles.ecoPremiumBadge]}>
                                        <MaterialCommunityIcons name="leaf" size={18} color="#4CAF50" />
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>


                {/* Content Section */}
                <View style={styles.content}>
                    {/* Header Section (Title, Location, Badges) */}
                    <View style={styles.headerSection}>
                        <View style={styles.headerRow}>
                            <Text style={styles.hotelTitle}>{hotel.name}</Text>
                        </View>

                        <View style={styles.locationRow}>
                            <MaterialIcons name="location-on" size={16} color="#666" />
                            <Text style={styles.locationText}>{hotel.address || hotel.location}</Text>
                        </View>
                    </View>

                    {/* Rating & Price Card */}
                    {/* Premium Stats Row */}
                    <View style={styles.statsRow}>
                        {/* Rating Column */}
                        <View style={styles.statItem}>
                            <View style={styles.ratingBadge}>
                                <Text style={styles.ratingValueText}>{hotel.overall_rating || hotel.rating}</Text>
                                <MaterialIcons name="star" size={14} color="#fff" />
                            </View>
                            <Text style={styles.statLabel}>
                                {(hotel.reviews || hotel.reviewCount || 0) > 1000
                                    ? ((hotel.reviews || hotel.reviewCount || 0) / 1000).toFixed(1) + 'k'
                                    : (hotel.reviews || hotel.reviewCount || 0)} Reviews
                            </Text>
                        </View>

                        <View style={styles.statDivider} />

                        {/* Hotel Class Column */}
                        <View style={styles.statItem}>
                            <View style={styles.starRow}>
                                {[...Array(Math.min(5, Math.floor(hotel.extracted_hotel_class || 5)))].map((_, i) => (
                                    <MaterialIcons key={i} name="star" size={16} color="#FFD700" />
                                ))}
                            </View>
                            <Text style={styles.statLabel}>{hotel.hotel_class || "5-star Hotel"}</Text>
                        </View>

                        <View style={styles.statDivider} />

                        {/* Price Column */}
                        <View style={styles.statItem}>
                            <Text style={styles.priceValueText}>
                                {hotel.priceLKR
                                    ? `Rs. ${hotel.priceLKR.toLocaleString()}`
                                    : (hotel.rate_per_night?.lowest || (hotel.price ? `$ ${hotel.price?.toLocaleString()}` : "Price on request"))}
                            </Text>
                            <Text style={styles.statLabel}>{hotel.price || hotel.rate_per_night?.lowest ? "per night" : "Availability"}</Text>
                        </View>
                    </View>

                    {/* Divider Line */}
                    <View style={styles.sectionDivider} />

                    {/* About */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="information" size={22} color="#2c5aa0" />
                            <Text style={styles.sectionTitle}>About</Text>
                        </View>
                        <View style={styles.aboutCard}>
                            <Text style={styles.aboutText}>{hotel.description}</Text>
                        </View>
                    </View>

                    {/* Amenities */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="room-service" size={22} color="#2c5aa0" />
                            <Text style={styles.sectionTitle}>Amenities</Text>
                        </View>
                        <View style={styles.amenitiesGrid}>
                            {(hotel.amenities || []).slice(0, 12).map((amenity, index) => (
                                <View key={index} style={styles.amenityChip}>
                                    <MaterialCommunityIcons
                                        name={getAmenityIcon(amenity)}
                                        size={16}
                                        color="#2c5aa0"
                                    />
                                    <Text style={styles.amenityChipText}>{amenity}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Price Comparison */}
                    {hotel.prices && hotel.prices.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="compare-arrows" size={22} color="#2c5aa0" />
                                <Text style={styles.sectionTitle}>Compare Prices</Text>
                            </View>
                            <View style={styles.pricesCard}>
                                {hotel.prices.map((price, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.priceRow, price.official && styles.officialPriceRow]}
                                        onPress={() => handleBookNow(price.source)}
                                    >
                                        <View style={styles.priceSourceInfo}>
                                            {price.logo && (
                                                <Image source={{ uri: price.logo }} style={styles.priceLogo} />
                                            )}
                                            <View>
                                                <Text style={styles.priceSourceName}>{price.source}</Text>
                                                {price.official && (
                                                    <Text style={styles.officialLabel}>Official Site</Text>
                                                )}
                                            </View>
                                        </View>
                                        <View style={styles.priceAmount}>
                                            <Text style={styles.priceSourceValue}>
                                                {price.priceLKR ? `Rs. ${price.priceLKR.toLocaleString()}` : price.rate_per_night?.lowest}
                                            </Text>
                                            <Text style={styles.priceSourceUnit}>/night</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Quick Info */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="clock-outline" size={22} color="#2c5aa0" />
                            <Text style={styles.sectionTitle}>Quick Info</Text>
                        </View>
                        <View style={styles.quickInfoCard}>
                            <View style={styles.quickInfoRow}>
                                <View style={styles.quickInfoItem}>
                                    <MaterialCommunityIcons name="clock-check" size={24} color="#4CAF50" />
                                    <View>
                                        <Text style={styles.quickInfoLabel}>Check-in</Text>
                                        <Text style={styles.quickInfoValue}>{hotel.check_in_time || "3:00 PM"}</Text>
                                    </View>
                                </View>
                                <View style={styles.quickInfoDivider} />
                                <View style={styles.quickInfoItem}>
                                    <MaterialCommunityIcons name="clock-remove" size={24} color="#FF9800" />
                                    <View>
                                        <Text style={styles.quickInfoLabel}>Check-out</Text>
                                        <Text style={styles.quickInfoValue}>{hotel.check_out_time || "12:00 PM"}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Rating Breakdown */}
                    {hotel.ratings && hotel.ratings.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="star-half" size={22} color="#2c5aa0" />
                                <Text style={styles.sectionTitle}>Rating Breakdown</Text>
                            </View>
                            <View style={styles.ratingBreakdownCard}>
                                {hotel.ratings.map((rating, index) => (
                                    <View key={index} style={styles.ratingRow}>
                                        <Text style={styles.ratingStarLabel}>{rating.stars} ★</Text>
                                        <View style={styles.ratingBarContainer}>
                                            <View
                                                style={[
                                                    styles.ratingBar,
                                                    { width: `${getRatingPercentage(rating.count)}%` },
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.ratingCount}>{rating.count.toLocaleString()}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Reviews Breakdown */}
                    {hotel.reviews_breakdown && hotel.reviews_breakdown.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="rate-review" size={22} color="#2c5aa0" />
                                <Text style={styles.sectionTitle}>What Guests Say</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {hotel.reviews_breakdown.map((review, index) => (
                                    <View key={index} style={styles.reviewBreakdownCard}>
                                        <Text style={styles.reviewCategoryName}>{review.name}</Text>
                                        <View style={styles.reviewSentiment}>
                                            <View style={styles.sentimentPositive}>
                                                <MaterialIcons name="thumb-up" size={14} color="#4CAF50" />
                                                <Text style={styles.sentimentText}>{review.positive}</Text>
                                            </View>
                                            <View style={styles.sentimentNegative}>
                                                <MaterialIcons name="thumb-down" size={14} color="#f44336" />
                                                <Text style={styles.sentimentText}>{review.negative}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.reviewMentions}>
                                            {review.total_mentioned} mentions
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Nearby Places */}
                    {hotel.nearby_places && hotel.nearby_places.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="place" size={22} color="#2c5aa0" />
                                <Text style={styles.sectionTitle}>Nearby Attractions</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {hotel.nearby_places.map((place, index) => (
                                    <View key={index} style={styles.nearbyCard}>
                                        <View style={styles.nearbyIcon}>
                                            <MaterialIcons name="place" size={24} color="#2c5aa0" />
                                        </View>
                                        <Text style={styles.nearbyName}>{place.name}</Text>
                                        <Text style={styles.nearbyCategory}>{place.category}</Text>
                                        {place.transportations?.[0] && (
                                            <View style={styles.nearbyTransport}>
                                                <MaterialIcons name="directions-car" size={12} color="#666" />
                                                <Text style={styles.nearbyDuration}>
                                                    {place.transportations[0].duration}
                                                </Text>
                                            </View>
                                        )}
                                        {place.rating && (
                                            <View style={styles.nearbyRating}>
                                                <MaterialIcons name="star" size={12} color="#FFD700" />
                                                <Text style={styles.nearbyRatingText}>{place.rating}</Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Location */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="location-pin" size={24} color="#2c5aa0" />
                            <Text style={styles.sectionTitle}>Location</Text>
                            <TouchableOpacity onPress={handleOpenMap} style={{ marginLeft: "auto" }}>
                                <Text style={styles.viewFullMapText}>View Full Map</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.mapContainer}>
                            {hotel.gps_coordinates ? (
                                <MapView
                                    ref={mapRef}
                                    style={styles.map}
                                    provider={PROVIDER_GOOGLE}
                                    initialRegion={{
                                        latitude: hotel.gps_coordinates.latitude,
                                        longitude: hotel.gps_coordinates.longitude,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                    pitchEnabled={false}
                                    rotateEnabled={false}
                                    onPress={handleOpenMap}
                                >
                                    <Marker
                                        coordinate={{
                                            latitude: hotel.gps_coordinates.latitude,
                                            longitude: hotel.gps_coordinates.longitude,
                                        }}
                                        title={hotel.name}
                                        description={hotel.address || hotel.location}
                                    />
                                </MapView>
                            ) : (
                                <View style={styles.noMapPlaceholder}>
                                    <MaterialIcons name="map" size={40} color="#ccc" />
                                    <Text style={styles.noMapText}>Map location unavailable</Text>
                                </View>
                            )}

                            {hotel.gps_coordinates && (
                                <TouchableOpacity
                                    style={styles.mapExpandButton}
                                    onPress={handleOpenMap}
                                    activeOpacity={0.8}
                                >
                                    <MaterialIcons name="open-in-full" size={20} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.locationFooter}>
                            <MaterialIcons name="place" size={16} color="#666" />
                            <Text style={styles.locationFooterText}>{hotel.address || hotel.location}</Text>
                        </View>
                    </View>



                    {/* Spacer */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView >

            {/* Contact Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.contactBarContainer}>
                    <TouchableOpacity style={[styles.contactBarButton, styles.callButton]} onPress={handleCall}>
                        <View style={styles.contactIconContainer}>
                            <MaterialIcons name="call" size={20} color="#fff" />
                        </View>
                        <Text style={styles.contactBarText}>Call</Text>
                    </TouchableOpacity>

                    <View style={styles.contactDivider} />

                    <TouchableOpacity style={[styles.contactBarButton, styles.mapButton]} onPress={handleOpenMap}>
                        <View style={[styles.contactIconContainer, styles.mapIconContainer]}>
                            <MaterialIcons name="directions" size={20} color="#2c5aa0" />
                        </View>
                        <Text style={[styles.contactBarText, styles.contactBarTextDark]}>Directions</Text>
                    </TouchableOpacity>

                    {hotel.link && (
                        <>
                            <View style={styles.contactDivider} />
                            <TouchableOpacity style={[styles.contactBarButton, styles.webButton]} onPress={handleVisitWebsite}>
                                <View style={[styles.contactIconContainer, styles.webIconContainer]}>
                                    <MaterialCommunityIcons name="web" size={20} color="#6a4f9e" />
                                </View>
                                <Text style={[styles.contactBarText, styles.contactBarTextDark]}>Website</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    scrollView: {
        flex: 1,
    },
    // Image Gallery
    imageGalleryContainer: {
        height: height * 0.42,
        position: "relative",
        backgroundColor: "#000",
    },
    galleryImage: {
        width: width,
        height: height * 0.42,
    },
    galleryGradient: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: "none",
    },
    imageIndicators: {
        position: "absolute",
        bottom: 70,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255,255,255,0.4)",
    },
    activeIndicator: {
        backgroundColor: "#fff",
        width: 28,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    headerButtons: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0,
    },
    headerBtn: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
    },
    headerRight: {
        flexDirection: "row",
    },
    // Content
    content: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingTop: 25,
        paddingHorizontal: 20,
        minHeight: height * 0.6,
    },
    // Header Section
    headerSection: {
        marginBottom: 25,
        paddingBottom: 5,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    hotelTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1a1a1a",
        flex: 1,
        marginRight: 10,
        letterSpacing: 0.5,
        lineHeight: 34,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
        marginBottom: 16,
    },
    locationText: {
        fontSize: 15,
        color: "#555",
        flex: 1,
        fontWeight: "500",
    },
    headerBadges: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    typeBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    typeBadgeText: {
        color: "#333",
        fontSize: 12,
        fontWeight: "600",
    },
    ecoBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e8f5e9",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
        borderWidth: 1,
        borderColor: "#c8e6c9",
    },
    ecoBadgeText: {
        color: "#2e7d32",
        fontSize: 12,
        fontWeight: "600",
    },
    // Premium Labels on Image
    premiumLabelsContainer: {
        position: "absolute",
        top: Platform.OS === "android" ? StatusBar.currentHeight + 65 : 100, // Positioned below back button
        left: 20,
        flexDirection: "row",
        gap: 10,
    },
    premiumBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    ecoPremiumBadge: {
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    premiumBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    // Removed old hero styles
    heroContent: {
        display: "none",
    },
    badgesContainer: {
        display: "none",
    },

    // Stats Row
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 25,
        marginTop: 5,
        paddingVertical: 18,
        paddingHorizontal: 15,
        backgroundColor: "#f8f9fa",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e9ecef",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: "#e0e0e0",
    },
    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2c5aa0",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
        marginBottom: 4,
    },
    ratingValueText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#fff",
    },
    statLabel: {
        fontSize: 12,
        color: "#888",
        fontWeight: "500",
        marginTop: 4,
    },
    starRow: {
        flexDirection: "row",
        marginBottom: 4,
    },
    priceValueText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    sectionDivider: {
        height: 1,
        backgroundColor: "#f0f0f0",
        marginBottom: 25,
        marginHorizontal: 10,
    },
    // Sections
    section: {
        marginBottom: 28,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: "700",
        color: "#1a1a1a",
        letterSpacing: 0.3,
    },
    // Rating Breakdown
    ratingBreakdownCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: "#e9ecef",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    ratingStarLabel: {
        width: 40,
        fontSize: 13,
        color: "#666",
        fontWeight: "500",
    },
    ratingBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: "#e9ecef",
        borderRadius: 4,
        marginHorizontal: 10,
        overflow: "hidden",
    },
    ratingBar: {
        height: "100%",
        backgroundColor: "#FFD700",
        borderRadius: 4,
    },
    ratingCount: {
        width: 50,
        fontSize: 12,
        color: "#888",
        textAlign: "right",
    },
    // Quick Info
    quickInfoCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 20,
        borderWidth: 1,
        borderColor: "#e9ecef",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    quickInfoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    quickInfoItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    quickInfoDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#ddd",
        marginHorizontal: 15,
    },
    quickInfoLabel: {
        fontSize: 12,
        color: "#888",
        marginBottom: 2,
    },
    quickInfoValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    // Amenities
    amenitiesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    amenityChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f7ff",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 25,
        gap: 8,
        borderWidth: 1,
        borderColor: "#d6e9ff",
    },
    amenityChipText: {
        fontSize: 13,
        color: "#2c5aa0",
        fontWeight: "600",
    },
    // About
    aboutCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: "#e9ecef",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    aboutText: {
        fontSize: 15,
        color: "#444",
        lineHeight: 24,
    },
    // Prices Comparison
    pricesCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e9ecef",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    officialPriceRow: {
        backgroundColor: "#f0fff4",
    },
    priceSourceInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    priceLogo: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
    },
    priceSourceName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    officialLabel: {
        fontSize: 11,
        color: "#4CAF50",
        fontWeight: "500",
    },
    priceAmount: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    priceSourceValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2c5aa0",
    },
    priceSourceUnit: {
        fontSize: 12,
        color: "#666",
    },
    // Reviews Breakdown
    reviewBreakdownCard: {
        width: 150,
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        marginRight: 14,
        borderWidth: 1,
        borderColor: "#e9ecef",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    reviewCategoryName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 10,
    },
    reviewSentiment: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 8,
    },
    sentimentPositive: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    sentimentNegative: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    sentimentText: {
        fontSize: 12,
        color: "#666",
    },
    reviewMentions: {
        fontSize: 11,
        color: "#888",
    },
    // Nearby Places
    nearbyCard: {
        width: 150,
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        marginRight: 14,
        borderWidth: 1,
        borderColor: "#e9ecef",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    nearbyIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#e3f2fd",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    nearbyName: {
        fontSize: 13,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
        marginBottom: 4,
    },
    nearbyCategory: {
        fontSize: 11,
        color: "#888",
        marginBottom: 8,
    },
    nearbyTransport: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 4,
    },
    nearbyDuration: {
        fontSize: 11,
        color: "#666",
    },
    nearbyRating: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    nearbyRatingText: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    viewFullMapText: {
        fontSize: 14,
        color: "#2c5aa0",
        fontWeight: "600",
    },
    mapContainer: {
        height: 200,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#f0f0f0",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        marginTop: 5,
    },
    map: {
        width: "100%",
        height: "100%",
    },
    mapExpandButton: {
        position: "absolute",
        bottom: 12,
        right: 12,
        backgroundColor: "#2c5aa0",
        padding: 8,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    noMapPlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    noMapText: {
        color: "#999",
        fontSize: 14,
    },
    locationFooter: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        paddingHorizontal: 4,
        gap: 6,
    },
    locationFooterText: {
        color: "#666",
        fontSize: 13,
        fontWeight: "500",
        flex: 1,
    },
    // Contact
    contactButtons: {
        flexDirection: "row",
        gap: 12,
    },
    contactBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#f8f9fa",
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    contactBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#333",
    },
    // Bottom Bar
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        paddingTop: 16,
        paddingBottom: Platform.OS === "ios" ? 32 : 22,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: "#e9ecef",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
    },
    contactBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f8f9fa",
        borderRadius: 18,
        padding: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    contactBarButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        gap: 8,
        borderRadius: 12,
    },
    callButton: {
        backgroundColor: "#2c5aa0",
    },
    mapButton: {
        backgroundColor: "transparent",
    },
    webButton: {
        backgroundColor: "transparent",
    },
    contactIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    mapIconContainer: {
        backgroundColor: "#e3f2fd",
    },
    webIconContainer: {
        backgroundColor: "#f3e5f5",
    },
    contactBarText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    contactBarTextDark: {
        color: "#333",
    },
    contactDivider: {
        width: 1,
        height: 24,
        backgroundColor: "#ddd",
        marginHorizontal: 4,
    },
});

export default HotelDetailsScreen;
