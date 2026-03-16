import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const NearbyAttractionsSection = ({ attractions = [], loading = false, navigation }) => {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleAttractionPress = (item) => {
    if (navigation) {
      navigation.push("PlaceDetails", { place: item });
    }
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.title}>Nearby Attractions</Text>
        </View>
        <ActivityIndicator size="large" color="#2c5aa0" style={{ marginVertical: 30 }} />
      </View>
    );
  }

  if (attractions.length === 0) {
    return null; // Hide if no attractions
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Attractions</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={attractions}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
            const isFavorite = favorites.includes(item.id);
            const image = item.image_url || (item.image_urls && item.image_urls[0]) || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
            
            return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleAttractionPress(item)}
            activeOpacity={0.9}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              {/* Badge */}
              {item.avgRating >= 4.5 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Top Rated</Text>
                </View>
              )}
              {/* Favorite */}
              <TouchableOpacity
                style={styles.favorite}
                onPress={() => toggleFavorite(item.id)}
              >
                <MaterialCommunityIcons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={22}
                  color={isFavorite ? "red" : "#fff"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description || "Explore this beautiful destination near you."}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={16}
                    color="#2c5aa0"
                  />
                  <Text style={styles.metaText}>{item.geolocation?.district || 'Sri Lanka'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.metaText}>
                    {item.avgRating || item.rating || 0} • {item.Views || 0} views
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
            );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c5aa0",
  },
  listContainer: {
    paddingLeft: 5,
    paddingBottom: 10,
  },
  card: {
    width: width * 0.6,
    marginRight: 15,
    borderRadius: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#2c5aa0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  favorite: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#555",
    marginLeft: 4,
  },
});

export default NearbyAttractionsSection;
