import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import React, { useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const FullScreenImageGalleryModal = ({
  isGalleryVisible,
  closeFullScreenGallery,
  placeImages,
  galleryIndex,
  setGalleryIndex,
}) => {
  const galleryRef = useRef(null);

  const handleGalleryScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setGalleryIndex(Math.round(index));
  };
  return (
    <Modal
      visible={isGalleryVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeFullScreenGallery}
    >
      <View style={styles.fullScreenGallery}>
        <StatusBar hidden />

        {/* Gallery Header */}
        <View style={styles.galleryHeader}>
          <TouchableOpacity
            style={styles.galleryCloseButton}
            onPress={closeFullScreenGallery}
          >
            <MaterialIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.galleryCounter}>
            {galleryIndex + 1} / {placeImages.length}
          </Text>
          <View style={styles.galleryPlaceholder} />
        </View>

        {/* Full Screen Images */}
        <FlatList
          ref={galleryRef}
          data={placeImages}
          renderItem={({ item }) => (
            <Image
              source={typeof item === "string" ? { uri: item } : item}
              style={styles.fullScreenImage}
              defaultSource={require("../../assets/cpic/Beach.jpg")}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleGalleryScroll}
          initialScrollIndex={galleryIndex}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />

        {/* Gallery Indicators */}
        {placeImages.length > 1 && (
          <View style={styles.galleryIndicators}>
            {placeImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.galleryIndicator,
                  galleryIndex === index && styles.galleryActiveIndicator,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenGallery: {
    flex: 1,
    backgroundColor: "#000",
  },
  galleryHeader: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  galleryCloseButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryCounter: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  galleryPlaceholder: {
    width: 40,
  },
  fullScreenImage: {
    width: width,
    height: height,
    resizeMode: "contain",
  },
  galleryIndicators: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 4,
  },
  galleryActiveIndicator: {
    backgroundColor: "#fff",
    width: 20,
  },
});
export default FullScreenImageGalleryModal;
