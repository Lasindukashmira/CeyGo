import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const Stats = ({ place }) => {
  return (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Statistics</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialIcons name="visibility" size={20} color="#2c5aa0" />
          <Text style={styles.statValue}>
            {(place.popularity_score * 1000).toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Views</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="comment" size={20} color="#2c5aa0" />
          <Text style={styles.statValue}>
            {(place.popularity_score * 150).toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="heart" size={20} color="#2c5aa0" />
          <Text style={styles.statValue}>
            {(place.popularity_score * 200).toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsSection: {
    marginBottom: 25,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    paddingVertical: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
export default Stats;
