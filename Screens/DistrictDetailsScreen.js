import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const sampleDestinations = [
  {
    id: "1",
    title: "Galle Fort",
    rating: 4.7,
    image: require("../assets/cpic/Beach.jpg"),
    district: "Galle",
  },
  {
    id: "2",
    title: "Jungle Beach",
    rating: 4.5,
    image: require("../assets/cpic/Beach.jpg"),
    district: "Galle",
  },
];

const sampleHotels = [
  {
    id: "1",
    name: "Galle Paradise Hotel",
    price: "$45/night",
    rating: 4.6,
    image: require("../assets/cpic/Beach.jpg"),
  },
  {
    id: "2",
    name: "Seaside Resort",
    price: "$70/night",
    rating: 4.8,
    image: require("../assets/cpic/Beach.jpg"),
  },
];

const sampleTours = [
  {
    id: "1",
    name: "Galle City Tour",
    price: "$20",
    duration: "3 hrs",
    image: require("../assets/cpic/Beach.jpg"),
  },
  {
    id: "2",
    name: "Whale Watching",
    price: "$50",
    duration: "5 hrs",
    image: require("../assets/cpic/Beach.jpg"),
  },
];

const DistrictDetailsScreen = ({ route, navigation }) => {
  const { districtName, province } = route.params;

  const renderCard = (item, type) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title || item.name}</Text>
        {item.price && <Text style={styles.price}>{item.price}</Text>}
        {item.rating && (
          <View style={styles.ratingRow}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <Image
          source={require("../assets/cpic/Beach.jpg")}
          style={styles.banner}
        />
        <Text style={styles.districtTitle}>{districtName}</Text>
        <Text style={styles.subText}>{province}, Sri Lanka</Text>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About {districtName}</Text>
          <Text style={styles.aboutText}>
            {districtName} is one of the most beautiful districts in Sri Lanka,
            known for its rich history, culture, and natural attractions. This
            description will later come from the database.
          </Text>
        </View>

        {/* Destinations */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Top Destinations</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("MainTabs", {
                  screen: "Explore", // name of the Explore tab inside MainTabNavigator
                  params: { type: "Hotels", district: districtName },
                })
              }
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={sampleDestinations}
            renderItem={({ item }) => renderCard(item, "destination")}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Hotels */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Hotels</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Explore", {
                  type: "Hotels",
                  district: districtName,
                })
              }
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={sampleHotels}
            renderItem={({ item }) => renderCard(item, "hotel")}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Tours */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Tours</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Explore", {
                  type: "Tours",
                  district: districtName,
                })
              }
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={sampleTours}
            renderItem={({ item }) => renderCard(item, "tour")}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DistrictDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  banner: { width: "100%", height: 180, borderRadius: 12, marginBottom: 10 },
  districtTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    marginHorizontal: 15,
    color: "#2c5aa0",
  },
  subText: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 15,
    marginBottom: 15,
  },
  section: { marginVertical: 10, paddingHorizontal: 15 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c5aa0",
    marginBottom: 8,
  },
  aboutText: { fontSize: 14, color: "#444", lineHeight: 20 },
  seeAll: { fontSize: 14, color: "#2c5aa0", fontWeight: "500" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    width: 160,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: { padding: 8 },
  cardTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  price: { fontSize: 13, fontWeight: "bold", color: "#2c5aa0" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { fontSize: 12, marginLeft: 4, color: "#555" },
});
