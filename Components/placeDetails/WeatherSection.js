import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
const WeatherSection = ({ openWeatherModal, weatherData }) => {
  return (
    <View style={styles.weatherSection}>
      <View style={styles.weatherSectionHeader}>
        <Text style={styles.sectionTitle}>Current Weather</Text>
        <TouchableOpacity onPress={openWeatherModal}>
          <Text style={styles.viewFullWeatherText}>View Details</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.weatherCard} onPress={openWeatherModal}>
        <View style={styles.weatherMain}>
          <View style={styles.weatherIconContainer}>
            <Text style={styles.weatherIcon}>{weatherData.current.icon}</Text>
          </View>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherTemperature}>
              {weatherData.current.temperature}°C
            </Text>
            <Text style={styles.weatherCondition}>
              {weatherData.current.condition}
            </Text>
            <Text style={styles.weatherFeelsLike}>
              Feels like {weatherData.current.feelsLike}°C
            </Text>
          </View>
        </View>

        <View style={styles.weatherDetails}>
          <View style={styles.weatherDetailItem}>
            <MaterialCommunityIcons
              name="water-percent"
              size={16}
              color="#2c5aa0"
            />
            <Text style={styles.weatherDetailText}>
              {weatherData.current.humidity}%
            </Text>
          </View>
          <View style={styles.weatherDetailItem}>
            <MaterialCommunityIcons
              name="weather-windy"
              size={16}
              color="#2c5aa0"
            />
            <Text style={styles.weatherDetailText}>
              {weatherData.current.windSpeed} km/h
            </Text>
          </View>
          <View style={styles.weatherDetailItem}>
            <MaterialCommunityIcons
              name="weather-sunny"
              size={16}
              color="#2c5aa0"
            />
            <Text style={styles.weatherDetailText}>
              UV {weatherData.current.uvIndex}
            </Text>
          </View>
        </View>

        <View style={styles.weatherOverlay}>
          <MaterialIcons name="expand-more" size={20} color="#2c5aa0" />
          <Text style={styles.weatherOverlayText}>Tap for full forecast</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  weatherSection: {
    marginBottom: 25,
  },
  weatherSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  viewFullWeatherText: {
    fontSize: 14,
    color: "#2c5aa0",
    fontWeight: "600",
  },
  weatherCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  weatherMain: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  weatherIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  weatherIcon: {
    fontSize: 30,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemperature: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  weatherCondition: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  weatherFeelsLike: {
    fontSize: 14,
    color: "#888",
  },
  weatherDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  weatherDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherDetailText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  weatherOverlay: {
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
  weatherOverlayText: {
    fontSize: 12,
    color: "#2c5aa0",
    fontWeight: "600",
    marginTop: 5,
  },
});
export default WeatherSection;
