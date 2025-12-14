import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,

  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

// Dummy Favourite Data
const dummyFavourites = {
  places: [
    {
      id: "p1",
      type: "place",
      name: "Sigiriya Rock Fortress",
      location: "Matale, Central Province",
      rating: 4.8,
      image: "https://beyondescapes.com/uploads/excursions/BW4YPnXzX3u1.jpg",
      category: "Historical & Cultural",
    },
    {
      id: "p2",
      type: "place",
      name: "Temple of Tooth Relic",
      location: "Kandy, Central Province",
      rating: 4.7,
      image: "https://cdn.britannica.com/19/118219-050-8BA0B67E/Dalada-Maligava-tooth-Buddha-Sri-Lanka-Kandy.jpg",
      category: "Religious & Spiritual",
    },
    {
      id: "p3",
      type: "place",
      name: "Mirissa Beach",
      location: "Matara, Southern Province",
      rating: 4.7,
      image: "https://digitaltravelcouple.com/wp-content/uploads/2020/01/mirissa-beach-sri-lanka-1.jpg",
      category: "Beaches & Coastal",
    },
  ],
  hotels: [
    {
      id: "h1",
      type: "hotel",
      name: "Cinnamon Grand Colombo",
      location: "Colombo",
      rating: 4.6,
      price: "$150/night",
      image: "https://picsum.photos/400/300?hotel1",
      amenities: ["wifi", "pool", "restaurant"],
    },
    {
      id: "h2",
      type: "hotel",
      name: "Jetwing Lighthouse",
      location: "Galle",
      rating: 4.8,
      price: "$200/night",
      image: "https://picsum.photos/400/300?hotel2",
      amenities: ["wifi", "spa", "pool"],
    },
  ],
  tours: [
    {
      id: "t1",
      type: "tour",
      name: "Whale Watching Adventure",
      location: "Mirissa",
      rating: 4.6,
      price: "$70/person",
      duration: "5 hours",
      image: "https://picsum.photos/400/300?tour1",
    },
    {
      id: "t2",
      type: "tour",
      name: "Yala Safari Experience",
      location: "Hambantota",
      rating: 4.7,
      price: "$85/person",
      duration: "Full Day",
      image: "https://picsum.photos/400/300?tour2",
    },
  ],
};

const FavouritesScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = ["All", "Places", "Hotels", "Tours"];

  // Get filtered data based on selected tab
  const getFilteredData = () => {
    let data = [];

    if (selectedTab === "All") {
      data = [
        ...dummyFavourites.places,
        ...dummyFavourites.hotels,
        ...dummyFavourites.tours,
      ];
    } else if (selectedTab === "Places") {
      data = dummyFavourites.places;
    } else if (selectedTab === "Hotels") {
      data = dummyFavourites.hotels;
    } else if (selectedTab === "Tours") {
      data = dummyFavourites.tours;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return data;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "place":
        return "map-marker";
      case "hotel":
        return "bed";
      case "tour":
        return "compass";
      default:
        return "heart";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "place":
        return "#4CAF50";
      case "hotel":
        return "#FF9800";
      case "tour":
        return "#9C27B0";
      default:
        return "#2c5aa0";
    }
  };

  const handleRemoveFavourite = (item) => {
    // TODO: Implement Firebase remove functionality
    console.log("Remove from favourites:", item.name);
  };

  const handleItemPress = (item) => {
    // TODO: Navigate to detail screens when pressed
    console.log("Navigate to:", item.name);
  };

  const renderFavouriteCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => handleItemPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />

      {/* Type Badge */}
      <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
        <MaterialCommunityIcons name={getTypeIcon(item.type)} size={12} color="#fff" />
        <Text style={styles.typeBadgeText}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
      </View>

      {/* Favourite Button */}
      <TouchableOpacity
        style={styles.favouriteBtn}
        onPress={() => handleRemoveFavourite(item)}
      >
        <MaterialIcons name="favorite" size={20} color="#e53935" />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>

          {item.price && (
            <Text style={styles.priceText}>{item.price}</Text>
          )}

          {item.duration && (
            <View style={styles.durationContainer}>
              <MaterialCommunityIcons name="clock-outline" size={12} color="#666" />
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          )}
        </View>

        {item.category && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="heart-off-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Favourites Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? "Try a different search term"
          : "Start exploring and save your favourite places!"}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate("Explore")}
        >
          <MaterialCommunityIcons name="compass" size={20} color="#fff" />
          <Text style={styles.exploreButtonText}>Explore Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const data = getFilteredData();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favourites</Text>
        <Text style={styles.headerSubtitle}>
          {data.length} saved {data.length === 1 ? "item" : "items"}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={22} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your favourites..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = selectedTab === tab;
          const count =
            tab === "All"
              ? dummyFavourites.places.length +
              dummyFavourites.hotels.length +
              dummyFavourites.tours.length
              : tab === "Places"
                ? dummyFavourites.places.length
                : tab === "Hotels"
                  ? dummyFavourites.hotels.length
                  : dummyFavourites.tours.length;

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
              </Text>
              <View style={[styles.countBadge, isActive && styles.activeCountBadge]}>
                <Text style={[styles.countText, isActive && styles.activeCountText]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Favourites Grid */}
      <FlatList
        data={data}
        renderItem={renderFavouriteCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c5aa0",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#e9ecef",
  },
  activeTab: {
    backgroundColor: "#2c5aa0",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  countBadge: {
    marginLeft: 6,
    backgroundColor: "#ddd",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeCountBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  activeCountText: {
    color: "#fff",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: 120,
  },
  typeBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  favouriteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 3,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginLeft: 3,
  },
  priceText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2c5aa0",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  durationText: {
    fontSize: 11,
    color: "#666",
  },
  categoryTag: {
    marginTop: 8,
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 10,
    color: "#2c5aa0",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c5aa0",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 25,
    gap: 8,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FavouritesScreen;
