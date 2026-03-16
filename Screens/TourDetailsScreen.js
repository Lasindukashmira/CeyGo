import React, { useState } from "react";
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
    Alert,
    Share,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const TourDetailsScreen = ({ route, navigation }) => {
    // Determine parameter name, fallback to route.params.tour if passed that way
    const tour = route.params?.tour || route.params?.place || {};
    const [isFavorite, setIsFavorite] = useState(false);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${tour.name} on CeyGo!\n\nLocation: ${tour.location?.address || tour.location?.district || "Sri Lanka"}\nDuration: ${tour.duration || "Depends"}\nPrice: LKR ${tour.pricing?.priceLKR?.toLocaleString() || tour.price || "Contact for details"}`,
                title: tour.name,
            });
        } catch (error) {
            console.log("Error sharing:", error);
        }
    };

    const handleBook = () => {
        Alert.alert(
            "Book Tour",
            `Would you like to book ${tour.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Book Now", onPress: () => console.log("Booking...") },
            ]
        );
    };

    const handleCall = () => {
        const phoneNumber = tour.contactPhone || "tel:+94112345678";
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleOpenMap = async () => {
        const address = tour.location?.address || tour.location?.district || tour.location;
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            (tour.name || "") + " " + (address || "")
        )}`;
        await Linking.openURL(webUrl);
    };

    // Feature icon mapping
    const getFeatureDetails = (feature) => {
        const featureMap = {
            "transport": { icon: "car", label: "Transport Included", color: "#4CAF50" },
            "guide": { icon: "account-tie", label: "Expert Guide", color: "#E91E63" },
            "meals": { icon: "food", label: "Meals Included", color: "#FF9800" },
            "hotel": { icon: "bed", label: "Accommodation", color: "#2196F3" },
            "equipment": { icon: "bag-personal", label: "Equipment", color: "#795548" },
            "tickets": { icon: "ticket", label: "Entrance Fees", color: "#9C27B0" },
        };
        return featureMap[feature.toLowerCase()] || { icon: "check-decagram", label: feature, color: "#666" };
    };

    const processFeatures = (features) => {
        if (!features) return [];
        let arr = Array.isArray(features) ? features : [features];
        // Handle cases where comma-separated values were accidentally saved as a single long string inside the array
        arr = arr.flatMap(item => typeof item === 'string' ? item.split(',') : [item]);
        return arr.map(item => {
            if (typeof item !== 'string') return null;
            const clean = item.trim();
            if (!clean) return null;
            // Capitalize first letter and make rest lowercase for consistency
            return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
        }).filter(Boolean);
    };

    const includesList = processFeatures(tour.tourDetails?.includes?.length ? tour.tourDetails.includes : tour.amenities);
    const excludesList = processFeatures(tour.tourDetails?.excludes);

    const priceAmount = tour.pricing?.priceLKR || tour.price || 0;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={true}>
                {/* Hero Image Section */}
                <View style={styles.heroContainer}>
                    <Image source={{ uri: tour.coverImage || tour.image || tour.image_urls?.[0] || 'https://images.unsplash.com/photo-1546708973-b339540b5162' }} style={styles.heroImage} resizeMode="cover" />
                    <LinearGradient
                        colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]}
                        style={styles.heroGradient}
                    />

                    {/* Back Button */}
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

                    {/* Tour Type Badge */}
                    <View style={styles.typeBadge}>
                        <MaterialCommunityIcons name="compass" size={14} color="#fff" />
                        <Text style={styles.typeBadgeText}>Tour Experience</Text>
                    </View>

                    {/* Hero Content */}
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>{tour.name || tour.title || "Amazing Tour"}</Text>
                        <View style={styles.heroLocation}>
                            <MaterialIcons name="location-on" size={16} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.heroLocationText}>{tour.location?.address || tour.location?.district || "Sri Lanka"}</Text>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                    {/* Duration & Group Size */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardLeft}>
                            <View style={styles.ratingSection}>
                                <View style={styles.ratingBadge}>
                                    <MaterialIcons name="star" size={20} color="#FFD700" />
                                    <Text style={styles.ratingValue}>{tour.rating || tour.avgRating || "New"}</Text>
                                </View>
                                <Text style={styles.reviewCount}>{tour.reviewCount || 0} reviews</Text>
                            </View>
                            <View style={styles.durationRow}>
                                <MaterialCommunityIcons name="clock-outline" size={16} color="#FF9800" />
                                <Text style={styles.durationText}>{tour.tourDetails?.duration || tour.duration || "Full Day"}</Text>
                            </View>
                            {tour.tourDetails?.groupSize && (
                                <View style={styles.durationRow}>
                                    <MaterialCommunityIcons name="account-group" size={16} color="#2196F3" />
                                    <Text style={styles.durationText}>
                                        Group Size: {tour.tourDetails.groupSize.min} - {tour.tourDetails.groupSize.max} max
                                    </Text>
                                </View>
                            )}
                            {tour.tourDetails?.languages && tour.tourDetails.languages.length > 0 && (
                                <View style={styles.durationRow}>
                                    <MaterialCommunityIcons name="translate" size={16} color="#4CAF50" />
                                    <Text style={styles.durationText}>{tour.tourDetails.languages.join(", ")}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.infoCardRight}>
                            <Text style={styles.priceLevelLabel}>Starting from</Text>
                            <Text style={styles.avgPrice}>LKR {priceAmount ? priceAmount.toLocaleString() : "Contact"}</Text>
                            <Text style={styles.pricePerPerson}>per person</Text>
                        </View>
                    </View>

                    {/* Tags Section */}
                    {tour.tags && tour.tags.length > 0 && (
                        <View style={styles.tagsSection}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.tagsScroll}
                            >
                                {tour.tags.map((tag, index) => (
                                    <View key={index} style={styles.tagChip}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Features / Included Section */}
                    {includesList.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="check-circle" size={22} color="#4CAF50" />
                                <Text style={styles.sectionTitle}>What's Included</Text>
                            </View>
                            <View style={styles.featuresGrid}>
                                {includesList.map(
                                    (feature, index) => {
                                        return (
                                            <View key={index} style={styles.featureItemDetail}>
                                                <MaterialCommunityIcons name="check" size={20} color="#4CAF50" />
                                                <Text style={styles.featureLabelDetail}>{feature}</Text>
                                            </View>
                                        );
                                    }
                                )}
                            </View>
                        </View>
                    )}

                    {/* Excluded Section */}
                    {excludesList.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="close-circle" size={22} color="#E53935" />
                                <Text style={styles.sectionTitle}>What's Not Included</Text>
                            </View>
                            <View style={styles.featuresGrid}>
                                {excludesList.map(
                                    (feature, index) => {
                                        return (
                                            <View key={index} style={styles.featureItemDetail}>
                                                <MaterialCommunityIcons name="close" size={20} color="#E53935" />
                                                <Text style={styles.featureLabelDetailExclude}>{feature}</Text>
                                            </View>
                                        );
                                    }
                                )}
                            </View>
                        </View>
                    )}

                    {/* About Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="information" size={22} color="#2c5aa0" />
                            <Text style={styles.sectionTitle}>Overview</Text>
                        </View>
                        <View style={styles.aboutCard}>
                            <Text style={styles.aboutText}>
                                {tour.description ||
                                    `Join us on an unforgettable journey with ${tour.name || "this amazing tour"}. Experience the best of ${tour.location?.district || "Sri Lanka"} with our expert guides and carefully curated itinerary. Perfect for adventurers and culture enthusiasts alike.`}
                            </Text>
                        </View>
                    </View>

                    {/* Itinerary (if available) */}
                    {tour.itinerary && tour.itinerary.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="map-marker-path" size={22} color="#2c5aa0" />
                                <Text style={styles.sectionTitle}>Itinerary</Text>
                            </View>
                            <View style={styles.itineraryCard}>
                                {tour.itinerary.map((day, index) => (
                                    <View key={index} style={styles.itineraryItem}>
                                        <View style={styles.timelineDot} />
                                        {index !== tour.itinerary.length - 1 && <View style={styles.timelineLine} />}
                                        <View style={styles.itineraryContent}>
                                            <Text style={styles.itineraryDay}>{day.title || `Day ${index + 1}`}</Text>
                                            <Text style={styles.itineraryText}>{day.description || day}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Gallery Section */}
                    {(tour.images || tour.image_urls) && (tour.images || tour.image_urls).length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="photo-library" size={22} color="#2c5aa0" />
                                <Text style={styles.sectionTitle}>Gallery</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {(tour.images || tour.image_urls).map((img, index) => (
                                    <TouchableOpacity key={index} activeOpacity={0.9}>
                                        <Image source={{ uri: img }} style={styles.galleryImage} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Pickup Locations / Meeting Point Section */}
                    {tour.tourDetails?.pickupLocations && tour.tourDetails.pickupLocations.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="car-pickup" size={22} color="#2c5aa0" />
                                <Text style={styles.sectionTitle}>Pickup Locations</Text>
                            </View>
                            <View style={styles.aboutCard}>
                                <View style={styles.bulletList}>
                                    {tour.tourDetails.pickupLocations.map((loc, idx) => (
                                        <View key={idx} style={styles.bulletRow}>
                                            <View style={styles.bulletDot} />
                                            <Text style={styles.bulletText}>{loc}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Location Section */}
                    {tour.location && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="location-pin" size={22} color="#2c5aa0" />
                                <Text style={styles.sectionTitle}>Main Location</Text>
                            </View>
                            <TouchableOpacity style={styles.locationCard} onPress={handleOpenMap}>
                                <View style={styles.locationInfo}>
                                    <Text style={styles.locationAddress}>{tour.location?.address || tour.location?.district || tour.location}</Text>
                                    <Text style={styles.locationHint}>Tap to view on map</Text>
                                </View>
                                <View style={styles.locationMapIcon}>
                                    <MaterialCommunityIcons name="map-marker-radius" size={28} color="#2c5aa0" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Provider Info Section */}
                    {tour.providerName && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="storefront" size={22} color="#2c5aa0" />
                                <Text style={styles.sectionTitle}>Service Provider</Text>
                            </View>
                            <View style={styles.providerCard}>
                                <View style={styles.providerInfoRow}>
                                    <View style={styles.providerAvatar}>
                                        <Text style={styles.providerAvatarText}>{tour.providerName.charAt(0).toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.providerDetails}>
                                        <Text style={styles.providerNameText}>{tour.providerName}</Text>
                                        <Text style={styles.providerSubText}>Local Tour Operator</Text>
                                    </View>
                                </View>
                                {(tour.contact?.phone || tour.contactPhone) && (
                                    <View style={styles.contactButtons}>
                                        <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                                            <MaterialIcons name="phone" size={22} color="#4CAF50" />
                                            <Text style={styles.contactBtnText}>Call Provider</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Spacer for bottom button */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Fixed Bottom Book Button */}
            <View style={styles.bottomBar}>
                <View style={styles.bottomPriceInfo}>
                    <Text style={styles.bottomPriceLabel}>Total Price</Text>
                    <Text style={styles.bottomPriceValue}>LKR {priceAmount ? priceAmount.toLocaleString() : "TBD"}</Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={handleBook} activeOpacity={0.8}>
                    <LinearGradient
                        colors={["#2c5aa0", "#1e3d6f"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.bookButtonGradient}
                    >
                        <MaterialCommunityIcons name="calendar-check" size={20} color="#fff" />
                        <Text style={styles.bookButtonText}>Book Now</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
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
    // Hero Section
    heroContainer: {
        height: height * 0.45,
        position: "relative",
    },
    heroImage: {
        width: "100%",
        height: "100%",
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
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
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    headerRight: {
        flexDirection: "row",
    },
    typeBadge: {
        position: "absolute",
        top: 100,
        left: 20,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FF6B6B",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    typeBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
    heroContent: {
        position: "absolute",
        bottom: 55,
        left: 20,
        right: 20,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 8,
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    heroLocation: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    heroLocationText: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 15,
        fontWeight: "500",
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
    // Info Card
    infoCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#f8f9fa",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    infoCardLeft: {
        flex: 1,
    },
    ratingSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
    },
    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    ratingValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    reviewCount: {
        fontSize: 13,
        color: "#666",
    },
    durationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
    },
    durationText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    infoCardRight: {
        alignItems: "flex-end",
        justifyContent: "center",
    },
    priceLevelLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 2,
    },
    avgPrice: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2c5aa0",
    },
    pricePerPerson: {
        fontSize: 11,
        color: "#888",
        marginTop: 2,
    },
    // Tags
    tagsSection: {
        marginBottom: 25,
    },
    tagsScroll: {
        paddingRight: 20,
    },
    tagChip: {
        backgroundColor: "#ffebee",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#ffcdd2",
    },
    tagText: {
        color: "#d32f2f",
        fontSize: 13,
        fontWeight: "600",
    },
    // Sections
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    // Features List Grid
    featuresGrid: {
        flexDirection: "column",
        gap: 8,
        backgroundColor: "#f8f9fa",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    featureItemDetail: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    featureLabelDetail: {
        fontSize: 15,
        color: "#333",
        fontWeight: "500",
    },
    featureLabelDetailExclude: {
        fontSize: 15,
        color: "#666",
        textDecorationLine: "line-through",
        textDecorationStyle: "solid",
    },
    // About
    aboutCard: {
        backgroundColor: "#f8f9fa",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    aboutText: {
        fontSize: 15,
        color: "#555",
        lineHeight: 24,
    },
    // Itinerary
    itineraryCard: {
        backgroundColor: "#f8f9fa",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    itineraryItem: {
        flexDirection: "row",
        marginBottom: 10,
        position: "relative",
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#2c5aa0",
        marginTop: 6,
        marginRight: 15,
        zIndex: 2,
    },
    timelineLine: {
        position: "absolute",
        left: 5,
        top: 18,
        bottom: -20,
        width: 2,
        backgroundColor: "#d1d5db",
        zIndex: 1,
    },
    itineraryContent: {
        flex: 1,
        paddingBottom: 15,
    },
    itineraryDay: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    itineraryText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    // Gallery
    galleryImage: {
        width: 200,
        height: 130,
        borderRadius: 16,
        marginRight: 12,
    },
    // Location
    locationCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    locationInfo: {
        flex: 1,
    },
    locationAddress: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    locationHint: {
        fontSize: 12,
        color: "#888",
    },
    locationMapIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#e3f2fd",
        justifyContent: "center",
        alignItems: "center",
    },
    // Bullets (Pickup)
    bulletList: {
        flexDirection: "column",
        gap: 10,
    },
    bulletRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    bulletDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#2c5aa0",
        marginTop: 6,
    },
    bulletText: {
        fontSize: 15,
        color: "#444",
        flex: 1,
        lineHeight: 22,
    },
    // Provider
    providerCard: {
        backgroundColor: "#f8f9fa",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    providerInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        marginBottom: 15,
    },
    providerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#2c5aa0",
        justifyContent: "center",
        alignItems: "center",
    },
    providerAvatarText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    providerDetails: {
        flex: 1,
    },
    providerNameText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    providerSubText: {
        fontSize: 13,
        color: "#666",
    },
    contactButtons: {
        flexDirection: "row",
        gap: 15,
    },
    contactBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#fff",
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#4CAF50",
    },
    contactBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4CAF50",
    },
    // Bottom Bar
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: Platform.OS === "ios" ? 30 : 16,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    bottomPriceInfo: {
        flex: 1,
    },
    bottomPriceLabel: {
        fontSize: 12,
        color: "#888",
        marginBottom: 2,
    },
    bottomPriceValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    bookButton: {
        flex: 1,
        marginLeft: 15,
    },
    bookButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    bookButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default TourDetailsScreen;
