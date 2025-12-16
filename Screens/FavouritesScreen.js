import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getUserFavorites, togglePlaceFavorite } from '../Services/PlacesService';

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const FavouritesScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favourites, setFavourites] = useState([]); // Real Data
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  const tabs = ["All", "Places", "Hotels", "Tours"];

  // Fetch Logic
  const fetchFavorites = async () => {
    console.log("Fetching favorites for:", user?.uid);
    if (!user) {
      setFavourites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getUserFavorites(user.uid);
      console.log("Favorites fetched:", data.length);

      const formattedData = data.map((item) => ({
        ...item,
        type: 'place',
        image: item.image_urls?.[0] || item.image || "https://neilpatel.com/wp-content/uploads/2017/08/colors.jpg",
        location: item.geolocation?.district || item.district || "Sri Lanka",
        rating: item.avgRating ? Number(item.avgRating).toFixed(1) : "New",
        category: Array.isArray(item.category) ? item.category[0] : (item.category || "Destination")
      }));

      setFavourites(formattedData);
    } catch (error) {
      console.error("Error in fetchFavorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [user])
  );

  const handleRemoveFavourite = async (item) => {
    if (!user) return;

    // Optimistic Update
    const oldFavs = favourites;
    setFavourites(prev => prev.filter(f => f.id !== item.id));

    try {
      await togglePlaceFavorite(user.uid, item.id, true); // true because we are removing
    } catch (e) {
      console.error("Error removing fav:", e);
      setFavourites(oldFavs); // Revert
    }
  };

  const handleItemPress = (item) => {
    navigation.navigate("PlaceDetails", { place: item });
  };

  // Get filtered data based on selected tab
  const getFilteredData = () => {
    let data = [];

    // Currently we only have "Places" in DB. 
    // Hotels and Tours logic remains looking at empty lists or dummy if you wanted.
    // User said "grab real data", so we focus on that.

    if (selectedTab === "All") {
      data = favourites;
    } else if (selectedTab === "Places") {
      data = favourites.filter(item => item.type === 'place');
    } else if (selectedTab === "Hotels") {
      // Future: Filter by type='hotel' if we add that field
      data = [];
    } else if (selectedTab === "Tours") {
      data = [];
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
      case "place": return "map-marker";
      case "hotel": return "bed";
      case "tour": return "compass";
      default: return "heart";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "place": return "#4CAF50";
      case "hotel": return "#FF9800";
      case "tour": return "#9C27B0";
      default: return "#2c5aa0";
    }
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
        </View>

        {item.category && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText} numberOfLines={1}>{item.category}</Text>
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
          : user ? "Start exploring and save your favourite places!" : "Please login to view favorites"}
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

  if (loading && favourites.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2c5aa0" />
      </View>
    );
  }

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
            tab === "All" ? favourites.length :
              tab === "Places" ? favourites.filter(i => i.type === 'place').length : 0;

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
    minHeight: '100%'
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
    zIndex: 1
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
    zIndex: 1
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
