import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import React from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const WeatherModal = ({
  isWeatherVisible,
  closeWeatherModal,
  weatherData,
  place,
}) => {
  return (
    <Modal
      visible={isWeatherVisible}
      animationType="slide"
      onRequestClose={closeWeatherModal}
    >
      <SafeAreaView style={styles.weatherModalContainer}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.weatherModalHeader}>
          <TouchableOpacity
            style={styles.weatherCloseButton}
            onPress={closeWeatherModal}
          >
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.weatherModalTitle}>Weather Forecast</Text>
          <View style={styles.weatherPlaceholder} />
        </View>

        <ScrollView
          style={styles.weatherModalContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.weatherModalCurrent}>
            <View style={styles.weatherModalIconContainer}>
              <Text style={styles.weatherModalIcon}>
                {weatherData.current.icon}
              </Text>
            </View>
            <Text style={styles.weatherModalTemperature}>
              {weatherData.current.temperature}°C
            </Text>
            <Text style={styles.weatherModalCondition}>
              {weatherData.current.condition}
            </Text>
            <Text style={styles.weatherModalLocation}>
              {place.geolocation.district}, {place.geolocation.province}
            </Text>
          </View>

          <View style={styles.weatherDetailsGrid}>
            <View style={styles.weatherDetailCard}>
              <MaterialCommunityIcons
                name="thermometer"
                size={24}
                color="#2c5aa0"
              />
              <Text style={styles.weatherDetailCardLabel}>Feels Like</Text>
              <Text style={styles.weatherDetailCardValue}>
                {weatherData.current.feelsLike}°C
              </Text>
            </View>
            <View style={styles.weatherDetailCard}>
              <MaterialCommunityIcons
                name="water-percent"
                size={24}
                color="#2c5aa0"
              />
              <Text style={styles.weatherDetailCardLabel}>Humidity</Text>
              <Text style={styles.weatherDetailCardValue}>
                {weatherData.current.humidity}%
              </Text>
            </View>
            <View style={styles.weatherDetailCard}>
              <MaterialCommunityIcons
                name="weather-windy"
                size={24}
                color="#2c5aa0"
              />
              <Text style={styles.weatherDetailCardLabel}>Wind Speed</Text>
              <Text style={styles.weatherDetailCardValue}>
                {weatherData.current.windSpeed} km/h
              </Text>
            </View>
            <View style={styles.weatherDetailCard}>
              <MaterialCommunityIcons
                name="weather-sunny"
                size={24}
                color="#2c5aa0"
              />
              <Text style={styles.weatherDetailCardLabel}>UV Index</Text>
              <Text style={styles.weatherDetailCardValue}>
                {weatherData.current.uvIndex}
              </Text>
            </View>
          </View>

          <View style={styles.forecastSection}>
            <Text style={styles.forecastTitle}>5-Day Forecast</Text>
            {weatherData.forecast.map((day, index) => (
              <View key={index} style={styles.forecastItem}>
                <Text style={styles.forecastDay}>{day.day}</Text>
                <View style={styles.forecastCondition}>
                  <Text style={styles.forecastIcon}>{day.icon}</Text>
                  <Text style={styles.forecastConditionText}>
                    {day.condition}
                  </Text>
                </View>
                <View style={styles.forecastTemperatures}>
                  <Text style={styles.forecastHigh}>{day.high}°</Text>
                  <Text style={styles.forecastLow}>{day.low}°</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Weather Tips */}
          <View style={styles.weatherTipsSection}>
            <Text style={styles.weatherTipsTitle}>Travel Tips</Text>
            <View style={styles.weatherTipsCard}>
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={20}
                color="#2c5aa0"
              />
              <Text style={styles.weatherTipsText}>
                Perfect weather for outdoor activities! Remember to stay
                hydrated and use sunscreen.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  weatherModalContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  weatherModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  weatherCloseButton: {
    padding: 8,
  },
  weatherModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  weatherPlaceholder: {
    width: 40,
  },
  weatherModalContent: {
    flex: 1,
    padding: 20,
  },
  weatherModalCurrent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherModalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  weatherModalIcon: {
    fontSize: 40,
  },
  weatherModalTemperature: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  weatherModalCondition: {
    fontSize: 20,
    color: "#666",
    marginBottom: 5,
  },
  weatherModalLocation: {
    fontSize: 14,
    color: "#888",
  },
  weatherDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  weatherDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    width: "48%",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weatherDetailCardLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
  },
  weatherDetailCardValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  forecastSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  forecastItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    width: 80,
  },
  forecastCondition: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 15,
  },
  forecastIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  forecastConditionText: {
    fontSize: 14,
    color: "#666",
  },
  forecastTemperatures: {
    flexDirection: "row",
    alignItems: "center",
  },
  forecastHigh: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  forecastLow: {
    fontSize: 14,
    color: "#666",
  },
  weatherTipsSection: {
    marginBottom: 20,
  },
  weatherTipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  weatherTipsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weatherTipsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
  },
});

export default WeatherModal;
