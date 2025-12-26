import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

const HotelCard = ({ item, responsiveWidth, navigation }) => {
    const handlePress = () => {
        if (navigation) {
            if (item.type === 'Restaurant') {
                navigation.navigate("RestaurantDetails", { restaurant: item });
            } else {
                navigation.navigate("HotelDetails", { hotel: item });
            }
        }
    };

    return (
        <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={handlePress}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.ratingBadge}>
                    <MaterialIcons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
                {item.type && (
                    <View style={[styles.typeBadge, item.type === 'Restaurant' && styles.typeBadgeRestaurant]}>
                        <MaterialCommunityIcons
                            name={item.type === 'Restaurant' ? 'silverware-fork-knife' : 'bed'}
                            size={12}
                            color="#fff"
                        />
                        <Text style={styles.typeText}>{item.type}</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.favoriteButton}>
                    <MaterialCommunityIcons name="heart-outline" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title} numberOfLines={1}>
                        {item.name}
                    </Text>
                </View>

                <View style={styles.locationRow}>

                    <Text style={styles.locationText} numberOfLines={1}>
                        {item.location}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.featuresRow}>
                    <View style={styles.amenities}>
                        {(item.amenities || []).slice(0, 4).map((amenity, index) => (
                            <View key={index} style={styles.amenityIcon}>
                                <MaterialCommunityIcons name={amenity} size={16} color="#666" />
                            </View>
                        ))}
                    </View>
                    {item.tags && item.tags.length > 0 && (
                        <View style={styles.tagBadge}>
                            <Text style={styles.tagText}>{item.tags[0]}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <View>
                        <Text style={styles.priceLabel}>{item.price ? 'Start from' : 'Availability'}</Text>
                        <Text style={styles.price}>
                            {item.priceLKR
                                ? `Rs. ${item.priceLKR.toLocaleString()}`
                                : (item.price ? `$ ${item.price.toLocaleString()}` : 'Price on request')}
                            {item.price && <Text style={styles.perNight}> / night</Text>}
                        </Text>
                        {item.priceLKR && item.price && (
                            <Text style={styles.usdPrice}>$ {item.price.toLocaleString()}</Text>
                        )}
                    </View>
                    <TouchableOpacity style={styles.bookButton}>
                        <Text style={styles.bookButtonText}>Book</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: 280,
        backgroundColor: "#fff",
        borderRadius: 20,
        marginRight: 20,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    imageContainer: {
        height: 180,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    ratingBadge: {
        position: "absolute",
        top: 15,
        left: 15,
        backgroundColor: "rgba(0,0,0,0.6)",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 12,
    },
    favoriteButton: {
        position: "absolute",
        top: 15,
        right: 15,
        backgroundColor: "rgba(0,0,0,0.3)",
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 12,
    },
    locationText: {
        fontSize: 12,
        color: "#888",
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: "#f0f0f0",
        marginBottom: 12,
    },
    featuresRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    amenities: {
        flexDirection: "row",
        gap: 8,
    },
    amenityIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: "#f5f7fa",
        justifyContent: "center",
        alignItems: "center",
    },
    tagBadge: {
        backgroundColor: "#e3f2fd",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 10,
        color: "#2c5aa0",
        fontWeight: "600",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    priceLabel: {
        fontSize: 10,
        color: "#999",
        marginBottom: 2,
    },
    price: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2c5aa0",
    },
    perNight: {
        fontSize: 12,
        fontWeight: "normal",
        color: "#999",
    },
    usdPrice: {
        fontSize: 11,
        color: "#888",
        marginTop: -2,
    },
    bookButton: {
        backgroundColor: "#2c5aa0",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    bookButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    typeBadge: {
        position: "absolute",
        bottom: 15,
        left: 15,
        backgroundColor: "#2c5aa0",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    typeBadgeRestaurant: {
        backgroundColor: "#FF9800",
    },
    typeText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 11,
    },
});

export default HotelCard;
