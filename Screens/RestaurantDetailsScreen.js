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

const RestaurantDetailsScreen = ({ route, navigation }) => {
    const { restaurant } = route.params;
    const [isFavorite, setIsFavorite] = useState(false);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${restaurant.name} on CeyGo!\n\nLocation: ${restaurant.location}\nRating: ${restaurant.rating} ⭐\nCuisine: ${restaurant.cuisine?.join(", ") || "Various"}`,
                title: restaurant.name,
            });
        } catch (error) {
            console.log("Error sharing:", error);
        }
    };

    const handleReserve = () => {
        Alert.alert(
            "Reserve Table",
            `Would you like to reserve a table at ${restaurant.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Reserve", onPress: () => console.log("Reserving...") },
            ]
        );
    };

    const handleCall = () => {
        const phoneNumber = "tel:+94112345678";
        Linking.openURL(phoneNumber);
    };

    const handleOpenMap = async () => {
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            restaurant.name + " " + restaurant.location
        )}`;
        await Linking.openURL(webUrl);
    };

    // Feature icon mapping
    const getFeatureDetails = (feature) => {
        const featureMap = {
            "silverware-fork-knife": { icon: "silverware-fork-knife", label: "Dine-in", color: "#4CAF50" },
            "glass-cocktail": { icon: "glass-cocktail", label: "Bar", color: "#E91E63" },
            wifi: { icon: "wifi", label: "Free Wi-Fi", color: "#2196F3" },
            coffee: { icon: "coffee", label: "Coffee", color: "#795548" },
            leaf: { icon: "leaf", label: "Vegetarian", color: "#4CAF50" },
            spa: { icon: "spa", label: "Ambiance", color: "#9C27B0" },
            "food-variant": { icon: "food-variant", label: "Buffet", color: "#FF9800" },
            "card-account-details": { icon: "card-account-details", label: "Reservations", color: "#607D8B" },
        };
        return featureMap[feature] || { icon: "silverware-fork-knife", label: feature, color: "#666" };
    };

    // Get price level display
    const getPriceLevel = () => {
        const price = restaurant.price || 3500;
        if (price >= 7000) return { level: "$$$$", label: "Fine Dining", color: "#9C27B0" };
        if (price >= 5000) return { level: "$$$", label: "Upscale", color: "#2196F3" };
        if (price >= 3000) return { level: "$$", label: "Moderate", color: "#4CAF50" };
        return { level: "$", label: "Budget", color: "#FF9800" };
    };

    const priceInfo = getPriceLevel();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={true}>
                {/* Hero Image Section */}
                <View style={styles.heroContainer}>
                    <Image source={{ uri: restaurant.image }} style={styles.heroImage} resizeMode="cover" />
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

                    {/* Restaurant Type Badge */}
                    <View style={styles.typeBadge}>
                        <MaterialCommunityIcons name="silverware-fork-knife" size={14} color="#fff" />
                        <Text style={styles.typeBadgeText}>Restaurant</Text>
                    </View>

                    {/* Hero Content */}
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>{restaurant.name}</Text>
                        <View style={styles.heroLocation}>
                            <MaterialIcons name="location-on" size={16} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.heroLocationText}>{restaurant.location}</Text>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                    {/* Rating & Price Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardLeft}>
                            <View style={styles.ratingSection}>
                                <View style={styles.ratingBadge}>
                                    <MaterialIcons name="star" size={20} color="#FFD700" />
                                    <Text style={styles.ratingValue}>{restaurant.rating}</Text>
                                </View>
                                <Text style={styles.reviewCount}>{restaurant.reviewCount || "50+"} reviews</Text>
                            </View>
                            {/* Cuisine Types */}
                            {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                                <View style={styles.cuisineRow}>
                                    <MaterialCommunityIcons name="chef-hat" size={16} color="#FF9800" />
                                    <Text style={styles.cuisineText}>{restaurant.cuisine.slice(0, 2).join(" • ")}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.infoCardRight}>
                            <View style={[styles.priceLevelBadge, { backgroundColor: priceInfo.color + "20" }]}>
                                <Text style={[styles.priceLevelText, { color: priceInfo.color }]}>{priceInfo.level}</Text>
                            </View>
                            <Text style={styles.priceLevelLabel}>{priceInfo.label}</Text>
                            <Text style={styles.avgPrice}>~LKR {restaurant.price?.toLocaleString() || "3,500"}</Text>
                        </View>
                    </View>

                    {/* Tags Section */}
                    {restaurant.tags && restaurant.tags.length > 0 && (
                        <View style={styles.tagsSection}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.tagsScroll}
                            >
                                {restaurant.tags.map((tag, index) => (
                                    <View key={index} style={styles.tagChip}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Features Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="silverware-variant" size={22} color="#2c5aa0" />
                            <Text style={styles.sectionTitle}>Features</Text>
                        </View>
                        <View style={styles.featuresGrid}>
                            {(restaurant.amenities || ["silverware-fork-knife", "glass-cocktail", "wifi"]).map(
                                (feature, index) => {
                                    const details = getFeatureDetails(feature);
                                    return (
                                        <View key={index} style={styles.featureItem}>
                                            <View style={[styles.featureIcon, { backgroundColor: details.color + "15" }]}>
                                                <MaterialCommunityIcons name={details.icon} size={22} color={details.color} />
                                            </View>
                                            <Text style={styles.featureLabel}>{details.label}</Text>
                                        </View>
                                    );
                                }
                            )}
                        </View>
                    </View>

                    {/* About Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="information" size={22} color="#2c5aa0" />
                            <Text style={styles.sectionTitle}>About</Text>
                        </View>
                        <View style={styles.aboutCard}>
                            <Text style={styles.aboutText}>
                                {restaurant.description ||
                                    `Discover culinary excellence at ${restaurant.name}. Located in ${restaurant.location}, we offer an unforgettable dining experience with carefully crafted dishes, exceptional service, and a warm ambiance. Perfect for intimate dinners, family gatherings, or special celebrations.`}
                            </Text>
                        </View>
                    </View>

                    {/* Opening Hours Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="clock-outline" size={22} color="#2c5aa0" />
                            <Text style={styles.sectionTitle}>Hours</Text>
                        </View>
                        <View style={styles.hoursCard}>
                            <View style={styles.hoursRow}>
                                <View style={styles.hoursItem}>
                                    <Text style={styles.hoursLabel}>Lunch</Text>
                                    <Text style={styles.hoursValue}>11:30 AM - 3:00 PM</Text>
                                </View>
                                <View style={styles.hoursDivider} />
                                <View style={styles.hoursItem}>
                                    <Text style={styles.hoursLabel}>Dinner</Text>
                                    <Text style={styles.hoursValue}>6:00 PM - 11:00 PM</Text>
                                </View>
                            </View>
                            <View style={styles.statusRow}>
                                <View style={styles.openBadge}>
                                    <View style={styles.openDot} />
                                    <Text style={styles.openText}>Open Now</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Popular Dishes Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="food" size={22} color="#2c5aa0" />
                            <Text style={styles.sectionTitle}>Popular Dishes</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {["Signature Crab", "Seafood Platter", "Grilled Prawns", "Chef's Special"].map(
                                (dish, index) => (
                                    <View key={index} style={styles.dishCard}>
                                        <MaterialCommunityIcons name="food" size={24} color="#2c5aa0" />
                                        <Text style={styles.dishName}>{dish}</Text>
                                    </View>
                                )
                            )}
                        </ScrollView>
                    </View>

                    {/* Location Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="location-on" size={22} color="#2c5aa0" />
                            <Text style={styles.sectionTitle}>Location</Text>
                        </View>
                        <TouchableOpacity style={styles.locationCard} onPress={handleOpenMap}>
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationAddress}>{restaurant.location}</Text>
                                <Text style={styles.locationHint}>Tap to view on map</Text>
                            </View>
                            <View style={styles.locationMapIcon}>
                                <MaterialCommunityIcons name="map-marker-radius" size={28} color="#2c5aa0" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Contact Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="contact-phone" size={22} color="#2c5aa0" />
                            <Text style={styles.sectionTitle}>Contact</Text>
                        </View>
                        <View style={styles.contactButtons}>
                            <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                                <MaterialIcons name="phone" size={22} color="#4CAF50" />
                                <Text style={styles.contactBtnText}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.contactBtn} onPress={handleOpenMap}>
                                <MaterialIcons name="directions" size={22} color="#2196F3" />
                                <Text style={styles.contactBtnText}>Directions</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Spacer for bottom button */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Fixed Bottom Reserve Button */}
            <View style={styles.bottomBar}>
                <View style={styles.bottomPriceInfo}>
                    <Text style={styles.bottomPriceLabel}>Avg. per person</Text>
                    <Text style={styles.bottomPriceValue}>LKR {restaurant.price?.toLocaleString() || "3,500"}</Text>
                </View>
                <TouchableOpacity style={styles.reserveButton} onPress={handleReserve} activeOpacity={0.8}>
                    <LinearGradient
                        colors={["#2c5aa0", "#1e3d6f"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.reserveButtonGradient}
                    >
                        <MaterialCommunityIcons name="calendar-check" size={20} color="#fff" />
                        <Text style={styles.reserveButtonText}>Reserve Table</Text>
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
        backgroundColor: "#FF9800",
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
    cuisineRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
    },
    cuisineText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    infoCardRight: {
        alignItems: "flex-end",
    },
    priceLevelBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 4,
    },
    priceLevelText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    priceLevelLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 2,
    },
    avgPrice: {
        fontSize: 13,
        color: "#888",
    },
    // Tags
    tagsSection: {
        marginBottom: 25,
    },
    tagsScroll: {
        paddingRight: 20,
    },
    tagChip: {
        backgroundColor: "#e3f2fd",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#bbdefb",
    },
    tagText: {
        color: "#2c5aa0",
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
    // Features Grid
    featuresGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 15,
    },
    featureItem: {
        width: (width - 70) / 4,
        alignItems: "center",
    },
    featureIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    featureLabel: {
        fontSize: 11,
        color: "#555",
        textAlign: "center",
        fontWeight: "500",
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
    // Hours
    hoursCard: {
        backgroundColor: "#f8f9fa",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    hoursRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    hoursItem: {
        flex: 1,
        alignItems: "center",
    },
    hoursDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#e9ecef",
        marginHorizontal: 15,
    },
    hoursLabel: {
        fontSize: 12,
        color: "#888",
        marginBottom: 4,
    },
    hoursValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    statusRow: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#e9ecef",
        alignItems: "center",
    },
    openBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    openDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#4CAF50",
    },
    openText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4CAF50",
    },
    // Popular Dishes
    dishCard: {
        width: 120,
        height: 100,
        backgroundColor: "#f8f9fa",
        borderRadius: 16,
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    dishName: {
        fontSize: 12,
        fontWeight: "600",
        color: "#333",
        marginTop: 8,
        textAlign: "center",
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
    // Contact
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
        backgroundColor: "#f8f9fa",
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    contactBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
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
    reserveButton: {
        flex: 1,
        marginLeft: 15,
    },
    reserveButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
    },
    reserveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default RestaurantDetailsScreen;
