import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const MapSection = ({ openFullScreenMap, place }) => {
  return (
    <View style={styles.mapSection}>
      <View style={styles.mapSectionHeader}>
        <Text style={styles.sectionTitle}>Location</Text>
        <TouchableOpacity onPress={openFullScreenMap}>
          <Text style={styles.viewFullMapText}>View Full Map</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.briefMapContainer}
        onPress={openFullScreenMap}
      >
        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map" size={60} color="#2c5aa0" />
          <Text style={styles.mapPlaceholderTitle}>{place.name}</Text>
          <Text style={styles.mapPlaceholderLocation}>
            {place.geolocation.district}, {place.geolocation.province}
          </Text>
          <Text style={styles.mapPlaceholderCoordinates}>
            📍 {place.geolocation.latitude.toFixed(4)},{" "}
            {place.geolocation.longitude.toFixed(4)}
          </Text>
          <View style={styles.mapOverlay}>
            <MaterialIcons name="zoom-in" size={24} color="#2c5aa0" />
            <Text style={styles.mapOverlayText}>Tap to view in maps</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mapSection: {
    marginBottom: 25,
  },
  mapSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  viewFullMapText: {
    fontSize: 14,
    color: "#2c5aa0",
    fontWeight: "600",
  },
  briefMapContainer: {
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  mapPlaceholderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 5,
    textAlign: "center",
  },
  mapPlaceholderLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  mapPlaceholderCoordinates: {
    fontSize: 12,
    color: "#888",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    textAlign: "center",
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  mapOverlayText: {
    fontSize: 14,
    color: "#2c5aa0",
    fontWeight: "600",
    marginTop: 5,
  },
});

export default MapSection;
