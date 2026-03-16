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
import { getUnifiedServices } from "../Services/ExploreService";
import { useAuth } from "../AuthContext";

const { width } = Dimensions.get("window");

const ExploreScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("Destinations");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);

  const [hotels, setHotels] = useState([]);
  const [tours, setTours] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Tracking pagination for different tabs
  const [paginationState, setPaginationState] = useState({
    Destinations: { lastDoc: null, hasMore: true, apiOffset: 0 },
    Hotels: { lastDoc: null, hasMore: true, apiOffset: 0 },
    Tours: { lastDoc: null, hasMore: true, apiOffset: 0 },
    Restaurants: { lastDoc: null, hasMore: true, apiOffset: 0 }
  });

  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    district: "",
    minPrice: null,
    maxPrice: null,
    minRating: 0,
    category: ""
  });

  // --- Fetch Logic ---
  const fetchDestinations = async (isLoadMore = false) => {
    if (isLoadMore) {
      if (loadingMore || !paginationState.Destinations.hasMore) return;
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const res = await getPagedPlaces(isLoadMore ? paginationState.Destinations.lastDoc : null, 10);

    if (isLoadMore) {
      setDestinations(prev => [...prev, ...res.places]);
      setFilteredDestinations(prev => [...prev, ...res.places]);
    } else {
      setDestinations(res.places);
      setFilteredDestinations(res.places);
    }

    setPaginationState(prev => ({
      ...prev,
      Destinations: { lastDoc: res.lastDoc, hasMore: res.places.length === 10 }
    }));

    setLoading(false);
    setLoadingMore(false);
  };

  const fetchServices = async (type, isLoadMore = false) => {
    const tabName = type.charAt(0).toUpperCase() + type.slice(1) + "s";
    const currentPaginationState = paginationState[tabName];

    if (isLoadMore) {
      if (loadingMore || !currentPaginationState?.hasMore) return;
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const res = await getUnifiedServices(type, {
      district: filters.district,
      filters: filters,
      limitCount: 10,
      isLoadMore: isLoadMore,
      lastDoc: isLoadMore ? currentPaginationState?.lastDoc : null,
      apiOffset: isLoadMore ? currentPaginationState?.apiOffset : 0,
      userPreferences: user?.preferences || []
    });

    console.log(`[ExploreScreen] Fetched ${res.results.length} ${type}s`);
    if (type === 'tour') {
      console.log(`[ExploreScreen] Tours data sample:`, res.results.map(t => t.name).slice(0, 3));
    }

    const setterFn = type === 'hotel' ? setHotels : type === 'restaurant' ? setRestaurants : setTours;

    if (isLoadMore) {
      setterFn(prev => {
        const nextSet = [...prev, ...res.results];
        const uniqueIds = new Set();
        return nextSet.filter(item => {
          if (!uniqueIds.has(item.id)) {
            uniqueIds.add(item.id);
            return true;
          }
          return false;
        });
      });
    } else {
      setterFn(res.results);
    }

    setPaginationState(prev => ({
      ...prev,
      [tabName]: {
        lastDoc: res.lastDoc,
        apiOffset: res.apiOffset,
        hasMore: res.hasMore
      }
    }));

    setLoading(false);
    setLoadingMore(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPaginationState({
      Destinations: { lastDoc: null, hasMore: true, apiOffset: 0 },
      Hotels: { lastDoc: null, hasMore: true, apiOffset: 0 },
      Tours: { lastDoc: null, hasMore: true, apiOffset: 0 },
      Restaurants: { lastDoc: null, hasMore: true, apiOffset: 0 }
    });

    if (selectedTab === "Destinations") await fetchDestinations(false);
    if (selectedTab === "Hotels") await fetchServices('hotel', false);
    if (selectedTab === "Restaurants") await fetchServices('restaurant', false);
    if (selectedTab === "Tours") await fetchServices('tour', false);

    setRefreshing(false);
  };

  useEffect(() => {
    fetchDestinations(false);
    fetchServices('hotel', false);
    fetchServices('tour', false);
    fetchServices('restaurant', false);
  }, []);

  // --- Search Logic ---
  const searchTimeout = useRef(null);

  const performSearch = async (text) => {
    setLoading(true);

    // Run parallel searches via our unified service + destination search
    const [destResults, hotelResults, tourResults, restResults] = await Promise.all([
      searchDestinations(text),
      getUnifiedServices('hotel', { searchQuery: text, limitCount: 5 }),
      getUnifiedServices('tour', { searchQuery: text, limitCount: 5 }),
      getUnifiedServices('restaurant', { searchQuery: text, limitCount: 5 })
    ]);

    const results = {
      destinations: destResults,
      hotels: hotelResults.results,
      tours: tourResults.results,
      restaurants: restResults.results
    };

    setSearchResults(results);
    setFilteredDestinations(destResults);
    setLoading(false);
    return results;
  };

  const [searchResults, setSearchResults] = useState({ destinations: [], hotels: [], tours: [], restaurants: [] });

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!text.trim()) {
      // Reset to default views
      setFilteredDestinations(destinations);
      setSearchResults({ destinations: [], hotels: [], tours: [], restaurants: [] });
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
    } else if (selectedTab !== "Destinations") {
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
    const { user } = useAuth();
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

  // --- Navigation Helpers ---
  const handlePress = (item, type) => {
    const itemType = type || item.type;
    console.log(`Navigating to ${itemType} details:`, item.id);

    if (itemType === 'hotel' || itemType === 'Hotel') {
      navigation.navigate("HotelDetails", { hotel: item });
    } else if (itemType === 'restaurant' || itemType === 'Restaurant') {
      navigation.navigate("RestaurantDetails", { restaurant: item });
    } else if (itemType === 'tour' || itemType === 'Tour') {
      navigation.navigate("TourDetails", { tour: item });
    } else {
      navigation.navigate("PlaceDetails", { place: item });
    }
  };

  const FeatureCard = ({ item, type }) => (
    <TouchableOpacity
      style={styles.featureCard}
      activeOpacity={0.9}
      onPress={() => handlePress(item, type)}
    >
      <Image source={{ uri: item.image || item.coverImage }} style={styles.featureImage} />
      <View style={[styles.typeBadge, { backgroundColor: type === 'Hotel' ? '#2c5aa0' : type === 'Restaurant' ? '#ff9800' : '#FF6B6B' }]}>
        <Text style={styles.typeText}>{type}</Text>
      </View>
      {item.source === 'ceygo' && (
        <View style={styles.sourceBadge}>
          <MaterialCommunityIcons name="star-circle" size={12} color="#fff" />
          <Text style={styles.sourceText}>CeyGo Prio</Text>
        </View>
      )}
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle} numberOfLines={1}>{item.name || item.title}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.featureDetail}>{type === 'Hotel' ? (item.location?.district || item.location) : (item.duration || item.location?.district)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="star" size={14} color="#f4c430" />
            <Text style={[styles.featureDetail, { marginLeft: 2 }]}>{item.rating || item.avgRating || 0}</Text>
          </View>
        </View>
        <Text style={styles.featurePrice}>
          {item.pricing?.priceLKR ? `Rs. ${item.pricing.priceLKR.toLocaleString()}` : item.price || "Contact for Price"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // --- Render Functions ---
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
        <TouchableOpacity
          style={styles.cardVertical}
          activeOpacity={0.95}
          onPress={() => handlePress(item, type)}
        >
          <Image source={{ uri: item.image || item.coverImage }} style={styles.cardImageV} />
          <View style={styles.cardGradientOverlay} />

          {item.source === 'ceygo' && (
            <View style={styles.cardTopRow}>
              <View style={[styles.categoryBadge, { backgroundColor: 'rgba(76, 175, 80, 0.9)' }]}>
                <Text style={styles.categoryTextBadge}>CeyGo Provider</Text>
              </View>
            </View>
          )}

          <View style={styles.cardContentOverlay}>
            <View style={styles.headerRow}>
              <Text style={styles.cardTitleV} numberOfLines={1}>{item.name}</Text>
              <View style={styles.ratingPill}>
                <MaterialIcons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingTextV}>{item.rating || item.avgRating || 0}</Text>
              </View>
            </View>
            <View style={styles.locRow}>
              <MaterialIcons name="location-on" size={14} color="#ddd" />
              <Text style={styles.cardLocV} numberOfLines={1}>{item.location?.address || item.location}</Text>
            </View>
            <Text style={styles.priceTagV}>
              {item.pricing?.priceLKR ? `Rs. ${item.pricing.priceLKR.toLocaleString()}` : (item.price || "Contact for Price")}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      style={{ padding: 15 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      onEndReached={() => fetchServices(type.toLowerCase(), true)}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#2c5aa0" style={{ marginVertical: 20 }} /> : null}
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
          {["Destinations", "Hotels", "Restaurants", "Tours"].map(tab => (
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
            {selectedTab === "Destinations" && renderDestinationsTab()}
            {selectedTab === "Hotels" && renderFullList(searchQuery.trim() ? searchResults.hotels : hotels, "Hotel")}
            {selectedTab === "Restaurants" && renderFullList(searchQuery.trim() ? searchResults.restaurants : restaurants, "Restaurant")}
            {selectedTab === "Tours" && renderFullList(searchQuery.trim() ? searchResults.tours : tours, "Tour")}
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

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* District Filter */}
              <Text style={styles.filterLabel}>District</Text>
              <TextInput
                style={styles.districtInput}
                placeholder="e.g. Galle, Kandy, Colombo"
                value={filters.district}
                onChangeText={(text) => setFilters(prev => ({ ...prev, district: text }))}
              />

              {/* Rating Filter */}
              <Text style={styles.filterLabel}>Minimum Rating</Text>
              <View style={styles.ratingFilterRow}>
                {[3, 3.5, 4, 4.5].map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.ratingChip, filters.minRating === r && styles.activeChip]}
                    onPress={() => setFilters(prev => ({ ...prev, minRating: r }))}
                  >
                    <Text style={[styles.chipText, filters.minRating === r && styles.activeChipText]}>{r}+ ⭐</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Type Tags (Optional/Dummy for now) */}
              <Text style={styles.filterLabel}>Categories</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                {["Beach", "Mountain", "Nature", "Historical"].map((opt) => (
                  <View key={opt} style={styles.filterChip}>
                    <Text style={{ color: '#666' }}>{opt}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => {
                  setShowFilterModal(false);
                  onRefresh(); // Trigger re-fetch with new filters
                }}
              >
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureImage: { width: '100%', height: 100, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  typeBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 1 },
  typeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  sourceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1
  },
  sourceText: { color: '#fff', fontSize: 9, fontWeight: 'bold', marginLeft: 2 },
  featureContent: { padding: 8 },
  featureTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 3 },
  featureDetail: { fontSize: 11, color: '#666' },
  featurePrice: { fontSize: 12, fontWeight: 'bold', color: '#2c5aa0', marginTop: 4 },
  priceTagV: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  // Filter Modal Styles
  districtInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee'
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  ratingFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30
  },
  ratingChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#eee'
  },
  activeChip: {
    backgroundColor: '#2c5aa0',
    borderColor: '#2c5aa0'
  },
  chipText: {
    color: '#666',
    fontWeight: '600'
  },
  activeChipText: {
    color: '#fff'
  },
  applyBtn: {
    backgroundColor: '#2c5aa0',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center'
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, minHeight: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  filterChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  applyBtn: { backgroundColor: '#2c5aa0', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  ratingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  ratingText: { color: 'white', marginLeft: 3, fontSize: 10, fontWeight: 'bold' },
  textOverlay: { marginTop: 'auto' },
});

export default ExploreScreen;
