import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRef, useState } from "react";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

import FullScreenImageGalleryModal from "./FullScreenImageGalleryModal";
const { width, height } = Dimensions.get("window");

const ImageGallery = ({ placeImages, navigation }) => {
  const flatListRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const renderImageCarousel = ({ item, index }) => (
    <TouchableOpacity
      style={styles.carouselImageContainer}
      onPress={() => openFullScreenGallery(index)}
      activeOpacity={0.9}
    >
      <Image
        source={typeof item === "string" ? { uri: item } : item}
        style={styles.carouselImage}
        defaultSource={require("../../assets/cpic/History.jpg")}
      />
      <View style={styles.imageOverlay}>
        <MaterialIcons name="zoom-in" size={30} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  const renderThumbnail = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.thumbnailContainer,
        currentImageIndex === index && styles.activeThumbnail,
      ]}
      onPress={() => scrollToImage(index)}
    >
      <Image
        source={typeof item === "string" ? { uri: item } : item}
        style={styles.thumbnailImage}
        defaultSource={require("../../assets/cpic/History.jpg")}
      />
    </TouchableOpacity>
  );

  const handleImageScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentImageIndex(Math.round(index));
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFavoritePress = () => {
    setIsFavorited(!isFavorited);
    console.log(`${isFavorited ? "Removed from" : "Added to"} favorites:`);
  };

  const scrollToImage = (index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentImageIndex(index);
  };

  const openFullScreenGallery = (index) => {
    setGalleryIndex(index);
    setIsGalleryVisible(true);
  };

  const closeFullScreenGallery = () => {
    setIsGalleryVisible(false);
  };

  return (
    <View style={styles.imageGalleryContainer}>
      {/* Main Image Carousel */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={placeImages}
          renderItem={renderImageCarousel}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleImageScroll}
          style={styles.carousel}
        />

        {/* Image Indicators - Only show if more than 1 image */}
        {placeImages.length > 1 && (
          <View style={styles.imageIndicators}>
            {placeImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentImageIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
        >
          <MaterialIcons
            name={isFavorited ? "favorite" : "favorite-border"}
            size={24}
            color={isFavorited ? "#e74c3c" : "#fff"}
          />
        </TouchableOpacity>
      </View>

      {/* Thumbnail Gallery - Only show if more than 1 image */}
      {placeImages.length > 1 && (
        <View style={styles.thumbnailGallery}>
          <FlatList
            data={placeImages}
            renderItem={renderThumbnail}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
          />
        </View>
      )}

      <FullScreenImageGalleryModal
        isGalleryVisible={isGalleryVisible}
        closeFullScreenGallery={closeFullScreenGallery}
        placeImages={placeImages}
        galleryIndex={galleryIndex}
        setGalleryIndex={setGalleryIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageGalleryContainer: {
    backgroundColor: "#000",
  },
  carouselContainer: {
    height: height * 0.35,
    position: "relative",
  },
  carousel: {
    height: "100%",
  },
  carouselImageContainer: {
    width: width,
    height: "100%",
    position: "relative",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  imageIndicators: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#fff",
    width: 20,
  },
  thumbnailGallery: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  thumbnailList: {
    paddingHorizontal: 10,
  },
  thumbnailContainer: {
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumbnail: {
    borderColor: "#2c5aa0",
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ImageGallery;
