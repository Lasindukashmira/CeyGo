import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { checkIsFavorite, togglePlaceFavorite } from "../Services/PlacesService";
import { useIsFocused } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const PlaceCard = ({ item, onPress, getCategoryIcon, rank, navigation }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  const isFocused = useIsFocused(); // Re-render triggers when screen comes into focus

  // Check status on mount AND focus
  React.useEffect(() => {
    if (user && item.id) {
      checkIsFavorite(user.uid, item.id).then(setIsFavorited);
    }
  }, [user, item.id, isFocused]); // Added isFocused dependency

  const handleFavoritePress = async (event) => {
    event.stopPropagation();
    if (!user) {
      alert("Please login to add favorites!");
      return;
    }

    // Optimistic Update
    const oldState = isFavorited;
    setIsFavorited(!isFavorited);

    try {
      await togglePlaceFavorite(user.uid, item.id, oldState);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      setIsFavorited(oldState); // Revert on error
    }
  };

  const handleCardPress = () => {
    if (navigation) {
      navigation.navigate("PlaceDetails", { place: item });
    } else if (onPress) {
      onPress(item);
    }
  };

  // Get rank medal emoji
  const getRankDisplay = () => {
    if (rank === 1) return { emoji: "🥇", bg: "#FFD700" };
    if (rank === 2) return { emoji: "🥈", bg: "#C0C0C0" };
    if (rank === 3) return { emoji: "🥉", bg: "#CD7F32" };
    return { emoji: `#${rank}`, bg: "#2c5aa0" };
  };

  const rankInfo = getRankDisplay();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleCardPress}
      activeOpacity={0.92}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image_urls[0] }}
          style={styles.image}
          defaultSource={require("../assets/cpic/History.jpg")}
        />

        {/* Dark gradient overlay at bottom */}
        <View style={styles.imageGradient} />

        {/* Rank Badge */}
        <View style={[styles.rankBadge, { backgroundColor: rankInfo.bg }]}>
          {rank <= 3 ? (
            <Text style={styles.rankEmoji}>{rankInfo.emoji}</Text>
          ) : (
            <Text style={styles.rankText}>{rankInfo.emoji}</Text>
          )}
        </View>

        {/* Rating Pill */}
        <View style={styles.ratingPill}>
          <MaterialIcons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.avgRating}</Text>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavorited && styles.favoriteButtonActive,
          ]}
          onPress={handleFavoritePress}
        >
          <MaterialIcons
            name={isFavorited ? "favorite" : "favorite-border"}
            size={20}
            color={isFavorited ? "#e53935" : "#fff"}
          />
        </TouchableOpacity>

        {/* Category Tags on Image */}
        <View style={styles.categoryTags}>
          {item.category.slice(0, 2).map((categoryName, index) => (
            <View key={index} style={styles.categoryTag}>
              {getCategoryIcon(categoryName)}
            </View>
          ))}
          {item.category.length > 2 && (
            <View style={styles.categoryTagMore}>
              <Text style={styles.categoryMoreText}>
                +{item.category.length - 2}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {item.name}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={14} color="#2c5aa0" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.geolocation.district}, {item.geolocation.province}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="eye" size={14} color="#888" />
            <Text style={styles.statText}>
              {item.Views !== undefined ? item.Views : (item.popularity_score * 1000).toFixed(0)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="comment-text" size={14} color="#888" />
            <Text style={styles.statText}>
              {item.reviewCount !== undefined ? item.reviewCount : (item.popularity_score * 150).toFixed(0)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="heart" size={14} color="#888" />
            <Text style={styles.statText}>
              {item.favoriteCount}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* View Details Button */}
        <TouchableOpacity style={styles.viewButton} onPress={handleCardPress}>
          <Text style={styles.viewButtonText}>View Details</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    marginRight: 16,
    borderRadius: 24,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  imageContainer: {
    height: 170,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "transparent",
  },
  rankBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    minWidth: 36,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  rankEmoji: {
    fontSize: 16,
  },
  rankText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  ratingPill: {
    position: "absolute",
    top: 14,
    right: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  ratingText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButtonActive: {
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  categoryTags: {
    position: "absolute",
    bottom: 12,
    left: 14,
    flexDirection: "row",
    gap: 6,
  },
  categoryTag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryTagMore: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(44,90,160,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryMoreText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#ddd",
  },
  statText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  description: {
    fontSize: 13,
    color: "#888",
    lineHeight: 19,
    marginBottom: 14,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2c5aa0",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PlaceCard;
