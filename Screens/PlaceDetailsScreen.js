import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  Platform,
  FlatList,
  Modal,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import NearbyHotelsSection from "../Components/NearbyHotelsSection";
import ToursSection from "../Components/placeDetails/ToursSection";
import NearbyAttractionsSection from "../Components/NearbyAttractions";
import ReviewsSection from "../Components/ReviewSection";
import ImageGallery from "../Components/placeDetails/ImageGallery";
import Stats from "../Components/placeDetails/Stats";
import MapSection from "../Components/placeDetails/MapSection";
import WeatherSection from "../Components/placeDetails/WeatherSection";
import WeatherModal from "../Components/placeDetails/WeatherModal";

const { width, height } = Dimensions.get("window");

const PlaceDetailsScreen = ({ route, navigation }) => {
  const { place } = route.params;
  const [isWeatherVisible, setIsWeatherVisible] = useState(false);

  // Use the actual image list from place data
  const placeImages =
    place.image_urls && place.image_urls.length > 0
      ? place.image_urls
      : [place.image_urls?.[0] || require("../assets/cpic/History.jpg")];

  // Static weather data (will be replaced with API call later)
  const weatherData = {
    current: {
      temperature: 28,
      condition: "Sunny",
      icon: "☀️",
      humidity: 65,
      windSpeed: 12,
      uvIndex: 8,
      feelsLike: 32,
    },
    forecast: [
      { day: "Today", high: 32, low: 24, condition: "Sunny", icon: "☀️" },
      {
        day: "Tomorrow",
        high: 30,
        low: 23,
        condition: "Partly Cloudy",
        icon: "⛅",
      },
      { day: "Wednesday", high: 29, low: 22, condition: "Rainy", icon: "🌧️" },
      { day: "Thursday", high: 31, low: 25, condition: "Sunny", icon: "☀️" },
      { day: "Friday", high: 33, low: 26, condition: "Hot", icon: "🌡️" },
    ],
  };

  const openWeatherModal = () => {
    setIsWeatherVisible(true);
  };

  const closeWeatherModal = () => {
    setIsWeatherVisible(false);
  };

  const openFullScreenMap = async () => {
    const { latitude, longitude } = place.geolocation;
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${place.name})`,
    });

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback to Google Maps web version
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open maps application");
    }
  };

  const handleGetDirections = async () => {
    openFullScreenMap();
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Gallery */}
          <ImageGallery placeImages={placeImages} navigation={navigation} />
          {/* Content */}
          <View style={styles.content}>
            {/* Title and Rating */}
            <View style={styles.titleSection}>
              <Text style={styles.placeTitle}>{place.name}</Text>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={20} color="#FFD700" />
                <Text style={styles.ratingText}>{place.rating}</Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.locationSection}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <Text style={styles.locationText}>
                {place.geolocation.district}, {place.geolocation.province}, Sri
                Lanka
              </Text>
            </View>

            {/* Categories */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.categoriesContainer}>
                {place.category.map((categoryName, index) => (
                  <View key={index} style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{categoryName}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>{place.description}</Text>
            </View>

            {/* Stats */}
            <Stats place={place} />
            {/* Map Section */}
            <MapSection openFullScreenMap={openFullScreenMap} place={place} />

            {/* Action Buttons */}
            <View style={styles.actionButtonsSection}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleGetDirections}
              >
                <MaterialIcons name="directions" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <MaterialIcons name="share" size={20} color="#2c5aa0" />
                <Text style={styles.secondaryButtonText}>Share</Text>
              </TouchableOpacity>
            </View>

            <WeatherSection
              openWeatherModal={openWeatherModal}
              weatherData={weatherData}
            />
            <NearbyHotelsSection />
            <ToursSection />
            <NearbyAttractionsSection />
            <ReviewsSection />
          </View>
        </ScrollView>

        {/* Weather Modal */}

        <WeatherModal
          isWeatherVisible={isWeatherVisible}
          weatherData={weatherData}
          closeWeatherModal={closeWeatherModal}
          place={place}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },

  content: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 15,
  },
  placeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    lineHeight: 34,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 5,
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  locationText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  categoriesSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryTag: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: "#2c5aa0",
    fontWeight: "500",
  },
  descriptionSection: {
    marginBottom: 25,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },

  actionButtonsSection: {
    flexDirection: "row",
    marginBottom: 25,
    justifyContent: "space-between",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2c5aa0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 7.5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#2c5aa0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    marginLeft: 7.5,
  },
  secondaryButtonText: {
    color: "#2c5aa0",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  placeholderSection: {
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  placeholderCard: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
  },
  placeholderText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default PlaceDetailsScreen;
