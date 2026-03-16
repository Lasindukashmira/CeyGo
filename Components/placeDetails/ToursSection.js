import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const ToursSection = ({ tours = [], loading = false }) => {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const renderTourCard = ({ item }) => {
    const isFavorite = favorites.includes(item.id);

    // Handle data structure differences between Firestore and API
    const image = item.image || item.image_url || (item.image_urls && item.image_urls[0]) || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
    const price = item.pricing?.priceLKR || item.priceLKR || (item.price ? Math.round(item.price * 300) : null) || 0;
    const rating = item.avgRating || item.overall_rating || item.rating || 4.5;
    const reviews = item.reviewCount || item.reviews || 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => console.log("Tour pressed:", item.name)}
      >
        <ImageBackground source={{ uri: image }} style={styles.image}>
          {/* Badge */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.tags[0]}</Text>
            </View>
          )}

          {/* Favorite */}
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            style={styles.favoriteBtn}
          >
            <MaterialIcons
              name={isFavorite ? "favorite" : "favorite-border"}
              size={26}
              color={isFavorite ? "red" : "#fff"}
            />
          </TouchableOpacity>

          {/* Overlay for info */}
          <View style={styles.overlay}>
            <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.owner}>{item.location && typeof item.location === 'string' ? item.location : 'Sri Lanka'}</Text>

            <Text style={styles.description} numberOfLines={2}>
              {item.description || "Discover the beauty of this location with our expert guides."}
            </Text>

            {/* Ratings & Distance */}
            <View style={styles.row}>
              <MaterialIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>
                {rating} ({reviews} reviews)
              </Text>
            </View>

            {/* Price & Views */}
            <View style={styles.bottomRow}>
              <Text style={styles.price}>Rs. {price.toLocaleString()}</Text>
              <View style={styles.viewsContainer}>
                <MaterialIcons name="visibility" size={18} color="#fff" />
                <Text style={styles.views}>{item.Views || 0} views</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tours & Experiences</Text>
        </View>
        <ActivityIndicator size="large" color="#2c5aa0" style={{ marginVertical: 30 }} />
      </View>
    );
  }

  if (tours.length === 0) {
    return null; // Hide if no tours
  }

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tours & Experiences</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Tours List */}
      <FlatList
        data={tours}
        renderItem={renderTourCard}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
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
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    color: "#2c5aa0",
    fontWeight: "600",
  },
  list: {
    paddingLeft: 5,
    paddingBottom: 10,
  },
  card: {
    width: 280,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 12,
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#2c5aa0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  favoriteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  owner: {
    color: "#eeeeeeff",
    fontSize: 13,
  },
  description: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    marginTop: 8,
    alignItems: "center",
  },
  rating: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 13,
  },
  distance: {
    color: "#d8d8d8ff",
    marginLeft: 10,
    fontSize: 12,
  },
  bottomRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  viewsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  views: {
    color: "#bbb",
    marginLeft: 4,
    fontSize: 12,
  },
});

export default ToursSection;
