import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    ImageBackground,
    ActivityIndicator,
    Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { catergory as PREFERENCE_CATEGORIES } from "../constData";

const { width } = Dimensions.get("window");

// Categories are now imported from constData.js as PREFERENCE_CATEGORIES

const OnboardingPreferencesScreen = ({ navigation, route }) => {
    const { user, refreshUser } = useAuth();
    // Support an "editMode" if accessed from profile
    const isEditMode = route.params?.isEditMode || false;
    
    // Initialize with existing preferences if available
    const [selectedPreferences, setSelectedPreferences] = useState(
        user?.preferences || []
    );
    const [saving, setSaving] = useState(false);

    const togglePreference = (id) => {
        setSelectedPreferences((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        if (!user?.uid) {
            Alert.alert("Error", "You must be logged in to save preferences.");
            return;
        }

        setSaving(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                preferences: selectedPreferences,
            });
            await refreshUser();
            
            if (isEditMode) {
                navigation.goBack();
                Alert.alert("Success", "Your travel interests have been updated.");
            } else {
                // Navigate to Main App if in onboarding flow
                navigation.reset({
                    index: 0,
                    routes: [{ name: "MainTabs" }],
                });
            }
        } catch (error) {
            console.error("Error saving preferences:", error);
            Alert.alert("Error", "Failed to save your preferences. Please try again.");
        }
        setSaving(false);
    };

    const handleSkip = () => {
        Alert.alert(
            "Skip Personalization?",
            "We use your interests to show you the best hotels, tours, and destinations.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Skip Anyways",
                    style: "destructive",
                    onPress: () => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "MainTabs" }],
                        });
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

            <View style={styles.header}>
                {isEditMode && (
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                )}
                <View style={styles.headerTextContainer}>
                    <Text style={styles.title}>{isEditMode ? "Your Interests" : "What do you love?"}</Text>
                    <Text style={styles.subtitle}>
                        {isEditMode 
                            ? "Update your travel preferences to tailor your feed." 
                            : "Select your interests to personalize your CeyGo experience."}
                    </Text>
                </View>
                {!isEditMode && (
                    <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.gridContainer}>
                {PREFERENCE_CATEGORIES.map((category) => {
                    const isSelected = selectedPreferences.includes(category.title);
                    return (
                        <TouchableOpacity
                            key={category.id}
                            style={styles.tileWrapper}
                            activeOpacity={0.8}
                            onPress={() => togglePreference(category.title)}
                        >
                            <ImageBackground
                                source={typeof category.image === 'string' ? { uri: category.image } : category.image}
                                style={styles.tileImage}
                                imageStyle={styles.tileImageStyle}
                            >
                                <View style={[styles.tileOverlay, isSelected && styles.tileOverlaySelected]}>
                                    {isSelected && (
                                        <View style={styles.checkBadge}>
                                            <MaterialIcons name="check" size={16} color="#fff" />
                                        </View>
                                    )}
                                    <LinearGradient
                                        colors={["transparent", "rgba(0,0,0,0.8)"]}
                                        style={styles.gradient}
                                    />
                                    <Text style={[styles.tileLabel, isSelected && styles.tileLabelSelected]}>
                                        {category.title}
                                    </Text>
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.continueBtn,
                        (selectedPreferences.length === 0 || saving) && styles.continueBtnDisabled
                    ]}
                    onPress={handleSave}
                    disabled={selectedPreferences.length === 0 || saving}
                >
                    <LinearGradient
                        colors={
                            selectedPreferences.length === 0
                                ? ["#ccc", "#bbb"]
                                : ["#2c5aa0", "#1e3d6f"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.continueGradient}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.continueText}>
                                {isEditMode ? "Save Preferences" : "Start Exploring"}
                            </Text>
                        )}
                        {!saving && <MaterialIcons name="arrow-forward" size={20} color="#fff" />}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        position: "relative",
    },
    backBtn: {
        marginBottom: 15,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#eef2f6",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTextContainer: {
        maxWidth: "85%",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: "#666",
        lineHeight: 22,
    },
    skipBtn: {
        position: "absolute",
        top: 25,
        right: 20,
        padding: 5,
    },
    skipText: {
        fontSize: 16,
        color: "#888",
        fontWeight: "500",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 100, // Space for footer
    },
    tileWrapper: {
        width: (width - 55) / 2, // 2 columns with gaps
        height: 160,
        marginBottom: 15,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    tileImage: {
        width: "100%",
        height: "100%",
    },
    tileImageStyle: {
        borderRadius: 20,
    },
    tileOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    tileOverlaySelected: {
        backgroundColor: "rgba(44, 90, 160, 0.4)", // CeyGo blue tint
        borderWidth: 3,
        borderColor: "#2c5aa0",
    },
    gradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "50%",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    checkBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#2c5aa0",
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
    },
    tileLabel: {
        position: "absolute",
        bottom: 15,
        left: 15,
        right: 10,
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    tileLabelSelected: {
        color: "#fff",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: "rgba(248, 249, 250, 0.95)",
        borderTopWidth: 1,
        borderTopColor: "#eef2f6",
    },
    continueBtn: {
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#2c5aa0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    continueBtnDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    continueGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        gap: 10,
    },
    continueText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default OnboardingPreferencesScreen;
