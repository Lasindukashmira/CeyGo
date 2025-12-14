import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const Header = ({ onProfilePress, onNotificationPress, userName = "Traveler" }) => {
  // Get dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>
            {getGreeting()}{userName ? `, ${userName}` : ""}
          </Text>
          <Text style={styles.waveEmoji}>👋</Text>
        </View>
        <Text style={styles.userName}>Welcome to CeyGo</Text>
      </View>

      <View style={styles.headerRight}>
        {/* Notification Bell */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color="#333" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
          <View style={styles.profileIcon}>
            <MaterialIcons name="person" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  headerLeft: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  greeting: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  waveEmoji: {
    fontSize: 14,
    marginLeft: 5,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c5aa0",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f4f8",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#e53935",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f8f9fa",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  profileButton: {
    marginLeft: 4,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2c5aa0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2c5aa0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
});

export default Header;
