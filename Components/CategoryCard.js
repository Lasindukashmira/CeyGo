import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Icon mapping for categories - unique icons for each
const getIconName = (title) => {
  const iconMap = {
    "Beaches & Costle Areas": "waves",
    "Mountains & Scenic Views": "image-filter-hdr",
    "Caves & Rock Formations": "flashlight",
    "Waterfalls & Rivers": "waterfall",
    "Forests & National Parks": "pine-tree",
    "Islands & Marine Attractions": "palm-tree",
    "Historical & Cultural Sites": "castle",
    "Religious & Spiritual Places": "hands-pray",
    "Adventure & Outdoor Activities": "parachute",
    "Urban Attractions": "city-variant",
    "Hot Springs & Natural Pools": "pool-thermometer",
    "Cultural Villages & Museums": "bank",
  };
  return iconMap[title] || "map-marker";
};

const CategoryCard = ({ item, onPress }) => {
  const iconName = getIconName(item.title);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
    >
      {/* Background Image */}
      <Image source={item.image} style={styles.backgroundImage} />

      {/* Dark Gradient Overlay */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={iconName} size={26} color="#fff" />
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 130,
    height: 160,
    marginRight: 12,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    zIndex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
  },
  title: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default CategoryCard;
