import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import React, { useState } from "react";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";

const NearbyHotelsSection = () => {
  const [hotels, setHotels] = useState([
    {
      id: 1,
      name: "Luxury Resort & Spa",
      distance: 1.2,
      rating: 4.7,
      reviews: 230,
      price: 185,
      image: require("../assets/districpics/ampara.jpg"),
      amenities: ["wifi", "pool", "restaurant", "spa"],
      topRated: true,
      favorite: false,
    },
    {
      id: 2,
      name: "Heritage Boutique Hotel",
      distance: 0.8,
      rating: 4.5,
      reviews: 120,
      price: 120,
      image: require("../assets/cpic/Beach.jpg"),
      amenities: ["wifi", "breakfast", "garden", "bar"],
      topRated: false,
      favorite: false,
    },
    {
      id: 3,
      name: "Eco Lodge Retreat",
      distance: 2.5,
      rating: 4.3,
      reviews: 80,
      price: 95,
      image: require("../assets/cpic/Beach.jpg"),
      amenities: ["wifi", "parking", "nature", "biking"],
      topRated: false,
      favorite: false,
    },
    {
      id: 4,
      name: "Beachfront Paradise",
      distance: 3.1,
      rating: 4.8,
      reviews: 300,
      price: 210,
      image: require("../assets/cpic/Beach.jpg"),
      amenities: ["beach", "pool", "spa", "bar"],
      topRated: true,
      favorite: false,
    },
  ]);

  const handleHotelPress = (hotel) => {
    console.log("Hotel pressed:", hotel.name);
  };

  // Toggle favorite status
  const toggleFavorite = (id) => {
    setHotels((prevHotels) =>
      prevHotels.map((hotel) =>
        hotel.id === id ? { ...hotel, favorite: !hotel.favorite } : hotel
      )
    );
  };

  return (
    <View style={styles.hotelsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nearby Hotels</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={hotels}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.hotelCard}
            onPress={() => handleHotelPress(item)}
            activeOpacity={0.9}
          >
            <View style={styles.hotelImageContainer}>
              <Image
                source={item.image}
                style={styles.hotelImage}
                defaultSource={require("../assets/cpic/Beach.jpg")}
              />

              {item.topRated && (
                <View style={styles.topRatedBadge}>
                  <Text style={styles.topRatedText}>Top Rated</Text>
                </View>
              )}

              {/* Favorite Button at Bottom Left */}
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(item.id)}
              >
                <FontAwesome
                  name={item.favorite ? "heart" : "heart-o"}
                  size={20}
                  color={item.favorite ? "red" : "#fff"}
                />
              </TouchableOpacity>

              {/* Rating */}
              <View style={styles.hotelRating}>
                <MaterialIcons name="star" size={14} color="#FFD700" />
                <Text style={styles.hotelRatingText}>{item.rating}</Text>
                <Text style={styles.hotelReviews}>({item.reviews})</Text>
              </View>

              {/* Distance */}
              <View style={styles.distanceBadge}>
                <MaterialIcons name="place" size={12} color="#333" />
                <Text style={styles.distanceText}>{item.distance} km</Text>
              </View>
            </View>

            <View style={styles.hotelDetails}>
              <Text style={styles.hotelName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.amenitiesRow}>
                {item.amenities.slice(0, 3).map((amenity, index) => {
                  let iconName;
                  switch (amenity) {
                    case "wifi":
                      iconName = "wifi";
                      break;
                    case "pool":
                      iconName = "pool";
                      break;
                    case "restaurant":
                      iconName = "restaurant";
                      break;
                    case "spa":
                      iconName = "spa";
                      break;
                    case "breakfast":
                      iconName = "free-breakfast";
                      break;
                    case "bar":
                      iconName = "local-bar";
                      break;
                    case "parking":
                      iconName = "local-parking";
                      break;
                    case "beach":
                      iconName = "beach-access";
                      break;
                    case "nature":
                      iconName = "nature-people";
                      break;
                    case "biking":
                      iconName = "directions-bike";
                      break;
                    case "garden":
                      iconName = "local-florist";
                      break;
                    default:
                      iconName = "check";
                  }
                  return (
                    <MaterialIcons
                      key={index}
                      name={iconName}
                      size={16}
                      color="#2c5aa0"
                      style={{ marginRight: 6 }}
                    />
                  );
                })}
                {item.amenities.length > 3 && (
                  <Text style={styles.moreAmenities}>
                    +{item.amenities.length - 3}
                  </Text>
                )}
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>${item.price}</Text>
                <Text style={styles.nightText}>/night</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.hotelsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hotelsSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    color: "#2c5aa0",
    fontWeight: "600",
  },
  hotelsList: {
    paddingLeft: 5,
    paddingBottom: 10,
  },
  hotelCard: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  hotelImageContainer: {
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: "hidden",
    position: "relative",
  },
  hotelImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  hotelRating: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hotelRatingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  hotelReviews: {
    color: "#fff",
    fontSize: 10,
    marginLeft: 4,
  },
  distanceBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  distanceText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
    marginLeft: 3,
  },
  hotelDetails: {
    padding: 15,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  amenitiesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  moreAmenities: {
    fontSize: 12,
    color: "#2c5aa0",
    fontWeight: "600",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c5aa0",
  },
  nightText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  topRatedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#2c5aa0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topRatedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  favoriteButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 35,
    height: 35,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NearbyHotelsSection;
