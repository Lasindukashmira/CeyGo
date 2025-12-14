import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const DistrictCard = ({ item, navigation }) => {
  const handleDistrictPress = () => {
    navigation.navigate("DistrictDetails", {
      districtName: item.name,
      province: item.province,
      image: item.image,
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleDistrictPress}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={item.image}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        {/* Gradient Overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradientOverlay}
        />

        {/* Province Badge */}
        <View style={styles.provinceBadge}>
          <MaterialCommunityIcons name="map-marker-radius" size={10} color="#fff" />
          <Text style={styles.provinceText} numberOfLines={1}>
            {item.province.replace(" Province", "")}
          </Text>
        </View>

        {/* Content at bottom */}
        <View style={styles.content}>
          <Text style={styles.districtName}>{item.name}</Text>
          <View style={styles.exploreRow}>
            <Text style={styles.exploreText}>Explore</Text>
            <View style={styles.arrowCircle}>
              <MaterialIcons name="arrow-forward" size={12} color="#2c5aa0" />
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 150,
    height: 190,
    marginRight: 14,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 7,
  },
  imageBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  image: {
    borderRadius: 18,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  provinceBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(44, 90, 160, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  provinceText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
  content: {
    padding: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  districtName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  exploreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exploreText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DistrictCard;
