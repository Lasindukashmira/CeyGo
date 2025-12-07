import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
} from "react-native";
import { catergory, districs, tempTop10 } from "../constData";
import Header from "../Components/Header";
import SearchBar from "../Components/SearchBar";
import SectionHeader from "../Components/SectionHeader";
import CategoryCard from "../Components/CategoryCard";
import DistrictCard from "../Components/DistrictCard";
import PlaceCard from "../Components/PlaceCard";
import { getCategoryIcon } from "../Components/CategoryIconUtils";
import { useAuth } from "../AuthContext";

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { logout } = useAuth();

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
    <PlaceCard
      item={item}
      getCategoryIcon={(categoryName) =>
        getCategoryIcon(categoryName, catergory)
      }
      rank={tempTop10.indexOf(item) + 1}
      navigation={navigation}
    />
  );

  const handleProfilePress = () => {
    console.log("Profile pressed");
    logout();
  };

  const handleSearch = () => {
    console.log("Search query:", searchQuery);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header onProfilePress={handleProfilePress} />

        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
        />

        {/* Categories Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Explore Categories"
            onSeeAllPress={() => console.log("See all categories")}
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

        {/* Top 10 Places Section */}
        <View style={styles.section}>
          <SectionHeader
            title="🏆 Top 10 Places in Sri Lanka"
            onSeeAllPress={() => console.log("See all top places")}
          />

          <FlatList
            data={tempTop10}
            renderItem={renderPlaceCard}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.placesList}
          />
        </View>
      </ScrollView>
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
  section: {
    marginBottom: 30,
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
  placeholderCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 40,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
});

export default HomeScreen;
