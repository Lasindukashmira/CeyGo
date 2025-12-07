import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ReviewsModal from "./ReviewsModal";

const ReviewsSection = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [addReviewVisible, setAddReviewVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");

  const reviewsSummary = {
    averageRating: 4.5,
    totalReviews: 128,
    breakdown: { 5: 80, 4: 30, 3: 10, 2: 5, 1: 3 },
  };

  const bestReview = {
    username: "Emily Clark",
    rating: 5,
    comment: "This place is amazing! Loved every moment of it.",
  };

  const progressBarWidth = (count) => {
    const max = Math.max(...Object.values(reviewsSummary.breakdown));
    return (count / max) * 100 + "%";
  };

  const handleAddReviewSubmit = () => {
    console.log("Rating:", userRating);
    console.log("Comment:", userComment);
    setAddReviewVisible(false);
    setUserRating(0);
    setUserComment("");
  };

  return (
    <View style={styles.reviewsSection}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
          <Text style={styles.viewAllText}>View All</Text>
        </View>

        {/* Ratings Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.averageContainer}>
            <Text style={styles.averageRating}>
              {reviewsSummary.averageRating}
            </Text>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, index) => (
                <MaterialIcons
                  key={index}
                  name={
                    index < Math.round(reviewsSummary.averageRating)
                      ? "star"
                      : "star-border"
                  }
                  size={20}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text style={styles.totalReviews}>
              {reviewsSummary.totalReviews} Reviews
            </Text>
          </View>

          {/* Progress bars for breakdown */}
          <View style={styles.breakdownContainer}>
            {Object.keys(reviewsSummary.breakdown)
              .sort((a, b) => b - a)
              .map((star) => (
                <View key={star} style={styles.breakdownRow}>
                  <Text style={styles.starText}>{star}★</Text>
                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: progressBarWidth(
                            reviewsSummary.breakdown[star]
                          ),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.countText}>
                    {reviewsSummary.breakdown[star]}
                  </Text>
                </View>
              ))}
          </View>

          {/* Best review */}
          <View style={styles.bestReviewContainer}>
            <Text style={styles.bestReviewTitle}>Top Review</Text>
            <Text style={styles.bestReviewUser}>{bestReview.username}</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, index) => (
                <MaterialIcons
                  key={index}
                  name={index < bestReview.rating ? "star" : "star-border"}
                  size={16}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text style={styles.bestReviewComment}>{bestReview.comment}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Add Your Review Button */}
      <TouchableOpacity
        style={styles.addReviewButton}
        onPress={() => setAddReviewVisible(true)}
      >
        <MaterialIcons name="rate-review" size={20} color="#fff" />
        <Text style={styles.addReviewButtonText}>Add Your Review</Text>
      </TouchableOpacity>

      {/* Placeholder Modal for all reviews */}
      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>All Reviews</Text>
            <FlatList
              data={[1, 2, 3]} // dummy data
              keyExtractor={(item) => item.toString()}
              renderItem={() => (
                <View style={{ marginBottom: 15 }}>
                  <Text>User Review Placeholder</Text>
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}

      <ReviewsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      {/* Add Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addReviewVisible}
        onRequestClose={() => setAddReviewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Your Review</Text>

            {/* Star Rating */}
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setUserRating(index + 1)}
                >
                  <MaterialIcons
                    name={index < userRating ? "star" : "star-border"}
                    size={30}
                    color="#FFD700"
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment Input */}
            <TextInput
              style={styles.commentInput}
              placeholder="Write your review..."
              multiline
              value={userComment}
              onChangeText={setUserComment}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddReviewSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAddReviewVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  reviewsSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    color: "#2c5aa0",
    fontWeight: "600",
  },
  summaryContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 15,
  },
  averageContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  starsRow: {
    flexDirection: "row",
    marginVertical: 5,
  },
  totalReviews: {
    fontSize: 14,
    color: "#666",
  },
  breakdownContainer: {
    marginVertical: 10,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  starText: {
    width: 25,
    fontSize: 12,
    color: "#333",
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2c5aa0",
    borderRadius: 4,
  },
  countText: {
    width: 25,
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  bestReviewContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  bestReviewTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  bestReviewUser: {
    fontSize: 12,
    color: "#2c5aa0",
    marginBottom: 2,
  },
  bestReviewComment: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  addReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2c5aa0",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
  },
  addReviewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  commentInput: {
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: "#2c5aa0",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#ccc",
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ReviewsSection;
