import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,

  ScrollView,
  FlatList,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { catergory, districs, tempTop10, topHotels } from "../constData";
import { getTopPlaces } from "../Services/PlacesService"; // Import Service
import Header from "../Components/Header";
import SectionHeader from "../Components/SectionHeader";
import CategoryCard from "../Components/CategoryCard";
import DistrictCard from "../Components/DistrictCard";
import PlaceCard from "../Components/PlaceCard";
import HotelCard from "../Components/HotelCard";
import { getCategoryIcon } from "../Components/CategoryIconUtils";
import { useAuth } from "../AuthContext";
import ProfileMenu from "../Components/ProfileMenu";

const { width } = Dimensions.get("window");

// Featured destinations for hero carousel
const featuredDestinations = [
  {
    id: "1",
    name: "Sigiriya Rock Fortress",
    tagline: "Ancient Wonder of the World",
    image: "https://beyondescapes.com/uploads/excursions/BW4YPnXzX3u1.jpg",
  },
  {
    id: "2",
    name: "Mirissa Beach",
    tagline: "Paradise of the South",
    image: "https://digitaltravelcouple.com/wp-content/uploads/2020/01/mirissa-beach-sri-lanka-1.jpg",
  },
  {
    id: "3",
    name: "Temple of Tooth Relic",
    tagline: "Sacred Heritage of Kandy",
    image: "https://cdn.britannica.com/19/118219-050-8BA0B67E/Dalada-Maligava-tooth-Buddha-Sri-Lanka-Kandy.jpg",
  },
];

// Quick action buttons data
const quickActions = [
  { id: "1", name: "Hotels", icon: "bed", color: "#FF9800", screen: "Explore" },
  { id: "2", name: "Tours", icon: "compass", color: "#9C27B0", screen: "Explore" },
  { id: "3", name: "Map", icon: "map-marker", color: "#4CAF50", screen: "Explore" },
  { id: "4", name: "AI Plan", icon: "robot", color: "#2c5aa0", screen: "AI Planner" },
];

// Special offers data
const specialOffers = [
  {
    id: "1",
    title: "30% Off Yala Safari",
    subtitle: "Book before Dec 31",
    image: "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/a2345362-8172-4329-9fc7-010cf2a19b25/The+Common+Wanderer-8796-2.jpg",
    discount: "30%",
  },
  {
    id: "2",
    title: "Beach Resort Deal",
    subtitle: "3 nights for price of 2",
    image: "https://picsum.photos/400/200?beach",
    discount: "33%",
  },
];

const HomeScreen = ({ navigation }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [topPlaces, setTopPlaces] = useState([]); // State for Top Places
  const { logout, user } = useAuth(); // Get user from auth context
  const scrollX = useRef(new Animated.Value(0)).current;
  const heroScrollRef = useRef(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Auto-scroll hero carousel
  useEffect(() => {
    // Load Top Places
    const loadPlaces = async () => {
      const places = await getTopPlaces();
      if (places && places.length > 0) {
        setTopPlaces(places);
      }
    };
    loadPlaces();

    // Animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const interval = setInterval(() => {
      const nextSlide = (activeSlide + 1) % featuredDestinations.length;
      heroScrollRef.current?.scrollToOffset({
        offset: nextSlide * (width - 25),
        animated: true,
      });
      setActiveSlide(nextSlide);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeSlide]);

  const handleProfilePress = () => {
    setProfileMenuVisible(true);
  };

  const handleLogout = () => {
    setProfileMenuVisible(false);
    setTimeout(() => {
      logout();
    }, 300); // Wait for menu close animation
  };

  const handleNotificationPress = () => {
    console.log("Notifications pressed");
  };

  const handleQuickAction = (action) => {
    navigation.navigate("MainTabs", { screen: action.screen });
  };

  const renderHeroItem = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      style={styles.heroSlide}
      onPress={() => console.log("Featured:", item.name)}
    >
      <Image source={{ uri: item.image }} style={styles.heroImage} />
      <View style={styles.heroOverlay} />
      <View style={styles.heroContent}>
        <Text style={styles.heroTagline}>{item.tagline}</Text>
        <Text style={styles.heroTitle}>{item.name}</Text>
        <TouchableOpacity style={styles.heroButton}>
          <Text style={styles.heroButtonText}>Explore Now</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderQuickAction = ({ item }) => (
    <TouchableOpacity
      style={styles.quickActionItem}
      onPress={() => handleQuickAction(item)}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: item.color + "15" }]}>
        <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
      </View>
      <Text style={styles.quickActionText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderCategoryCard = ({ item }) => (
    <CategoryCard
      item={item}
      onPress={(item) => console.log("Category pressed:", item.title)}
    />
  );

  const renderDistrictCard = ({ item }) => (
    <DistrictCard item={item} navigation={navigation} />
  );

  const renderPlaceCard = ({ item }) => (
    <View style={{ marginRight: 15 }}>
      <PlaceCard
        item={item}
        getCategoryIcon={(categoryName) => getCategoryIcon(categoryName, catergory)}
        rank={topPlaces.length > 0 ? topPlaces.findIndex((p) => p.id === item.id) + 1 : tempTop10.indexOf(item) + 1}
        navigation={navigation}
      />
    </View>
  );

  const renderHotelCard = ({ item }) => (
    <HotelCard item={item} responsiveWidth={width} />
  );

  const renderOfferCard = ({ item }) => (
    <TouchableOpacity style={styles.offerCard} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.offerImage} />
      <View style={styles.offerOverlay} />
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{item.discount}</Text>
        <Text style={styles.discountLabel}>OFF</Text>
      </View>
      <View style={styles.offerContent}>
        <Text style={styles.offerTitle}>{item.title}</Text>
        <Text style={styles.offerSubtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Header
          onProfilePress={handleProfilePress}
          onNotificationPress={handleNotificationPress}
          userName={user?.firstName}
        />

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate("Explore")}
          activeOpacity={0.8}
        >
          <MaterialIcons name="search" size={22} color="#999" />
          <Text style={styles.searchPlaceholder}>
            Search destinations, hotels, tours...
          </Text>
          <View style={styles.searchFilter}>
            <MaterialIcons name="tune" size={20} color="#2c5aa0" />
          </View>
        </TouchableOpacity>

        {/* Hero Carousel */}
        <View style={styles.heroSection}>
          <FlatList
            ref={heroScrollRef}
            data={featuredDestinations}
            renderItem={renderHeroItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 25}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.heroList}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (width - 25));
              setActiveSlide(index);
            }}
          />
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {featuredDestinations.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  activeSlide === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <FlatList
            data={quickActions}
            renderItem={renderQuickAction}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsList}
          />
        </View>

        {/* Weather Widget */}
        <View style={styles.weatherWidget}>
          <View style={styles.weatherLeft}>
            <Text style={styles.weatherIcon}>☀️</Text>
            <View>
              <Text style={styles.weatherTemp}>28°C</Text>
              <Text style={styles.weatherLocation}>Colombo, Sri Lanka</Text>
            </View>
          </View>
          <View style={styles.weatherRight}>
            <Text style={styles.weatherCondition}>Sunny</Text>
            <Text style={styles.weatherHint}>Perfect for exploring!</Text>
          </View>
        </View>

        {/* Special Offers */}
        <View style={styles.section}>
          <SectionHeader
            title="🔥 Special Offers"
            onSeeAllPress={() => console.log("See all offers")}
          />
          <FlatList
            data={specialOffers}
            renderItem={renderOfferCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offersList}
          />
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Explore Categories"
            onSeeAllPress={() => navigation.navigate("Explore")}
          />
          <FlatList
            data={catergory}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* --- Top 10 Places --- */}
        <View style={styles.section}>
          <SectionHeader
            title="Top 10 Places"
            onSeeAllPress={() => navigation.navigate("Explore", { type: "Places" })}
          />
          <FlatList
            data={topPlaces.length > 0 ? topPlaces : tempTop10}
            renderItem={renderPlaceCard}
            keyExtractor={(item, index) => item.id || index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.placesList}
          />
        </View>

        {/* Districts Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Explore by District"
            onSeeAllPress={() => console.log("See all districts")}
          />
          <FlatList
            data={districs}
            renderItem={renderDistrictCard}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.districtList}
          />
        </View>




        <View style={styles.section}>
          <SectionHeader
            title="🏨 Top Hotels & Resorts"
            onSeeAllPress={() => console.log("See all hotels")}
          />
          <FlatList
            data={topHotels}
            renderItem={renderHotelCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hotelList}
          />
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
      <ProfileMenu
        visible={profileMenuVisible}
        onClose={() => setProfileMenuVisible(false)}
        onLogout={handleLogout}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  // Search Bar
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: "#999",
    marginLeft: 10,
  },
  searchFilter: {
    padding: 6,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  // Hero Carousel
  heroSection: {
    marginBottom: 20,
  },
  heroList: {
    paddingLeft: 20,
    paddingRight: 5,
  },
  heroSlide: {
    width: width - 55,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 15,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  heroContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },
  heroTagline: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#2c5aa0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  heroButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#2c5aa0",
    width: 24,
  },
  // Quick Actions
  quickActionsSection: {
    marginBottom: 20,
  },
  quickActionsList: {
    paddingHorizontal: 20,
  },
  quickActionItem: {
    alignItems: "center",
    marginRight: 20,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  // Weather Widget
  weatherWidget: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#bbdefb",
  },
  weatherLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  weatherIcon: {
    fontSize: 36,
  },
  weatherTemp: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c5aa0",
  },
  weatherLocation: {
    fontSize: 12,
    color: "#666",
  },
  weatherRight: {
    alignItems: "flex-end",
  },
  weatherCondition: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  weatherHint: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  // Sections
  section: {
    marginBottom: 25,
  },
  categoryList: {
    paddingHorizontal: 20,
  },
  districtList: {
    paddingHorizontal: 20,
  },
  placesList: {
    paddingHorizontal: 20,
  },
  // Special Offers
  offersList: {
    paddingHorizontal: 20,
  },
  offerCard: {
    width: 260,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 15,
  },
  offerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  offerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#e53935",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  discountText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  discountLabel: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  offerContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 15,
  },
  offerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  offerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 4,
  },
  hotelList: {
    paddingHorizontal: 20,
  },
});

export default HomeScreen;
