import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
import MapSection from "../Components/placeDetails/MapSection";
import WeatherSection from "../Components/placeDetails/WeatherSection";
import WeatherModal from "../Components/placeDetails/WeatherModal";
import { incrementViewCount } from "../Services/PlacesService";
import { useEffect } from "react";

const { width, height } = Dimensions.get("window");

const PlaceDetailsScreen = ({ route, navigation }) => {
  const { place } = route.params;
  const [isWeatherVisible, setIsWeatherVisible] = useState(false);

  // Local state for Views to show realtime update
  const [viewCount, setViewCount] = useState(
    place.Views !== undefined ? place.Views : (place.popularity_score * 1000).toFixed(0)
  );

  useEffect(() => {
    // Increment view count in Firestore if it's a real place (has ID)
    if (place.id) {
      incrementViewCount(place.id);

      // Optimistically update local UI
      if (typeof viewCount === 'number') {
        setViewCount(prev => prev + 1);
      }
    }
  }, []);

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
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Gallery */}
          <ImageGallery placeImages={placeImages} navigation={navigation} />
          {/* Content */}
          <View style={styles.content}>
            {/* Hero Header Section */}
            <View style={styles.heroHeader}>
              {/* Title Row */}
              <View style={styles.titleRow}>
                <Text style={styles.placeTitle}>{place.name}</Text>
                <View style={styles.ratingBadge}>
                  <MaterialIcons name="star" size={18} color="#fff" />
                  <Text style={styles.ratingBadgeText}>{place.rating}</Text>
                </View>
              </View>

              {/* Location Pill */}
              <TouchableOpacity style={styles.locationPill} onPress={openFullScreenMap}>
                <MaterialIcons name="location-on" size={18} color="#2c5aa0" />
                <Text style={styles.locationPillText}>
                  {place.geolocation.district}, {place.geolocation.province}
                </Text>
                <MaterialIcons name="chevron-right" size={18} color="#999" />
              </TouchableOpacity>

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.quickStatItem}>
                  <View style={styles.quickStatIcon}>
                    <MaterialCommunityIcons name="eye" size={18} color="#2c5aa0" />
                  </View>
                  <Text style={styles.quickStatValue}>
                    {viewCount}
                  </Text>
                  <Text style={styles.quickStatLabel}>Views</Text>
                </View>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStatItem}>
                  <View style={styles.quickStatIcon}>
                    <MaterialCommunityIcons name="comment-text" size={18} color="#FF9800" />
                  </View>
                  <Text style={styles.quickStatValue}>{(place.popularity_score * 150).toFixed(0)}</Text>
                  <Text style={styles.quickStatLabel}>Reviews</Text>
                </View>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStatItem}>
                  <View style={styles.quickStatIcon}>
                    <MaterialCommunityIcons name="heart" size={18} color="#e53935" />
                  </View>
                  <Text style={styles.quickStatValue}>{(place.popularity_score * 200).toFixed(0)}</Text>
                  <Text style={styles.quickStatLabel}>Favorites</Text>
                </View>
              </View>
            </View>

            {/* Categories - Horizontal Scroll */}
            <View style={styles.categoriesSection}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="tag-multiple" size={20} color="#2c5aa0" />
                <Text style={styles.sectionTitle}>Categories</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              >
                {place.category.map((categoryName, index) => (
                  <View key={index} style={styles.categoryChip}>
                    <MaterialCommunityIcons name="tag" size={14} color="#2c5aa0" />
                    <Text style={styles.categoryChipText}>{categoryName}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* About Section with Card */}
            <View style={styles.aboutSection}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="information" size={20} color="#2c5aa0" />
                <Text style={styles.sectionTitle}>About</Text>
              </View>
              <View style={styles.aboutCard}>
                <Text style={styles.aboutText}>{place.description}</Text>
                {place.keywords && place.keywords.length > 0 && (
                  <View style={styles.keywordsRow}>
                    {place.keywords.slice(0, 4).map((keyword, index) => (
                      <View key={index} style={styles.keywordTag}>
                        <Text style={styles.keywordText}>#{keyword}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Opening Hours */}
            {place.opening_hours && Object.keys(place.opening_hours).length > 0 && (
              <View style={styles.openingHoursSection}>
                <View style={styles.openingHoursHeader}>
                  <MaterialCommunityIcons name="clock-outline" size={22} color="#2c5aa0" />
                  <Text style={styles.sectionTitle}>Opening Hours</Text>
                </View>
                <View style={styles.openingHoursContainer}>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => {
                    const hours = place.opening_hours[day] || place.opening_hours.default || "Closed";
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const isToday = day === today;

                    return (
                      <View
                        key={index}
                        style={[
                          styles.openingHoursRow,
                          isToday && styles.todayRow
                        ]}
                      >
                        <View style={styles.dayContainer}>
                          <Text style={[styles.dayText, isToday && styles.todayText]}>
                            {day}
                          </Text>
                          {isToday && (
                            <View style={styles.todayBadge}>
                              <Text style={styles.todayBadgeText}>Today</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.hoursText, isToday && styles.todayText]}>
                          {hours}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

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
      </View>
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
  // Hero Header Styles
  heroHeader: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  placeTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a1a1a",
    flex: 1,
    lineHeight: 32,
    marginRight: 10,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c5aa0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  ratingBadgeText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  locationPillText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginHorizontal: 6,
  },
  quickStats: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  quickStatItem: {
    flex: 1,
    alignItems: "center",
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 10,
  },
  // Categories Styles
  categoriesSection: {
    marginBottom: 25,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  categoriesScroll: {
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "#bbdefb",
  },
  categoryChipText: {
    fontSize: 13,
    color: "#2c5aa0",
    fontWeight: "600",
  },
  // About Section Styles
  aboutSection: {
    marginBottom: 25,
  },
  aboutCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  aboutText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },
  keywordsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 8,
  },
  keywordTag: {
    backgroundColor: "#2c5aa0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  keywordText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  // Keep old styles for backwards compat
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
  openingHoursSection: {
    marginBottom: 25,
  },
  openingHoursHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 8,
  },
  openingHoursContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  openingHoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  todayRow: {
    backgroundColor: "#e3f2fd",
    marginHorizontal: -15,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  dayContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  hoursText: {
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },
  todayText: {
    color: "#2c5aa0",
    fontWeight: "600",
  },
  todayBadge: {
    backgroundColor: "#2c5aa0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  todayBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
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
