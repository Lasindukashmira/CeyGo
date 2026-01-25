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
    TextInput,
    Switch,
    Alert,
    Image,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../AuthContext";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../Services/CloudinaryService";

const { width } = Dimensions.get("window");

const ProfileScreen = ({ navigation }) => {
    const { user, logout, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Editable user data
    const [formData, setFormData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phone || "",
    });

    // Preferences
    const [preferences, setPreferences] = useState({
        currency: "LKR",
        notifications: true,
    });

    // Stats (mock for now - can be connected to Firestore)
    const [stats, setStats] = useState({
        placesVisited: 12,
        reviewsWritten: 5,
        favorites: 8,
        tripsPlanned: 3,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phone: user.phone || "",
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user?.uid) return;

        setSaving(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
            });
            await refreshUser();
            setIsEditing(false);
            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            Alert.alert("Error", "Failed to update profile. Please try again.");
            console.error("Error updating profile:", error);
        }
        setSaving(false);
    };

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Required", "Sorry, we need camera roll permissions to make this work!");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled) {
                setUploadingImage(true);
                try {
                    const imageUrl = await uploadToCloudinary(result.assets[0].uri);
                    if (imageUrl) {
                        await updateDoc(doc(db, "users", user.uid), {
                            profilePicture: imageUrl,
                            updatedAt: new Date(),
                        });
                        await refreshUser();
                        Alert.alert("Success", "Profile picture updated successfully!");
                    }
                } catch (error) {
                    Alert.alert("Upload Error", "Failed to upload image. Please try again.");
                    console.error("Image upload error:", error);
                } finally {
                    setUploadingImage(false);
                }
            }
        } catch (error) {
            console.error("Pick image error:", error);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: logout },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "This action cannot be undone. All your data will be permanently deleted.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => Alert.alert("Info", "Account deletion feature coming soon.")
                },
            ]
        );
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

    const getInitials = () => {
        const first = formData.firstName?.[0] || "";
        const last = formData.lastName?.[0] || "";
        return (first + last).toUpperCase() || "U";
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header with Gradient */}
            <LinearGradient
                colors={["#2c5aa0", "#1e3d6f"]}
                style={styles.headerGradient}
            >
                <SafeAreaView style={styles.headerContent}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>My Profile</Text>
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                        >
                            <Text style={styles.editBtnText}>
                                {saving ? "Saving..." : isEditing ? "Save" : "Edit"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Profile Avatar */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                {uploadingImage ? (
                                    <ActivityIndicator size="large" color="#2c5aa0" />
                                ) : user?.profilePicture ? (
                                    <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
                                ) : (
                                    <Text style={styles.avatarText}>{getInitials()}</Text>
                                )}
                            </View>
                            <TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage} disabled={uploadingImage}>
                                <MaterialIcons name="camera-alt" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>
                            {formData.firstName} {formData.lastName}
                        </Text>
                        <View style={styles.emailRow}>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                            <View style={styles.verifiedBadge}>
                                <MaterialIcons name="verified" size={14} color="#4CAF50" />
                            </View>
                        </View>
                        <Text style={styles.memberSince}>
                            Member since {formatDate(user?.createdAt)}
                        </Text>
                        {/* User Role Badge */}
                        <View style={styles.roleBadge}>
                            <MaterialCommunityIcons
                                name={user?.role === 'service_provider' ? 'briefcase-account' : 'account-circle'}
                                size={14}
                                color={user?.role === 'service_provider' ? '#FF9800' : '#4CAF50'}
                            />
                            <Text style={[
                                styles.roleText,
                                user?.role === 'service_provider' && styles.serviceProviderText
                            ]}>
                                {user?.role === 'service_provider' ? 'Service Provider' : 'Tourist'}
                            </Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Stats Card */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="map-marker-check" size={24} color="#2c5aa0" />
                        <Text style={styles.statValue}>{stats.placesVisited}</Text>
                        <Text style={styles.statLabel}>Visited</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
                        <Text style={styles.statValue}>{stats.reviewsWritten}</Text>
                        <Text style={styles.statLabel}>Reviews</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="heart" size={24} color="#e53935" />
                        <Text style={styles.statValue}>{stats.favorites}</Text>
                        <Text style={styles.statLabel}>Favorites</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="calendar-check" size={24} color="#4CAF50" />
                        <Text style={styles.statValue}>{stats.tripsPlanned}</Text>
                        <Text style={styles.statLabel}>Trips</Text>
                    </View>
                </View>

                {/* Personal Information */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="person" size={22} color="#2c5aa0" />
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                    </View>
                    <View style={styles.sectionCard}>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>First Name</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.firstName}
                                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                                    placeholder="Enter first name"
                                />
                            ) : (
                                <Text style={styles.inputValue}>{formData.firstName || "Not set"}</Text>
                            )}
                        </View>
                        <View style={styles.inputDivider} />
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Last Name</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.lastName}
                                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                                    placeholder="Enter last name"
                                />
                            ) : (
                                <Text style={styles.inputValue}>{formData.lastName || "Not set"}</Text>
                            )}
                        </View>
                        <View style={styles.inputDivider} />
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={styles.emailContainer}>
                                <Text style={styles.inputValue}>{user?.email}</Text>
                                <MaterialIcons name="lock" size={16} color="#999" />
                            </View>
                        </View>
                        <View style={styles.inputDivider} />
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Phone</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                    placeholder="+94 XX XXX XXXX"
                                    keyboardType="phone-pad"
                                />
                            ) : (
                                <Text style={styles.inputValue}>{formData.phone || "Not set"}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Preferences */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="tune" size={22} color="#2c5aa0" />
                        <Text style={styles.sectionTitle}>Preferences</Text>
                    </View>
                    <View style={styles.sectionCard}>
                        <View style={styles.preferenceRow}>
                            <View style={styles.preferenceInfo}>
                                <MaterialCommunityIcons name="currency-usd" size={20} color="#666" />
                                <Text style={styles.preferenceLabel}>Currency</Text>
                            </View>
                            <View style={styles.currencyToggle}>
                                <TouchableOpacity
                                    style={[styles.currencyBtn, preferences.currency === "USD" && styles.currencyBtnActive]}
                                    onPress={() => setPreferences({ ...preferences, currency: "USD" })}
                                >
                                    <Text style={[styles.currencyBtnText, preferences.currency === "USD" && styles.currencyBtnTextActive]}>USD</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.currencyBtn, preferences.currency === "LKR" && styles.currencyBtnActive]}
                                    onPress={() => setPreferences({ ...preferences, currency: "LKR" })}
                                >
                                    <Text style={[styles.currencyBtnText, preferences.currency === "LKR" && styles.currencyBtnTextActive]}>LKR</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.inputDivider} />
                        <View style={styles.preferenceRow}>
                            <View style={styles.preferenceInfo}>
                                <MaterialCommunityIcons name="bell-outline" size={20} color="#666" />
                                <Text style={styles.preferenceLabel}>Push Notifications</Text>
                            </View>
                            <Switch
                                value={preferences.notifications}
                                onValueChange={(value) => setPreferences({ ...preferences, notifications: value })}
                                trackColor={{ false: "#e0e0e0", true: "#a5d6a7" }}
                                thumbColor={preferences.notifications ? "#4CAF50" : "#fff"}
                            />
                        </View>
                        <View style={styles.inputDivider} />
                        <View style={styles.preferenceRow}>
                            <View style={styles.preferenceInfo}>
                                <MaterialCommunityIcons name="translate" size={20} color="#666" />
                                <Text style={styles.preferenceLabel}>Language</Text>
                            </View>
                            <Text style={styles.preferenceValue}>English</Text>
                        </View>
                    </View>
                </View>

                {/* Account Actions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="security" size={22} color="#2c5aa0" />
                        <Text style={styles.sectionTitle}>Account</Text>
                    </View>
                    <View style={styles.sectionCard}>
                        <TouchableOpacity style={styles.actionRow}>
                            <View style={styles.actionInfo}>
                                <MaterialIcons name="lock-outline" size={20} color="#666" />
                                <Text style={styles.actionLabel}>Change Password</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                        </TouchableOpacity>
                        <View style={styles.inputDivider} />
                        <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
                            <View style={styles.actionInfo}>
                                <MaterialIcons name="logout" size={20} color="#e53935" />
                                <Text style={[styles.actionLabel, styles.dangerText]}>Logout</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                        </TouchableOpacity>
                        <View style={styles.inputDivider} />
                        <TouchableOpacity style={styles.actionRow} onPress={handleDeleteAccount}>
                            <View style={styles.actionInfo}>
                                <MaterialIcons name="delete-outline" size={20} color="#e53935" />
                                <Text style={[styles.actionLabel, styles.dangerText]}>Delete Account</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Version */}
                <Text style={styles.versionText}>CeyGo v1.0.0</Text>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    headerGradient: {
        paddingBottom: 30,
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    editBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    editBtnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    avatarSection: {
        alignItems: "center",
        marginTop: 20,
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: "700",
        color: "#2c5aa0",
    },
    cameraBtn: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#2c5aa0",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff",
    },
    userName: {
        fontSize: 24,
        fontWeight: "700",
        color: "#fff",
        marginTop: 15,
    },
    emailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },
    userEmail: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
    },
    verifiedBadge: {
        marginLeft: 6,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 2,
    },
    memberSince: {
        fontSize: 12,
        color: "rgba(255,255,255,0.6)",
        marginTop: 5,
    },
    roleBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 10,
        gap: 6,
    },
    roleText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#4CAF50",
    },
    serviceProviderText: {
        color: "#FF9800",
    },
    scrollView: {
        flex: 1,
        marginTop: -20,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        backgroundColor: "#f5f5f5",
        paddingTop: 10,
    },
    statsCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 15,
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
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
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
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    sectionCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    inputRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    inputLabel: {
        fontSize: 15,
        color: "#666",
        fontWeight: "500",
    },
    inputValue: {
        fontSize: 15,
        color: "#1a1a1a",
        fontWeight: "600",
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: "#1a1a1a",
        textAlign: "right",
        fontWeight: "600",
        paddingVertical: 0,
    },
    emailContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    inputDivider: {
        height: 1,
        backgroundColor: "#f0f0f0",
        marginHorizontal: 16,
    },
    preferenceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    preferenceInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    preferenceLabel: {
        fontSize: 15,
        color: "#333",
        fontWeight: "500",
    },
    preferenceValue: {
        fontSize: 15,
        color: "#888",
        fontWeight: "500",
    },
    currencyToggle: {
        flexDirection: "row",
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        padding: 3,
    },
    currencyBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    currencyBtnActive: {
        backgroundColor: "#2c5aa0",
    },
    currencyBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
    },
    currencyBtnTextActive: {
        color: "#fff",
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    actionInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    actionLabel: {
        fontSize: 15,
        color: "#333",
        fontWeight: "500",
    },
    dangerText: {
        color: "#e53935",
    },
    versionText: {
        textAlign: "center",
        color: "#999",
        fontSize: 12,
        marginTop: 30,
    },
    profileImage: {
        width: "100%",
        height: "100%",
        borderRadius: 50,
    },
});

export default ProfileScreen;
