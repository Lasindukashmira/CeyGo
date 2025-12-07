import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

const DistrictCard = ({ item, navigation }) => {
  const handleDistrictPress = () => {
    navigation.navigate("DistrictDetails", {
      districtName: item.name,
      province: item.province,
    });
  };
  return (
    <TouchableOpacity style={styles.districtCard} onPress={handleDistrictPress}>
      <Image source={item.image} style={styles.districtImage} />
      <View style={styles.districtInfo}>
        <Text style={styles.districtName}>{item.name}</Text>
        <Text style={styles.districtProvince}>{item.province}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  districtCard: {
    width: 140,
    marginRight: 15,
    borderRadius: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  districtImage: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    resizeMode: "cover",
  },
  districtInfo: {
    padding: 12,
  },
  districtName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  districtProvince: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});

export default DistrictCard;
