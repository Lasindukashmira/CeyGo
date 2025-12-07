import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const ReviewsModal = ({ visible, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Dummy data fetcher (replace with actual API call)
  const fetchReviews = async (pageNumber = 1) => {
    setLoadingMore(true);
    // Simulate API fetch delay
    await new Promise((res) => setTimeout(res, 800));

    const newReviews = Array.from({ length: 5 }).map((_, index) => ({
      id: `review-${pageNumber}-${index}`,
      username: `User ${index + 1 + (pageNumber - 1) * 5}`,
      userImage: "https://via.placeholder.com/50",
      rating: Math.floor(Math.random() * 5) + 1,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut turpis ac nulla feugiat consequat. sdf sdf sdf sdf sdf sdf sdf sdf sdf sdf sd fsd fsd ",
      likes: Math.floor(Math.random() * 50),
      liked: false,
    }));

    setReviews((prev) => [...prev, ...newReviews]);
    setLoadingMore(false);

    if (pageNumber >= 4) setHasMore(false); // simulate no more data after 4 pages
  };

  useEffect(() => {
    if (visible) {
      setReviews([]);
      setPage(1);
      setHasMore(true);
      fetchReviews(1);
    }
  }, [visible]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReviews(nextPage);
    }
  };

  const toggleLike = (id) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              liked: !r.liked,
              likes: r.liked ? r.likes - 1 : r.likes + 1,
            }
          : r
      )
    );
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.userRow}>
        <Image source={{ uri: item.userImage }} style={styles.userImage} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.username}>{item.username}</Text>
          <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, index) => (
              <MaterialIcons
                key={index}
                name={index < item.rating ? "star" : "star-border"}
                size={16}
                color="#FFD700"
              />
            ))}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => toggleLike(item.id)}
          style={styles.likeButton}
        >
          <MaterialIcons
            name={item.liked ? "favorite" : "favorite-border"}
            size={22}
            color={item.liked ? "#FF4C4C" : "#666"}
          />
          <Text style={styles.likeCount}>{item.likes}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ratings & Reviews</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={renderReview}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore && <ActivityIndicator size="small" color="#2c5aa0" />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    maxHeight: "90%",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeText: {
    fontSize: 16,
    color: "#2c5aa0",
    fontWeight: "600",
  },
  reviewCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  username: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  starsRow: {
    flexDirection: "row",
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
});

export default ReviewsModal;
