import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useEffect, useRef } from "react";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";

const MapSection = ({ openFullScreenMap, place }) => {
  const mapRef = useRef(null);

  // Animation: Start Zoomed IN, then Zoom OUT
  useEffect(() => {
    if (mapRef.current && place.geolocation) {
      // We set the initial region in props to be "Zoomed In".
      // Then we animate to "Zoomed Out" to show context.
      const targetRegion = {
        latitude: place.geolocation.latitude,
        longitude: place.geolocation.longitude,
        latitudeDelta: 0.05, // Zoomed out (District level)
        longitudeDelta: 0.05,
      };

      // Small delay to ensure map is ready and user sees the effect
      const timer = setTimeout(() => {
        mapRef.current.animateToRegion(targetRegion, 2000); // 2 second smooth zoom out
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [place]);

  if (!place || !place.geolocation) return null;

  return (
    <View style={styles.mapSection}>
      <View style={styles.mapSectionHeader}>
        <Text style={styles.sectionTitle}>Location</Text>
        <TouchableOpacity onPress={openFullScreenMap}>
          <Text style={styles.viewFullMapText}>View Full Map</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: place.geolocation.latitude,
            longitude: place.geolocation.longitude,
            latitudeDelta: 0.005, // Start Zoomed IN (Street level)
            longitudeDelta: 0.005,
          }}
          scrollEnabled={false} // Disable scroll for mini-map to prevent conflict with ScrollView
          zoomEnabled={false} // Disable zoom gestures on mini-map, force interaction via button
          pitchEnabled={false}
          rotateEnabled={false}
          onPress={openFullScreenMap} // Tap map to open full screen
        >
          <Marker
            coordinate={{
              latitude: place.geolocation.latitude,
              longitude: place.geolocation.longitude,
            }}
            title={place.name}
            description={place.location}
          />
        </MapView>

        {/* Overlay Button for clear CTA */}
        <TouchableOpacity
          style={styles.expandButton}
          onPress={openFullScreenMap}
          activeOpacity={0.8}
        >
          <MaterialIcons name="open-in-full" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.locationInfo}>
        <MaterialIcons name="location-pin" size={16} color="#666" />
        <Text style={styles.locationText}>
          {place.geolocation.district}, {place.geolocation.province}
        </Text>
      </View>
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
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  viewFullMapText: {
    fontSize: 14,
    color: "#2c5aa0",
    fontWeight: "600",
  },
  mapContainer: {
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  map: {
    width: "100%",
    height: "100%",
  },
  expandButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#2c5aa0',
    padding: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  locationText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '500',
  }
});

export default MapSection;
