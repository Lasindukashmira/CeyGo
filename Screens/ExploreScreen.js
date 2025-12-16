import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  RefreshControl
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { getPagedPlaces, searchDestinations, checkIsFavorite, togglePlaceFavorite } from "../Services/PlacesService";
import { getAuth } from "firebase/auth";

const { width } = Dimensions.get("window");

const ExploreScreen = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState("All");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]); // For search
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // New State

  // Static Data for Hotels & Tours (Dummy)
  const hotels = [
    {
      id: "h1",
      title: "Galle Fort Hotel",
      location: "Galle, Southern Province",
      price: "$200/night",
      rating: 4.8,
      reviews: 320,
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/48083042.jpg?k=f63901413a967528e08d2482348a2745339f403986326847171d3778a8be656b&o=&hp=1",
      badge: "Luxury"
    },
    {
      id: "h2",
      title: "98 Acres Resort & Spa",
      location: "Ella, Uva Province",
      price: "$250/night",
      rating: 4.9,
      reviews: 500,
      image: "https://www.resort98acres.com/wp-content/uploads/2022/10/98-Acres-Best-Resorts-in-Ella-2.jpg",
      badge: "Nature"
    }
  ];

  const tours = [
    {
      id: "t1",
      title: "Whale Watching in Mirissa",
      duration: "5 Hours",
      price: "$50/person",
      rating: 4.7,
      reviews: 150,
      image: "https://www.lanka-excursions-holidays.com/images/whale-watching-mirissa-sri-lanka.jpg",
      badge: "Adventure"
    },
    {
      id: "t2",
      title: "Yala Safari Jeep Tour",
      duration: "4 Hours",
      price: "$80/jeep",
      rating: 4.6,
      reviews: 210,
      image: "https://www.lanka-excursions-holidays.com/images/yala-national-park-safari-sri-lanka.jpg",
      badge: "Wildlife"
    },
    {
      id: "t3",
      title: "Sigiriya Rock Climb",
      duration: "3 Hours",
      price: "$35/person",
      rating: 4.8,
      reviews: 600,
      image: "https://www.srilanka-places.com/images/sigiriya-lion-rock.jpg",
      badge: "Hiking"
    }
  ];

  // --- Fetch Logic ---
  const fetchDestinations = async (isLoadMore = false) => {
    if (isLoadMore) {
      if (loadingMore || !hasMore) return;
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    // Pass null if not loading more (reset)
    const result = await getPagedPlaces(isLoadMore ? lastDoc : null, 10);

    if (result.places.length < 10) setHasMore(false);

    if (isLoadMore) {
      setDestinations(prev => [...prev, ...result.places]);
      setFilteredDestinations(prev => [...prev, ...result.places]);
    } else {
      setDestinations(result.places);
      setFilteredDestinations(result.places);
      setHasMore(true); // Reset hasMore on full refresh
    }

    setLastDoc(result.lastDoc);
    setLoading(false);
    setLoadingMore(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setLastDoc(null);
    setHasMore(true);
    await fetchDestinations(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDestinations(false);
  }, []);

  // --- Search Logic ---
  // --- Search Logic ---
  const searchTimeout = useRef(null);

  const performSearch = async (text) => {
    setLoading(true);

    // 1. Search Destinations (Firestore)
    let matchedDestinations = [];
    if (selectedTab === "All" || selectedTab === "Destinations") {
      matchedDestinations = await searchDestinations(text);
    }

    // 2. Search Hotels (Local Dummy)
    let matchedHotels = [];
    if (selectedTab === "All" || selectedTab === "Hotels") {
      matchedHotels = hotels.filter(h =>
        h.title.toLowerCase().includes(text.toLowerCase()) ||
        h.location.toLowerCase().includes(text.toLowerCase()) ||
        h.badge.toLowerCase().includes(text.toLowerCase())
      );
    }

    // 3. Search Tours (Local Dummy)
    let matchedTours = [];
    if (selectedTab === "All" || selectedTab === "Tours") {
      matchedTours = tours.filter(t =>
        t.title.toLowerCase().includes(text.toLowerCase()) ||
        t.badge.toLowerCase().includes(text.toLowerCase())
      );
    }

    // Update States
    setFilteredDestinations(matchedDestinations);
    // For local lists, we might need separate matching states if we want to show them in "All"
    // But current structure uses 'filteredDestinations' primarily for the list view.
    // Let's create a unified search result structure for "All".

    setLoading(false);
    return { destinations: matchedDestinations, hotels: matchedHotels, tours: matchedTours };
  };

  const [searchResults, setSearchResults] = useState({ destinations: [], hotels: [], tours: [] });

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!text.trim()) {
      // Reset to default views
      setFilteredDestinations(destinations);
      setSearchResults({ destinations: [], hotels: [], tours: [] });
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      const results = await performSearch(text);
      setSearchResults(results);
      setFilteredDestinations(results.destinations); // Keep this for compatibility with direct list rendering
    }, 500); // 500ms debounce
  };

  // Re-trigger search when tab changes if query exists
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    } else if (selectedTab !== "All" && selectedTab !== "Destinations") {
      // If switching to static tabs (Hotels/Tours) without search, no fetch needed
    } else if (destinations.length === 0) {
      // If switching back to destinations and empty, fetch
      fetchDestinations();
    }
  }, [selectedTab]);

  // --- Components ---
  const SectionTitle = ({ title, showAll, onPressAll }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {showAll && (
        <TouchableOpacity onPress={onPressAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const DestinationCardHorizontal = ({ item }) => (
    <TouchableOpacity
      style={styles.cardHorizontal}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("PlaceDetails", { place: item })}
    >
      <Image source={{ uri: item.image_urls?.[0] || "https://neilpatel.com/wp-content/uploads/2017/08/colors.jpg" }} style={styles.cardImageHorizontal} />
      <View style={styles.cardOverlay}>
        <View style={styles.badgeContainer}>
          <View style={[styles.ratingBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <MaterialIcons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.avgRating}</Text>
          </View>
        </View>
        <View style={styles.textOverlay}>
          <Text style={styles.cardTitleH} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardLocH} numberOfLines={1}>{item.district}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const DestinationCardVertical = ({ item }) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const auth = getAuth();
    const user = auth.currentUser;
    const isFocused = useIsFocused();

    useEffect(() => {
      if (user && item.id) {
        checkIsFavorite(user.uid, item.id).then(setIsFavorited);
      }
    }, [user, item.id, isFocused]);

    const handleFavoritePress = async () => {
      if (!user) {
        alert("Please login to add favorites!");
        return;
      }

      const oldState = isFavorited;
      setIsFavorited(!isFavorited);

      try {
        await togglePlaceFavorite(user.uid, item.id, oldState);
      } catch (error) {
        console.error(error);
        setIsFavorited(oldState);
      }
    };

    return (
      <TouchableOpacity
        style={styles.cardVertical}
        activeOpacity={0.95}
        onPress={() => navigation.navigate("PlaceDetails", { place: item })}
      >
        <Image source={{ uri: item.image_urls?.[0] || item.image }} style={styles.cardImageV} resizeMode="cover" />
        <View style={styles.cardGradientOverlay} />

        {/* Top Row: Category & Favorite */}
        <View style={styles.cardTopRow}>
          <View style={[styles.categoryBadge, { maxWidth: '70%' }]}>
            <Text style={styles.categoryTextBadge} numberOfLines={1}>
              {(() => {
                const cat = item.category || item.categories;
                let val = "Destination";
                if (Array.isArray(cat) && cat.length > 0) val = cat[0];
                else if (typeof cat === 'string') val = cat;

                // Fallback if value looks like a URL or is too long/empty
                if (!val || val.includes('http') || val.length > 30) return "Destination";
                return val;
              })()}
            </Text>
          </View>
          <TouchableOpacity onPress={handleFavoritePress} style={{ padding: 5 }}>
            <MaterialIcons name={isFavorited ? "favorite" : "favorite-border"} size={26} color={isFavorited ? "#ff4757" : "#fff"} />
          </TouchableOpacity>
        </View>
        {/* Rich Content Overlay */}
        <View style={styles.cardContentOverlay}>
          <View style={styles.headerRow}>
            <Text style={styles.cardTitleV} numberOfLines={1}>{item.name}</Text>
            <View style={styles.ratingPill}>
              <MaterialIcons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingTextV}>{item.avgRating ? Number(item.avgRating).toFixed(1) : (0)}</Text>
            </View>
          </View>

          <View style={styles.locRow}>
            <MaterialIcons name="location-on" size={14} color="#ddd" />
            <Text style={styles.cardLocV} numberOfLines={1}>{item.geolocation?.full_address || item.district}</Text>
          </View>

          {/* Description Summary */}
          <Text style={styles.cardSummary} numberOfLines={2}>
            {item.description || "Discover this amazing place with breathtaking views and rich history. A must-visit destination in Sri Lanka."}
          </Text>

          {/* Bottom Stats Row */}
          <View style={styles.statsRowOnImage}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="heart" size={16} color="#fff" />
              <Text style={styles.statText}>{item.favoriteCount || 0}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="eye-outline" size={16} color="#fff" />
              <Text style={styles.statText}>{item.Views || 0} Views</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="comment-text-outline" size={14} color="#fff" />
              <Text style={styles.statText}>{item.reviewCount || 0} Reviews</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FeatureCard = ({ item, type }) => (
    <TouchableOpacity style={styles.featureCard} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.featureImage} />
      <View style={[styles.typeBadge, { backgroundColor: type === 'Hotel' ? '#2c5aa0' : '#FF6B6B' }]}>
        <Text style={styles.typeText}>{type}</Text>
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle} numberOfLines={1}>{item.title}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.featureDetail}>{type === 'Hotel' ? item.location : item.duration}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="star" size={14} color="#f4c430" />
            <Text style={[styles.featureDetail, { marginLeft: 2 }]}>{item.rating}</Text>
          </View>
        </View>
        <Text style={styles.featurePrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  // --- Render Functions ---
  const renderAllTab = () => {
    const isSearching = !!searchQuery.trim();
    const displayDestinations = isSearching ? searchResults.destinations : destinations;
    const displayHotels = isSearching ? searchResults.hotels : hotels;
    const displayTours = isSearching ? searchResults.tours : tours;

    if (isSearching && !displayDestinations.length && !displayHotels.length && !displayTours.length && !loading) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#888', marginTop: 20 }}>No results found for "{searchQuery}"</Text>
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2c5aa0"]} />}
        keyboardShouldPersistTaps="handled"
      >
        {/* Destinations Section */}
        {(displayDestinations.length > 0) && (
          <>
            <SectionTitle title={isSearching ? "Matching Destinations" : "Popular Destinations"} showAll={!isSearching} onPressAll={() => setSelectedTab("Destinations")} />

            {/* Default View: Horizontal Carousel */}
            {!isSearching && (
              <FlatList
                horizontal
                data={displayDestinations.slice(0, 5)}
                renderItem={({ item }) => <DestinationCardHorizontal item={item} />}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                style={{ marginBottom: 25 }}
              />
            )}

            {/* Search View: Vertical List (No nested FlatList) */}
            {isSearching && displayDestinations.map(item => (
              <View key={item.id} style={{ paddingHorizontal: 15 }}>
                <DestinationCardVertical item={item} />
              </View>
            ))}
          </>
        )}

        {/* Hotels Section */}
        {(displayHotels.length > 0) && (
          <>
            <SectionTitle title={isSearching ? "Matching Hotels" : "Top Rated Hotels"} showAll={!isSearching} onPressAll={() => setSelectedTab("Hotels")} />
            <FlatList
              horizontal
              data={displayHotels}
              renderItem={({ item }) => <FeatureCard item={item} type="Hotel" />}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 15 }}
              style={{ marginBottom: 25 }}
            />
          </>
        )}

        {/* Tours Section */}
        {(displayTours.length > 0) && (
          <>
            <SectionTitle title={isSearching ? "Matching Tours" : "Trending Experiences"} showAll={!isSearching} onPressAll={() => setSelectedTab("Tours")} />
            <FlatList
              horizontal
              data={displayTours}
              renderItem={({ item }) => <FeatureCard item={item} type="Tour" />}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 15 }}
              style={{ marginBottom: 25 }}
            />
          </>
        )}
      </ScrollView>
    );
  };

  const renderDestinationsTab = () => (
    <FlatList
      data={filteredDestinations}
      renderItem={({ item }) => <DestinationCardVertical item={item} />}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
      onEndReached={() => fetchDestinations(true)}
      onEndReachedThreshold={0.5}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2c5aa0"]} />}
      initialNumToRender={5}
      ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#2c5aa0" style={{ marginVertical: 20 }} /> : null}
      ListEmptyComponent={!loading && <Text style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>No destinations found.</Text>}
    />
  );

  const renderDummyList = (data, type) => (
    <FlatList
      data={data}
      renderItem={({ item }) => <FeatureCard item={item} type={type} />}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
      numColumns={2} // Grid layout for others? Or list? Let's do list for consistency or grid for variety. User asked for cards.
    // Actually FeatureCard is designed horizontal-ish small. Let's make it vertical full width for specific tabs.
    // Re-using Vertical Card style for Hotels/Tours for now with slight mods
    />
  );

  // Custom renderer for full tab hotels/tours to look good
  const renderFullList = (data, type) => (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.cardVertical} activeOpacity={0.95}>
          <Image source={{ uri: item.image }} style={styles.cardImageV} />
          <View style={styles.cardContentV}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.cardTitleV}>{item.title}</Text>
              <Text style={styles.ratingTextV}>⭐ {item.rating}</Text>
            </View>
            <Text style={styles.cardLocV}>{type === 'Hotel' ? item.location : item.duration}</Text>
            <Text style={[styles.priceText, { marginTop: 5 }]}>{item.price}</Text>
          </View>
        </TouchableOpacity>
      )}
      style={{ padding: 15 }}
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#888" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Where to next?"
            placeholderTextColor="#999"
            style={styles.input}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterModal(true)}>
          <MaterialCommunityIcons name="tune-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ paddingHorizontal: 15, marginBottom: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["All", "Destinations", "Hotels", "Tours"].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {loading && !loadingMore ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2c5aa0" />
          </View>
        ) : (
          <>
            {selectedTab === "All" && renderAllTab()}
            {selectedTab === "Destinations" && renderDestinationsTab()}
            {selectedTab === "Hotels" && renderFullList(searchQuery ? searchResults.hotels : hotels, "Hotel")}
            {selectedTab === "Tours" && renderFullList(searchQuery ? searchResults.tours : tours, "Tour")}
          </>
        )}
      </View>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Search</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>Type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {["Beach", "Mountain", "Nature", "Historical"].map((opt) => (
                <View key={opt} style={styles.filterChip}>
                  <Text>{opt}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.filterLabel}>Price Range</Text>
            <View style={{ height: 40, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 20, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#999' }}>Slider Placeholder</Text>
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilterModal(false)}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", paddingTop: 10 },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  input: { flex: 1, fontSize: 16, color: '#333' },
  filterBtn: {
    width: 50,
    height: 50,
    backgroundColor: '#2c5aa0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#2c5aa0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: '#e9ecef',
    marginRight: 10,
  },
  tabActive: { backgroundColor: '#2c5aa0' },
  tabText: { color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  seeAllText: { color: '#2c5aa0', fontWeight: 'bold' },

  // Horizontal Card
  cardHorizontal: {
    width: width * 0.6,
    height: 180,
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
  },
  cardImageHorizontal: { width: '100%', height: '100%' },
  cardOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'space-between',
    padding: 10,
  },
  cardTitleH: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cardLocH: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  badgeContainer: { alignItems: 'flex-end' },

  // Vertical Card (Rich Design)
  cardVertical: {
    marginBottom: 20,
    backgroundColor: '#2c3e50',
    borderRadius: 20,
    height: 280, // Reduced height
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  cardImageV: {
    width: '100%',
    height: '100%',
  },
  cardGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%', // Cover bottom half
    backgroundColor: 'rgba(0,0,0,0.35)', // Lower opacity
  },
  cardTopRow: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(44, 90, 160, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backdropFilter: 'blur(5px)',
  },
  categoryTextBadge: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  cardContentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitleV: { flex: 1, fontSize: 22, fontWeight: '800', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, marginRight: 10 },

  locRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardLocV: { color: '#ddd', fontSize: 13, marginLeft: 4, fontWeight: '500' },

  cardSummary: {
    color: '#eee',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 15,
    opacity: 0.9,
  },

  statsRowOnImage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginRight: 15,
  },

  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0, 0.5)'
  },
  ratingTextV: { color: '#FFD700', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },

  // Clean up unused
  reviewCountText: { display: 'none' },
  excludeBadge: { display: 'none' },
  excludeText: { display: 'none' },
  cardContentV: { display: 'none' },
  bottomRowV: { display: 'none' },
  ratingBadgeV: { display: 'none' },
  categoryText: { display: 'none' },
  priceText: { display: 'none' },

  // Feature Card (Hotels/Tours Small)
  featureCard: {
    width: width * 0.5,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingBottom: 10,
    shadowColor: '#000',
    opacity: 0.9,
    elevation: 2,
  },
  featureImage: { width: '100%', height: 100, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  typeBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  featureContent: { padding: 8 },
  featureTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 3 },
  featureDetail: { fontSize: 11, color: '#666' },
  featurePrice: { fontSize: 12, fontWeight: 'bold', color: '#2c5aa0', marginTop: 4 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, minHeight: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  filterLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  filterChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  applyBtn: { backgroundColor: '#2c5aa0', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  ratingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  ratingText: { color: 'white', marginLeft: 3, fontSize: 10, fontWeight: 'bold' },
  textOverlay: { marginTop: 'auto' },
});

export default ExploreScreen;
