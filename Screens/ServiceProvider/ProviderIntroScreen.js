import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    StatusBar,
    Image,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../AuthContext";

const { width, height } = Dimensions.get("window");

const ProviderIntroScreen = ({ navigation }) => {
    const { user } = useAuth();
    const isProvider = user?.role === "service_provider";

    const benefits = [
        {
            icon: "trending-up",
            iconLib: MaterialIcons,
            title: "Grow Your Business",
            description: "Reach thousands of tourists looking for authentic Sri Lankan experiences",
            color: "#4CAF50",
        },
        {
            icon: "account-group",
            iconLib: MaterialCommunityIcons,
            title: "Connect with Travelers",
            description: "Build relationships with tourists from around the world",
            color: "#2196F3",
        },
        {
            icon: "wallet",
            iconLib: MaterialCommunityIcons,
            title: "Increase Revenue",
            description: "List your services and receive bookings directly through the app",
            color: "#FF9800",
        },
        {
            icon: "shield-check",
            iconLib: MaterialCommunityIcons,
            title: "Trusted Platform",
            description: "Join a verified community of tourism professionals",
            color: "#9C27B0",
        },
    ];

    const serviceTypes = [
        { icon: "map-marker-path", label: "Tours & Experiences", color: "#2c5aa0" },
        { icon: "bed", label: "Hotels & Stays", color: "#e91e63" },
        { icon: "silverware-fork-knife", label: "Restaurants", color: "#ff9800" },
        { icon: "camera", label: "Attractions", color: "#4caf50" },
    ];

    const handleGetStarted = () => {
        if (isProvider) {
            navigation.navigate("ProviderDashboard");
        } else {
            navigation.navigate("ProviderRegistration");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Hero Section with Gradient */}
            <LinearGradient
                colors={["#2c5aa0", "#1e3d6f", "#0d1f3c"]}
                style={styles.heroGradient}
            >
                <SafeAreaView style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                </SafeAreaView>

                <View style={styles.heroContent}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="briefcase-account" size={48} color="#fff" />
                    </View>
                    <Text style={styles.heroTitle}>Become a Service Provider</Text>
                    <Text style={styles.heroSubtitle}>
                        Share your passion for Sri Lanka and grow your tourism business
                    </Text>
                </View>

                {/* Service Type Pills */}
                <View style={styles.serviceTypesRow}>
                    {serviceTypes.map((type, index) => (
                        <View key={index} style={[styles.serviceTypePill, { backgroundColor: type.color }]}>
                            <MaterialCommunityIcons name={type.icon} size={16} color="#fff" />
                            <Text style={styles.serviceTypePillText}>{type.label}</Text>
                        </View>
                    ))}
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Benefits Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Why Join CeyGo?</Text>
                    <View style={styles.benefitsGrid}>
                        {benefits.map((benefit, index) => {
                            const IconLib = benefit.iconLib;
                            return (
                                <View key={index} style={styles.benefitCard}>
                                    <View style={[styles.benefitIcon, { backgroundColor: benefit.color + "20" }]}>
                                        <IconLib name={benefit.icon} size={28} color={benefit.color} />
                                    </View>
                                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                                    <Text style={styles.benefitDescription}>{benefit.description}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* How It Works Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How It Works</Text>
                    <View style={styles.stepsContainer}>
                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Register Your Business</Text>
                                <Text style={styles.stepDesc}>Fill in your business details and create your provider profile</Text>
                            </View>
                        </View>
                        <View style={styles.stepConnector} />
                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>List Your Services</Text>
                                <Text style={styles.stepDesc}>Add tours, hotels, restaurants, or attractions with photos and pricing</Text>
                            </View>
                        </View>
                        <View style={styles.stepConnector} />
                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Start Receiving Bookings</Text>
                                <Text style={styles.stepDesc}>Connect with tourists and grow your business</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>10K+</Text>
                        <Text style={styles.statLabel}>Active Tourists</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>500+</Text>
                        <Text style={styles.statLabel}>Service Providers</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>25K+</Text>
                        <Text style={styles.statLabel}>Bookings Made</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom CTA */}
            <View style={styles.bottomCTA}>
                <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
                    <LinearGradient
                        colors={["#2c5aa0", "#1e3d6f"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.ctaGradient}
                    >
                        <Text style={styles.ctaText}>
                            {isProvider ? "Go to Dashboard" : "Get Started"}
                        </Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
                {!isProvider && (
                    <Text style={styles.ctaSubtext}>Free to join • No hidden fees</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    heroGradient: {
        paddingBottom: 30,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    heroContent: {
        alignItems: "center",
        paddingHorizontal: 30,
        paddingTop: 20,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#fff",
        textAlign: "center",
        marginBottom: 12,
    },
    heroSubtitle: {
        fontSize: 16,
        color: "rgba(255,255,255,0.8)",
        textAlign: "center",
        lineHeight: 24,
    },
    serviceTypesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: 25,
        paddingHorizontal: 10,
        gap: 8,
    },
    serviceTypePill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    serviceTypePillText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    scrollView: {
        flex: 1,
        marginTop: -20,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        backgroundColor: "#f5f5f5",
    },
    scrollContent: {
        paddingTop: 30,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 20,
    },
    benefitsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 15,
    },
    benefitCard: {
        width: (width - 55) / 2,
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    benefitIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    benefitTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 6,
    },
    benefitDescription: {
        fontSize: 12,
        color: "#666",
        lineHeight: 18,
    },
    stepsContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    stepItem: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    stepNumber: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#2c5aa0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    stepNumberText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 13,
        color: "#666",
        lineHeight: 20,
    },
    stepConnector: {
        width: 2,
        height: 25,
        backgroundColor: "#e0e0e0",
        marginLeft: 17,
        marginVertical: 8,
    },
    statsSection: {
        flexDirection: "row",
        backgroundColor: "#fff",
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
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
        fontSize: 24,
        fontWeight: "800",
        color: "#2c5aa0",
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: "#e0e0e0",
        marginHorizontal: 10,
    },
    bottomCTA: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: Platform.OS === "ios" ? 30 : 20,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 10,
    },
    ctaButton: {
        borderRadius: 16,
        overflow: "hidden",
    },
    ctaGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        gap: 10,
    },
    ctaText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    ctaSubtext: {
        textAlign: "center",
        color: "#888",
        fontSize: 12,
        marginTop: 10,
    },
});

export default ProviderIntroScreen;
