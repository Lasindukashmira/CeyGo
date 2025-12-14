import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import SectionHeader from "../Components/SectionHeader";
import PlaceCard from "../Components/PlaceCard";
import HotelCard from "../Components/HotelCard";

const { width } = Dimensions.get("window");

// --- Rich Dummy Data for Districts ---
const districtDetailsMap = {
  Galle: {
    description:
      "Galle is the jewel of the south, a UNESCO World Heritage Site that perfectly blends colonial history with tropical beauty. Famous for its 17th-century Dutch Fort, cobblestone streets, and pristine beaches, Galle offers a unique journey through time. Explore ancient ramparts, visit charming cafes, or relax on golden sands.",
    weather: { temp: "29°C", condition: "Sunny", icon: "weather-sunny" },
    stats: {
      visitors: "125k+",
      places: "25+",
      hotels: "40+",
      rating: "4.8"
    },
    famousFor: ["History", "Beaches", "Architecture", "Culture"],
    banner: "https://iainlakewindsvilla.com/wp-content/uploads/2020/07/beach_inns_website_tours_900x500px_galle-3.jpg",
    mapImage: "https://www.researchgate.net/publication/344374767/figure/fig1/AS:962180425719808@1606413987258/Map-of-Galle-District-in-Sri-Lanka.png",
  },
  Kandy: {
    description:
      "Kandy, the last royal capital of Sri Lanka, is nestled amidst misty hills and lush tea plantations. Home to the sacred Temple of the Tooth Relic, it is the center of the island's Buddhist culture. The city's scenic lake, botanical gardens, and vibrant cultural festivals make it a mesmerizing destination.",
    weather: { temp: "24°C", condition: "Cloudy", icon: "weather-cloudy" },
    stats: {
      visitors: "98k+",
      places: "30+",
      hotels: "55+",
      rating: "4.7"
    },
    famousFor: ["Temple", "Culture", "Mountains", "Tea"],
    banner: "https://cdn.britannica.com/19/118219-050-8BA0B67E/Dalada-Maligava-tooth-Buddha-Sri-Lanka-Kandy.jpg",
    mapImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kandy_district_location_map.svg/1200px-Kandy_district_location_map.svg.png",
  },
  Colombo: {
    description:
      "Colombo is the vibrant commercial capital of Sri Lanka, a bustling metropolis where modern skyscrapers meet colonial architecture. It offers a diverse mix of shopping, dining, and nightlife. From the Galle Face Green promenade to the lotus tower, Colombo is a city of contrasts and energy.",
    weather: { temp: "31°C", condition: "Partly Cloudy", icon: "weather-partly-cloudy" },
    stats: {
      visitors: "200k+",
      places: "45+",
      hotels: "80+",
      rating: "4.6"
    },
    famousFor: ["City Life", "Shopping", "Food", "Nightlife"],
    banner: "https://media.timeout.com/images/105241476/image.jpg",
    mapImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Colombo_district_location_map.svg/1200px-Colombo_district_location_map.svg.png",
  },
};

// Generic fallback data
const genericDistrictData = {
  description:
    "Explore the unique beauty and culture of this district. From scenic landscapes to historical landmarks, there is something for everyone to discover. Plan your trip and experience the best it has to offer.",
  weather: { temp: "28°C", condition: "Fair", icon: "weather-sunny" },
  stats: {
    visitors: "10k+",
    places: "10+",
    hotels: "15+",
    rating: "4.5"
  },
  famousFor: ["Nature", "Culture"],
  banner: "https://picsum.photos/800/600",
  mapImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Sri_Lanka_location_map.svg/664px-Sri_Lanka_location_map.svg.png",
};

// --- Sample Lists (Reusing your data structure) ---
const samplePlaces = [
  {
    name: "Galle Fort",
    rating: 4.7,
    image_urls: ["https://beyondescapes.com/uploads/excursions/BW4YPnXzX3u1.jpg"],
    category: ["History"],
    geolocation: { district: "Galle", province: "Southern" },
    description: "Famous Dutch Fort...",
    popularity_score: 9.2,
    amenities: [],
    tags: [],
  },
  {
    name: "Jungle Beach",
    rating: 4.5,
    image_urls: ["https://digitaltravelcouple.com/wp-content/uploads/2020/01/mirissa-beach-sri-lanka-1.jpg"],
    category: ["Nature"],
    geolocation: { district: "Galle", province: "Southern" },
    description: "Hidden beach...",
    popularity_score: 8.9,
    amenities: [],
    tags: [],
  },
];

const sampleHotels = [
  {
    id: "h1",
    name: "Galle Paradise Hotel",
    price: 45000,
    rating: 4.6,
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/480665653.jpg?k=3361848520286241280387431281878488888085858880858888808585888085&o=&hp=1",
    location: "Galle",
    amenities: ["wifi", "pool", "spa"],
    tags: ["Luxury"],
  },
  {
    id: "h2",
    name: "Seaside Resort",
    price: 35000,
    rating: 4.8,
    image: "https://sitecore-cd-imgr.shangri-la.com/MediaFiles/3/2/E/%7B32E7B782-723A-4217-916A-875697690382%7D201126_SLHT_Exterior_Dusk.jpg",
    location: "Galle",
    amenities: ["wifi", "beach"],
    tags: ["Beachfront"],
  },
];

const sampleTours = [
  {
    id: "t1",
    name: "Galle City Tour",
    price: 5000,
    rating: 4.5,
    image: "https://cdn.britannica.com/19/118219-050-8BA0B67E/Dalada-Maligava-tooth-Buddha-Sri-Lanka-Kandy.jpg",
    location: "Galle City",
    amenities: ["bus", "camera"],
    tags: ["Culture"],
  },
];

// Helper component for Stat Item
const StatItem = ({ icon, value, label, color }) => (
  <View style={styles.statItem}>
    <View style={[styles.statIconBox, { backgroundColor: color + "15" }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const DistrictDetailsScreen = ({ route, navigation }) => {
  const { districtName, province, image: paramImage } = route.params || {};

  // Handle missing params safely
  if (!districtName) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>District data not found.</Text>
      </View>
    );
  }

  // Get detailed data or fallback
  const details = districtDetailsMap[districtName] || genericDistrictData;
  const stats = details.stats || genericDistrictData.stats;
  const bannerImage = details.banner !== "https://picsum.photos/800/600"
    ? { uri: details.banner }
    : paramImage
      ? paramImage
      : { uri: genericDistrictData.banner };

  const renderPlaceCard = ({ item }) => (
    <PlaceCard
      item={item}
      getCategoryIcon={() => <MaterialIcons name="star" size={12} color="#2c5aa0" />}
      rank={null}
      navigation={navigation}
      isCompact={true}
    />
  );

  const renderHotelCard = ({ item }) => (
    <HotelCard item={item} responsiveWidth={width} />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* --- Hero Section --- */}
        <View style={styles.heroContainer}>
          <Image source={bannerImage} style={styles.heroImage} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.heroGradient}
          />

          {/* Header Actions */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="share" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="favorite-border" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* District Title */}
          <View style={styles.heroContent}>
            <View style={styles.provinceBadge}>
              <MaterialCommunityIcons name="map-marker" size={12} color="#fff" />
              <Text style={styles.provinceText}>{province}</Text>
            </View>
            <Text style={styles.districtTitle}>{districtName}</Text>
          </View>
        </View>

        {/* --- Weather & Stats Wrapper --- */}
        <View style={styles.weatherStatsWrapper}>
          {/* Weather Widget */}
          <View style={styles.weatherCard}>
            <View style={styles.weatherIconBox}>
              <MaterialCommunityIcons name={details.weather.icon} size={32} color="#FF9800" />
            </View>
            <View>
              <Text style={styles.weatherTemp}>{details.weather.temp}</Text>
              <Text style={styles.weatherCondition}>{details.weather.condition}</Text>
            </View>
            <View style={styles.weatherDivider} />
            <View>
              <Text style={styles.weatherLabel}>Best Time</Text>
              <Text style={styles.weatherValue}>Dec - Apr</Text>
            </View>
          </View>

          {/* Statistics Row */}
          <View style={styles.statsRow}>
            <StatItem icon="account-group" value={stats.visitors} label="Visitors" color="#2c5aa0" />
            <View style={styles.statDivider} />
            <StatItem icon="map-marker-star" value={stats.places} label="Places" color="#E65100" />
            <View style={styles.statDivider} />
            <StatItem icon="star" value={stats.rating} label="Rating" color="#F9A825" />
          </View>
        </View>

        {/* --- About Section --- */}
        <View style={styles.contentSection}>
          <Text style={styles.descriptionText}>{details.description}</Text>

          <View style={styles.famousForSection}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="sparkles" size={18} color="#FF9800" />
              <Text style={styles.famousTitle}>Famous For</Text>
            </View>
            <View style={styles.tagsContainer}>
              {details.famousFor.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <MaterialIcons name="check-circle" size={14} color="#2c5aa0" />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* --- Map Preview --- */}
        <View style={styles.section}>
          <SectionHeader title="Location" onSeeAllPress={() => { }} hideSeeAll={true} />
          <View style={styles.mapCard}>
            <Image source={{ uri: details.mapImage }} style={styles.mapImage} resizeMode="cover" />
            <View style={styles.mapOverlay}>
              <TouchableOpacity style={styles.viewMapButton}>
                <MaterialIcons name="map" size={18} color="#fff" />
                <Text style={styles.viewMapText}>View on Map</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- Top Places --- */}
        <View style={styles.section}>
          <SectionHeader
            title={`Top Places in ${districtName}`}
            onSeeAllPress={() => navigation.navigate("Explore", { district: districtName })}
          />
          <FlatList
            data={samplePlaces}
            renderItem={renderPlaceCard}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>

        {/* --- Hotels --- */}
        <View style={styles.section}>
          <SectionHeader
            title="Where to Stay"
            onSeeAllPress={() => navigation.navigate("Explore", { type: "Hotels", district: districtName })}
          />
          <FlatList
            data={sampleHotels}
            renderItem={renderHotelCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>

        {/* --- Tours --- */}
        <View style={styles.section}>
          <SectionHeader
            title="Experiences & Tours"
            onSeeAllPress={() => navigation.navigate("Explore", { type: "Tours", district: districtName })}
          />
          {/* Reusing Hotel Card style for tours for now, or just placeholders */}
          <FlatList
            data={sampleTours}
            renderItem={renderHotelCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  // Hero
  heroContainer: {
    height: 350,
    width: "100%",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  headerBar: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)", // Works on some versions, ignored on others
  },
  heroContent: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
  },
  provinceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    gap: 4,
  },
  provinceText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  districtTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  // Weather & Stats
  weatherStatsWrapper: {
    paddingHorizontal: 20,
    marginTop: -40,
    marginBottom: 20,
  },
  weatherCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 15,
  },
  weatherIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  weatherTemp: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  weatherCondition: {
    fontSize: 13,
    color: "#666",
  },
  weatherDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#eee",
    marginHorizontal: 20,
  },
  weatherLabel: {
    fontSize: 11,
    color: "#888",
  },
  weatherValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    justifyContent: "center",
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#eee",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
  },
  // Content & Tags
  contentSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#444",
    marginBottom: 20, // Increased spacing
  },
  famousForSection: {
    backgroundColor: "#F5F9FF",
    padding: 15,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2c5aa0",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  famousTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c5aa0",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tagText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
  },
  // Map
  section: {
    marginBottom: 25,
  },
  mapCard: {
    marginHorizontal: 20,
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#eee",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewMapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c5aa0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  viewMapText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  // List
  listContent: {
    paddingHorizontal: 20,
  },
});

export default DistrictDetailsScreen;
