import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    StatusBar,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const serviceTypes = [
    {
        id: "tour",
        title: "Tour & Experience",
        description: "Guided tours, day trips, multi-day adventures",
        icon: "map-marker-path",
        color: "#2c5aa0",
        examples: "City tours, Safari, Cultural experiences",
    },
    {
        id: "hotel",
        title: "Accommodation",
        description: "Hotels, resorts, guest houses, villas",
        icon: "bed",
        color: "#e91e63",
        examples: "Hotels, Resorts, Homestays",
    },
    {
        id: "restaurant",
        title: "Restaurant",
        description: "Restaurants, cafes, food experiences",
        icon: "silverware-fork-knife",
        color: "#ff9800",
        examples: "Fine dining, Cafes, Street food",
    },
    {
        id: "attraction",
        title: "Attraction",
        description: "Tourist spots, activities, entertainment",
        icon: "camera",
        color: "#4caf50",
        examples: "Museums, Parks, Adventure activities",
    },
];

const ServiceTypeSelectionScreen = ({ navigation, route }) => {
    const preselected = route.params?.preselected;

    const handleSelectType = (type) => {
        switch (type.id) {
            case "tour":
                navigation.navigate("AddTour");
                break;
            case "hotel":
                navigation.navigate("AddHotel");
                break;
            case "restaurant":
                navigation.navigate("AddRestaurant");
                break;
            case "attraction":
                navigation.navigate("AddAttraction");
                break;
            default:
                navigation.navigate("AddTour");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header */}
            <LinearGradient colors={["#2c5aa0", "#1e3d6f"]} style={styles.header}>
                <SafeAreaView style={styles.headerContent}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add New Service</Text>
                        <View style={{ width: 44 }} />
                    </View>
                    <Text style={styles.headerSubtitle}>
                        What type of service would you like to offer?
                    </Text>
                </SafeAreaView>
            </LinearGradient>

            {/* Service Type Cards */}
            <View style={styles.cardsContainer}>
                {serviceTypes.map((type) => (
                    <TouchableOpacity
                        key={type.id}
                        style={styles.typeCard}
                        onPress={() => handleSelectType(type)}
                        activeOpacity={0.9}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: type.color + "15" }]}>
                            <MaterialCommunityIcons name={type.icon} size={36} color={type.color} />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{type.title}</Text>
                            <Text style={styles.cardDescription}>{type.description}</Text>
                            <Text style={styles.cardExamples}>{type.examples}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={28} color="#ccc" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Help Text */}
            <View style={styles.helpSection}>
                <MaterialCommunityIcons name="help-circle-outline" size={20} color="#888" />
                <Text style={styles.helpText}>
                    Not sure which to choose? You can always add more services later.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        paddingBottom: 25,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        paddingTop: 10,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
        marginTop: 15,
        textAlign: "center",
    },
    cardsContainer: {
        paddingHorizontal: 20,
        paddingTop: 25,
    },
    typeCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    cardContent: {
        flex: 1,
        marginLeft: 15,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    cardDescription: {
        fontSize: 13,
        color: "#666",
        marginTop: 4,
    },
    cardExamples: {
        fontSize: 11,
        color: "#999",
        marginTop: 4,
        fontStyle: "italic",
    },
    helpSection: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
        marginTop: 20,
        gap: 8,
    },
    helpText: {
        fontSize: 13,
        color: "#888",
        textAlign: "center",
        flex: 1,
    },
});

export default ServiceTypeSelectionScreen;
