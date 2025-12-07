import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { Modal } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const ExploreScreen = () => {
  const [selectedTab, setSelectedTab] = useState("All");
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Static data
  const hotels = [
    {
      id: "1",
      title: "Ocean View Resort",
      price: "$120/night",
      rating: 4.5,
      reviews: 120,
      likes: 40,
      amenities: ["wifi", "pool", "car", "restaurant"],
      image: "https://picsum.photos/400/250?hotel1",
      badge: "Top Pick",
    },
    {
      id: "2",
      title: "Mountain Escape Hotel",
      price: "$90/night",
      rating: 4.2,
      reviews: 98,
      likes: 22,
      amenities: ["wifi", "spa", "breakfast"],
      image: "https://picsum.photos/400/250?hotel2",
      badge: "Best Value",
    },
  ];

  const destinations = [
    {
      id: "1",
      title: "Galle Fort",
      district: "Galle",
      province: "Southern",
      rating: 4.7,
      reviews: 210,
      likes: 76,
      categories: ["Historical & Cultural Sites"],
      image: "https://picsum.photos/400/250?dest1",
      badge: "Must Visit",
    },
    {
      id: "2",
      title: "Sigiriya Rock Fortress",
      district: "Matale",
      province: "Central",
      rating: 4.8,
      reviews: 500,
      likes: 150,
      categories: ["Caves & Rock Formations"],
      image: "https://picsum.photos/400/250?dest2",
      badge: "World Heritage",
    },
  ];

  const tours = [
    {
      id: "1",
      title: "Whale Watching Tour",
      price: "$70/person",
      rating: 4.6,
      reviews: 85,
      likes: 33,
      description: "Half-day tour to watch whales in Mirissa.",
      image: "https://picsum.photos/400/250?tour1",
      badge: "Popular",
    },
    {
      id: "2",
      title: "Kandy City Day Tour",
      price: "$50/person",
      rating: 4.4,
      reviews: 65,
      likes: 20,
      description: "Explore Kandy’s cultural highlights in a day.",
      image: "https://picsum.photos/400/250?tour2",
      badge: "Recommended",
    },
  ];

  // --- Card Components ---
  const HotelCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.badge}</Text>
      </View>
      <TouchableOpacity style={styles.favoriteBtn}>
        <MaterialIcons name="favorite-border" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardPrice}>{item.price}</Text>
        <View style={styles.row}>
          <MaterialIcons name="star" size={18} color="gold" />
          <Text style={styles.text}>
            {item.rating} ({item.reviews} reviews)
          </Text>
        </View>
        <View style={styles.amenitiesRow}>
          {item.amenities.map((a, index) => (
            <MaterialIcons
              key={index}
              name={a}
              size={18}
              color="#2c5aa0"
              style={{ marginRight: 6 }}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const DestinationCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.badge}</Text>
      </View>
      <TouchableOpacity style={styles.favoriteBtn}>
        <MaterialIcons name="favorite-border" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.text}>
          {item.district}, {item.province}
        </Text>
        <View style={styles.row}>
          <MaterialIcons name="star" size={18} color="gold" />
          <Text style={styles.text}>
            {item.rating} ({item.reviews} reviews)
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {item.categories.map((cat, index) => (
            <View key={index} style={styles.categoryChip}>
              <Text style={styles.chipText}>{cat}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const TourCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.badge}</Text>
      </View>
      <TouchableOpacity style={styles.favoriteBtn}>
        <MaterialIcons name="favorite-border" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardPrice}>{item.price}</Text>
        <Text style={styles.text}>{item.description}</Text>
        <View style={styles.row}>
          <MaterialIcons name="star" size={18} color="gold" />
          <Text style={styles.text}>
            {item.rating} ({item.reviews} reviews)
          </Text>
        </View>
      </View>
    </View>
  );

  // Render logic
  const renderContent = () => {
    if (selectedTab === "Hotels") {
      return hotels.map((h) => <HotelCard key={h.id} item={h} />);
    } else if (selectedTab === "Destinations") {
      return destinations.map((d) => <DestinationCard key={d.id} item={d} />);
    } else if (selectedTab === "Tours") {
      return tours.map((t) => <TourCard key={t.id} item={t} />);
    } else {
      return (
        <>
          <Text style={styles.sectionHeader}>Hotels</Text>
          {hotels.map((h) => (
            <HotelCard key={h.id} item={h} />
          ))}
          <Text style={styles.sectionHeader}>Destinations</Text>
          {destinations.map((d) => (
            <DestinationCard key={d.id} item={d} />
          ))}
          <Text style={styles.sectionHeader}>Tours</Text>
          {tours.map((t) => (
            <TourCard key={t.id} item={t} />
          ))}
        </>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar + Filter */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search destinations, hotels, tours..."
          style={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilterModal(true)}
        >
          <MaterialIcons name="tune" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {["All", "Destinations", "Hotels", "Tours"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabChip,
              selectedTab === tab && styles.tabChipActive,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView>{renderContent()}</ScrollView>

      {/* Advanced Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Advanced Filters ({selectedTab})
            </Text>
            <Text style={styles.text}>Category selection chips here...</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 12 },
  searchRow: { flexDirection: "row", marginBottom: 10 },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
  },
  filterBtn: {
    backgroundColor: "#2c5aa0",
    padding: 10,
    marginLeft: 8,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  tabRow: { flexDirection: "row", marginBottom: 10 },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
    marginRight: 8,
  },
  tabChipActive: { backgroundColor: "#2c5aa0" },
  tabText: { color: "#333", fontWeight: "500" },
  tabTextActive: { color: "#fff" },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#2c5aa0",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 3,
  },
  cardImage: { width: "100%", height: 180 },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#2c5aa0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: "#fff", fontSize: 12 },
  favoriteBtn: { position: "absolute", top: 10, right: 10 },
  cardContent: { padding: 10 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  cardPrice: { color: "#2c5aa0", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  text: { fontSize: 13, color: "#555" },
  amenitiesRow: { flexDirection: "row", marginTop: 6 },
  categoryChip: {
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  chipText: { fontSize: 12, color: "#333" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  closeBtn: {
    backgroundColor: "#2c5aa0",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    alignSelf: "flex-end",
  },
});
