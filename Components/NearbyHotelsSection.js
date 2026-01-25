import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const NearbyHotelsSection = ({ hotels = [], loading = false, navigation, onHotelPress }) => {
  const [favoriteIds, setFavoriteIds] = useState([]);

  const handleHotelPress = (hotel) => {
    if (onHotelPress) {
      onHotelPress(hotel);
    } else if (navigation) {
      navigation.navigate("HotelDetails", { hotel });
    } else {
      console.log("Hotel pressed:", hotel.name);
    }
  };

  const toggleFavorite = (id) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity?.toLowerCase() || '';
    const icons = {
      wifi: "wifi",
      pool: "pool",
      restaurant: "silverware-fork-knife",
      spa: "spa",
      breakfast: "coffee",
      bar: "glass-cocktail",
      parking: "car",
      beach: "beach",
      nature: "tree",
      biking: "bike",
      garden: "flower",
    };
    // Check if amenity contains any of the keys
    for (const [key, icon] of Object.entries(icons)) {
      if (amenityLower.includes(key)) return icon;
    }
    return "check-circle";
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', height: 200 }]}>
        <ActivityIndicator size="large" color="#2c5aa0" />
      </View>
    );
  }

  const renderHotelCard = ({ item }) => {
    const isFav = favoriteIds.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.hotelCard}
        onPress={() => handleHotelPress(item)}
        activeOpacity={0.95}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={typeof item.image === 'string' ? { uri: item.image } : item.image}
            style={styles.hotelImage}
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageGradient}
          />

          {/* Top Badges Row */}
          <View style={styles.topBadgesRow}>
            {item.topRated && (
              <View style={styles.topRatedBadge}>
                <MaterialIcons name="verified" size={12} color="#fff" />
                <Text style={styles.topRatedText}>Top Rated</Text>
              </View>
            )}
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={() => toggleFavorite(item.id)}
          >
            <MaterialIcons
              name={isFav ? "favorite" : "favorite-border"}
              size={20}
              color={isFav ? "#e53935" : "#fff"}
            />
          </TouchableOpacity>

          {/* Bottom Info on Image */}
          <View style={styles.imageBottomInfo}>
            <View style={styles.ratingPill}>
              <MaterialIcons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewsText}>({item.reviews})</Text>
            </View>
            <View style={styles.distancePill}>
              <MaterialIcons name="near-me" size={12} color="#2c5aa0" />
              <Text style={styles.distanceText}>{item.distance || '0.5'} km</Text>
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          <Text style={styles.hotelName} numberOfLines={1}>
            {item.name}
          </Text>

          {/* Amenities Row */}
          <View style={styles.amenitiesRow}>
            {(item.amenities || []).slice(0, 4).map((amenity, index) => (
              <View key={index} style={styles.amenityChip}>
                <MaterialCommunityIcons
                  name={getAmenityIcon(amenity)}
                  size={14}
                  color="#2c5aa0"
                />
              </View>
            ))}
            {(item.amenities || []).length > 4 && (
              <View style={styles.moreAmenitiesChip}>
                <Text style={styles.moreAmenitiesText}>+{(item.amenities || []).length - 4}</Text>
              </View>
            )}
          </View>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceValue}>
                {item.priceLKR ? `Rs ${item.priceLKR.toLocaleString()}` : `$${item.price}`}
              </Text>
              <Text style={styles.priceUnit}>/night</Text>
            </View>
            <TouchableOpacity style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>View</Text>
              <MaterialIcons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="home-city" size={22} color="#2c5aa0" />
          <Text style={styles.sectionTitle}>Nearby Hotels</Text>
        </View>
        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All</Text>
          <MaterialIcons name="chevron-right" size={18} color="#2c5aa0" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={hotels}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHotelCard}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: "#2c5aa0",
    fontWeight: "600",
  },
  listContainer: {
    paddingRight: 20,
  },
  hotelCard: {
    width: 240,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  imageContainer: {
    height: 140,
    position: "relative",
  },
  hotelImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  topBadgesRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
  },
  topRatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c5aa0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  topRatedText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  favoriteBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  imageBottomInfo: {
    position: "absolute",
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 4,
  },
  ratingText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  reviewsText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
  },
  distancePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 4,
  },
  distanceText: {
    color: "#1a1a1a",
    fontSize: 12,
    fontWeight: "600",
  },
  contentContainer: {
    padding: 14,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  amenitiesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  amenityChip: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  moreAmenitiesChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#e9ecef",
  },
  moreAmenitiesText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2c5aa0",
  },
  priceUnit: {
    fontSize: 12,
    color: "#888",
    marginLeft: 2,
  },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c5aa0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  viewBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default NearbyHotelsSection;
