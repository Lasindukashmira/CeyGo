import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    StatusBar,
    FlatList,
    Image,
    RefreshControl,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const ProviderDashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalServices: 0,
        totalViews: 0,
        totalReviews: 0,
        totalFavorites: 0,
    });

    const providerProfile = user?.providerProfile || {};

    // Refresh services whenever screen is focused
    useFocusEffect(
        React.useCallback(() => {
            fetchServices();
        }, [user?.uid])
    );

    const fetchServices = async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        try {
            console.log("Fetching services for provider:", user.uid);
            const q = query(
                collection(db, "services"),
                where("providerId", "==", user.uid),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            console.log("Found services counts:", snapshot.size);
            const servicesList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setServices(servicesList);

            // Calculate stats
            const totalViews = servicesList.reduce((sum, s) => sum + (s.viewCount || 0), 0);
            const totalReviews = servicesList.reduce((sum, s) => sum + (s.reviewCount || 0), 0);
            const totalFavorites = servicesList.reduce((sum, s) => sum + (s.favoriteCount || 0), 0);

            setStats({
                totalServices: servicesList.length,
                totalViews,
                totalReviews,
                totalFavorites,
            });
        } catch (error) {
            console.error("Dashboard fetch error details:", error);
            // If it's a "failed-precondition" error, it usually means index is missing
            if (error.code === "failed-precondition") {
                console.log("CRITICAL: Missing composite index for services query. Check the URL in the error message.");
            }

            setServices([]);
            setStats({
                totalServices: 0,
                totalViews: 0,
                totalReviews: 0,
                totalFavorites: 0,
            });
        }
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchServices();
        setRefreshing(false);
    };

    const getVerificationBadge = () => {
        const status = providerProfile.verificationStatus;
        if (status === "verified") {
            return { label: "Verified", color: "#4CAF50", icon: "verified" };
        } else if (status === "rejected") {
            return { label: "Rejected", color: "#e53935", icon: "cancel" };
        }
        return { label: "Pending Review", color: "#FF9800", icon: "schedule" };
    };

    const badge = getVerificationBadge();

    // Map business type to primary service action
    const getBusinessTypeConfig = () => {
        const businessType = providerProfile.businessType;
        const configs = {
            tour_operator: {
                id: "tour",
                label: "Add Tour",
                icon: "map-marker-path",
                color: "#2c5aa0",
                description: "Create a new tour or experience"
            },
            hotel: {
                id: "hotel",
                label: "Add Property",
                icon: "bed",
                color: "#e91e63",
                description: "Add a room or accommodation"
            },
            restaurant: {
                id: "restaurant",
                label: "Add Restaurant",
                icon: "silverware-fork-knife",
                color: "#ff9800",
                description: "List your restaurant"
            },
            attraction: {
                id: "attraction",
                label: "Add Attraction",
                icon: "camera",
                color: "#4caf50",
                description: "Add an attraction or activity"
            },
            transport: {
                id: "tour",
                label: "Add Service",
                icon: "car",
                color: "#9c27b0",
                description: "Add a transport service"
            },
            other: {
                id: "tour",
                label: "Add Service",
                icon: "plus-circle",
                color: "#607d8b",
                description: "Add a new service"
            },
        };
        return configs[businessType] || configs.tour_operator;
    };

    const primaryAction = getBusinessTypeConfig();

    const handleQuickAction = (actionId) => {
        switch (actionId) {
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
                navigation.navigate("ServiceTypeSelection");
        }
    };

    const renderServiceCard = ({ item }) => (
        <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => navigation.navigate("EditService", { service: item })}
        >
            <Image
                source={{ uri: item.coverImage || item.images?.[0] || "https://via.placeholder.com/150" }}
                style={styles.serviceImage}
            />
            <View style={styles.serviceContent}>
                <View style={styles.serviceHeader}>
                    <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.statusBadge, item.status === "active" ? styles.statusActive : styles.statusInactive]}>
                        <Text style={styles.statusText}>
                            {item.status === "active" ? "Active" : "Inactive"}
                        </Text>
                    </View>
                </View>
                <Text style={styles.serviceType}>{item.type?.toUpperCase()}</Text>
                <View style={styles.serviceStats}>
                    <View style={styles.serviceStat}>
                        <MaterialCommunityIcons name="eye" size={14} color="#666" />
                        <Text style={styles.serviceStatText}>{item.viewCount || 0}</Text>
                    </View>
                    <View style={styles.serviceStat}>
                        <MaterialCommunityIcons name="heart" size={14} color="#e53935" />
                        <Text style={styles.serviceStatText}>{item.favoriteCount || 0}</Text>
                    </View>
                    <View style={styles.serviceStat}>
                        <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                        <Text style={styles.serviceStatText}>{item.avgRating || "N/A"}</Text>
                    </View>
                </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header */}
            <LinearGradient colors={["#2c5aa0", "#1e3d6f"]} style={styles.header}>
                <SafeAreaView style={styles.headerContent}>
                    <View style={styles.headerRow}>
                        {navigation.canGoBack() && (
                            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                                <MaterialIcons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.headerTitle}>Provider Dashboard</Text>
                        <TouchableOpacity style={styles.settingsBtn}>
                            <MaterialIcons name="settings" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Business Info */}
                    <View style={styles.businessInfo}>
                        <View style={styles.businessIcon}>
                            <MaterialCommunityIcons name="briefcase" size={28} color="#2c5aa0" />
                        </View>
                        <View style={styles.businessDetails}>
                            <Text style={styles.businessName}>
                                {providerProfile.businessName || "Your Business"}
                            </Text>
                            <View style={[styles.verificationBadge, { backgroundColor: badge.color }]}>
                                <MaterialIcons name={badge.icon} size={12} color="#fff" />
                                <Text style={styles.verificationText}>{badge.label}</Text>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2c5aa0"]} />
                }
            >
                {/* Stats Card */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="briefcase-check" size={24} color="#2c5aa0" />
                        <Text style={styles.statValue}>{stats.totalServices}</Text>
                        <Text style={styles.statLabel}>Services</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="eye" size={24} color="#9C27B0" />
                        <Text style={styles.statValue}>{stats.totalViews}</Text>
                        <Text style={styles.statLabel}>Views</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
                        <Text style={styles.statValue}>{stats.totalReviews}</Text>
                        <Text style={styles.statLabel}>Reviews</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="heart" size={24} color="#e53935" />
                        <Text style={styles.statValue}>{stats.totalFavorites}</Text>
                        <Text style={styles.statLabel}>Favorites</Text>
                    </View>
                </View>

                {/* Primary Action - Based on Business Type */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Add New Service</Text>
                    <TouchableOpacity
                        style={styles.primaryActionCard}
                        onPress={() => handleQuickAction(primaryAction.id)}
                    >
                        <View style={[styles.primaryActionIcon, { backgroundColor: primaryAction.color + "20" }]}>
                            <MaterialCommunityIcons name={primaryAction.icon} size={32} color={primaryAction.color} />
                        </View>
                        <View style={styles.primaryActionContent}>
                            <Text style={styles.primaryActionLabel}>{primaryAction.label}</Text>
                            <Text style={styles.primaryActionDesc}>{primaryAction.description}</Text>
                        </View>
                        <MaterialIcons name="arrow-forward" size={24} color={primaryAction.color} />
                    </TouchableOpacity>

                    {/* Add Other Service Type Link */}
                    <TouchableOpacity
                        style={styles.addOtherBtn}
                        onPress={() => navigation.navigate("ServiceTypeSelection")}
                    >
                        <MaterialIcons name="add-circle-outline" size={18} color="#2c5aa0" />
                        <Text style={styles.addOtherText}>Add a different service type</Text>
                    </TouchableOpacity>
                </View>

                {/* My Services */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>My Services</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("ServiceTypeSelection")}>
                            <Text style={styles.seeAllText}>+ Add New</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>Loading...</Text>
                        </View>
                    ) : services.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="folder-open-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyStateTitle}>No Services Yet</Text>
                            <Text style={styles.emptyStateText}>
                                Start by adding your first service to reach tourists
                            </Text>
                            <TouchableOpacity
                                style={styles.addFirstBtn}
                                onPress={() => navigation.navigate("ServiceTypeSelection")}
                            >
                                <MaterialIcons name="add" size={20} color="#fff" />
                                <Text style={styles.addFirstBtnText}>Add Your First Service</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            {services.map((item) => (
                                <View key={item.id}>
                                    {renderServiceCard({ item })}
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>

            {/* Floating Add Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("ServiceTypeSelection")}
            >
                <LinearGradient
                    colors={["#2c5aa0", "#1e3d6f"]}
                    style={styles.fabGradient}
                >
                    <MaterialIcons name="add" size={28} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
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
    settingsBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    businessInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
    },
    businessIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    businessDetails: {
        marginLeft: 15,
        flex: 1,
    },
    businessName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    verificationBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
        marginTop: 6,
        gap: 4,
    },
    verificationText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "600",
    },
    scrollView: {
        flex: 1,
        marginTop: -15,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        backgroundColor: "#f5f5f5",
        paddingTop: 20,
    },
    statsCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
        marginTop: 6,
    },
    statLabel: {
        fontSize: 11,
        color: "#888",
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: "#e0e0e0",
        marginVertical: 5,
    },
    section: {
        marginTop: 25,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    seeAllText: {
        fontSize: 14,
        color: "#2c5aa0",
        fontWeight: "600",
    },
    primaryActionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        marginTop: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    primaryActionIcon: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    primaryActionContent: {
        flex: 1,
        marginLeft: 15,
    },
    primaryActionLabel: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    primaryActionDesc: {
        fontSize: 13,
        color: "#888",
        marginTop: 3,
    },
    addOtherBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        paddingVertical: 10,
        gap: 6,
    },
    addOtherText: {
        fontSize: 14,
        color: "#2c5aa0",
        fontWeight: "500",
    },
    quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    quickActionCard: {
        width: (width - 52) / 4,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    quickActionLabel: {
        fontSize: 11,
        color: "#333",
        fontWeight: "600",
        marginTop: 8,
        textAlign: "center",
    },
    serviceCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 12,
        padding: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    serviceImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: "#f0f0f0",
    },
    serviceContent: {
        flex: 1,
        marginLeft: 12,
    },
    serviceHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    serviceName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1a1a1a",
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    statusActive: {
        backgroundColor: "#e8f5e9",
    },
    statusInactive: {
        backgroundColor: "#ffebee",
    },
    statusText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#4CAF50",
    },
    serviceType: {
        fontSize: 11,
        color: "#888",
        fontWeight: "500",
        marginTop: 3,
    },
    serviceStats: {
        flexDirection: "row",
        marginTop: 8,
        gap: 15,
    },
    serviceStat: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    serviceStatText: {
        fontSize: 12,
        color: "#666",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
        backgroundColor: "#fff",
        borderRadius: 20,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        marginTop: 15,
    },
    emptyStateText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        marginTop: 8,
        paddingHorizontal: 30,
    },
    addFirstBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2c5aa0",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 20,
        gap: 6,
    },
    addFirstBtnText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    fab: {
        position: "absolute",
        bottom: 25,
        right: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default ProviderDashboardScreen;
