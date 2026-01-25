import React, { useState } from "react";
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
    Alert,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

const FOOD_CATEGORIES = [
    "Appetizers",
    "Main Course",
    "Desserts",
    "Beverages",
    "Breakfast",
    "Seafood",
    "Snacks",
    "Vegetarian",
];

const EditServiceScreen = ({ route, navigation }) => {
    const { service } = route.params;
    const [deleting, setDeleting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingMenu, setUpdatingMenu] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [menu, setMenu] = useState(service.restaurantDetails?.menu || []);
    const [tempFoodItem, setTempFoodItem] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
    });

    const handleSaveMenu = async (newMenu) => {
        setUpdatingMenu(true);
        try {
            await updateDoc(doc(db, "services", service.id), {
                "restaurantDetails.menu": newMenu,
                updatedAt: new Date(),
            });
            setMenu(newMenu);
            Alert.alert("Success", "Menu updated successfully.");
        } catch (error) {
            console.error("Error updating menu:", error);
            Alert.alert("Error", "Failed to update menu.");
        }
        setUpdatingMenu(false);
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Service?",
            "Are you sure you want to delete this listing? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await deleteDoc(doc(db, "services", service.id));
                            Alert.alert("Success", "Service deleted successfully.");
                            navigation.navigate("ProviderDashboard");
                        } catch (error) {
                            console.error("Error deleting service:", error);
                            Alert.alert("Error", "Failed to delete service.");
                        }
                        setDeleting(false);
                    },
                },
            ]
        );
    };

    const toggleStatus = async () => {
        const newStatus = service.status === "active" ? "inactive" : "active";
        setUpdatingStatus(true);
        try {
            await updateDoc(doc(db, "services", service.id), {
                status: newStatus,
                updatedAt: new Date(),
            });
            Alert.alert("Success", `Service set to ${newStatus}.`);
            navigation.navigate("ProviderDashboard");
        } catch (error) {
            console.error("Error updating status:", error);
            Alert.alert("Error", "Failed to update status.");
        }
        setUpdatingStatus(false);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <LinearGradient colors={["#2c5aa0", "#1e3d6f"]} style={styles.header}>
                <SafeAreaView style={styles.headerContent}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Service Details</Text>
                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
                            {deleting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <MaterialIcons name="delete-outline" size={24} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Image
                    source={{ uri: service.coverImage || "https://via.placeholder.com/400x200" }}
                    style={styles.coverImage}
                />

                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.name}>{service.name}</Text>
                            <Text style={styles.type}>{service.type?.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.statusBadge, service.status === "active" ? styles.statusActive : styles.statusInactive]}>
                            <Text style={[styles.statusText, service.status === "active" ? styles.statusTextActive : styles.statusTextInactive]}>
                                {service.status?.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="eye" size={20} color="#2c5aa0" />
                            <Text style={styles.statValue}>{service.viewCount || 0}</Text>
                            <Text style={styles.statLabel}>Views</Text>
                        </View>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="heart" size={20} color="#e53935" />
                            <Text style={styles.statValue}>{service.favoriteCount || 0}</Text>
                            <Text style={styles.statLabel}>Favorites</Text>
                        </View>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
                            <Text style={styles.statValue}>{service.avgRating || 0}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{service.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Location</Text>
                        <View style={styles.iconInfo}>
                            <MaterialIcons name="location-on" size={18} color="#666" />
                            <Text style={styles.infoText}>{service.location?.address}, {service.location?.district}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Pricing</Text>
                        <View style={styles.iconInfo}>
                            <MaterialIcons name="attach-money" size={18} color="#666" />
                            <Text style={styles.infoText}>
                                Rs. {service.pricing?.priceLKR} (≈ ${service.pricing?.basePrice})
                            </Text>
                        </View>
                        <Text style={styles.pricingType}>({service.pricing?.pricingType?.replace("_", " ")})</Text>
                    </View>

                    {service.type === "restaurant" && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Manage Menu</Text>
                            <View style={styles.menuContainer}>
                                {menu.map((item, index) => (
                                    <View key={item.id || index} style={styles.menuItem}>
                                        <View style={styles.menuItemInfo}>
                                            <Text style={styles.menuItemName}>{item.name}</Text>
                                            <Text style={styles.menuItemPrice}>Rs. {item.price}</Text>
                                            {item.category && <Text style={styles.itemMeta}>{item.category}</Text>}
                                        </View>
                                        <View style={styles.menuItemActions}>
                                            <TouchableOpacity
                                                style={styles.actionBtnIcon}
                                                onPress={() => {
                                                    setEditingId(item.id);
                                                    setTempFoodItem({
                                                        name: item.name,
                                                        price: item.price,
                                                        description: item.description || "",
                                                        category: item.category || "",
                                                        image: item.image || null
                                                    });
                                                }}
                                            >
                                                <MaterialIcons name="edit" size={18} color="#2c5aa0" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.actionBtnIcon}
                                                onPress={() => {
                                                    const newMenu = [...menu];
                                                    newMenu.splice(index, 1);
                                                    handleSaveMenu(newMenu);
                                                }}
                                            >
                                                <MaterialIcons name="delete" size={18} color="#e53935" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}

                                <View style={styles.addMenuForm}>
                                    <Text style={styles.formTitle}>
                                        {editingId ? "Edit Food Item" : "Add New Food Item"}
                                    </Text>
                                    <View style={styles.formImageRow}>
                                        <TouchableOpacity
                                            style={styles.formImageBtn}
                                            onPress={async () => {
                                                const result = await ImagePicker.launchImageLibraryAsync({
                                                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                                    quality: 0.6,
                                                    allowsEditing: true,
                                                    aspect: [1, 1],
                                                });
                                                if (!result.canceled) {
                                                    setTempFoodItem({ ...tempFoodItem, image: result.assets[0].uri });
                                                }
                                            }}
                                        >
                                            {tempFoodItem.image ? (
                                                <Image source={{ uri: tempFoodItem.image }} style={styles.formTempImage} />
                                            ) : (
                                                <View style={styles.addFoodImagePlaceholder}>
                                                    <MaterialIcons name="add-a-photo" size={24} color="#2c5aa0" />
                                                    <Text style={styles.addFoodImageText}>Photo</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                        <View style={styles.formMainInputs}>
                                            <TextInput
                                                style={styles.menuInput}
                                                placeholder="Food Item Name"
                                                value={tempFoodItem.name}
                                                onChangeText={(v) => setTempFoodItem({ ...tempFoodItem, name: v })}
                                            />
                                            <TextInput
                                                style={styles.menuInput}
                                                placeholder="Price (LKR)"
                                                value={tempFoodItem.price}
                                                onChangeText={(v) => setTempFoodItem({ ...tempFoodItem, price: v })}
                                                keyboardType="decimal-pad"
                                            />
                                        </View>
                                    </View>

                                    <TextInput
                                        style={[styles.menuInput, styles.menuArea]}
                                        placeholder="Description (Optional)"
                                        value={tempFoodItem.description}
                                        onChangeText={(v) => setTempFoodItem({ ...tempFoodItem, description: v })}
                                        multiline
                                    />

                                    <Text style={styles.fieldSubTitle}>Category</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                                        {FOOD_CATEGORIES.map((cat) => (
                                            <TouchableOpacity
                                                key={cat}
                                                style={[
                                                    styles.categoryTag,
                                                    tempFoodItem.category === cat && styles.categoryTagActive
                                                ]}
                                                onPress={() => setTempFoodItem({ ...tempFoodItem, category: cat })}
                                            >
                                                <Text style={[
                                                    styles.categoryTagText,
                                                    tempFoodItem.category === cat && styles.categoryTagTextActive
                                                ]}>{cat}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <View style={styles.formActionsRow}>
                                        <TouchableOpacity
                                            style={[styles.addMenuBtn, { flex: 2 }]}
                                            onPress={() => {
                                                if (!tempFoodItem.name || !tempFoodItem.price) {
                                                    Alert.alert("Error", "Name and Price are required.");
                                                    return;
                                                }

                                                let newMenu;
                                                if (editingId) {
                                                    newMenu = menu.map(m => m.id === editingId ? { ...tempFoodItem, id: editingId } : m);
                                                } else {
                                                    newMenu = [...menu, { ...tempFoodItem, id: Date.now().toString() }];
                                                }

                                                handleSaveMenu(newMenu);
                                                setTempFoodItem({ name: "", description: "", price: "", category: "", image: null });
                                                setEditingId(null);
                                            }}
                                            disabled={updatingMenu}
                                        >
                                            {updatingMenu ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={styles.addMenuBtnText}>
                                                    {editingId ? "Update Item" : "Add Item"}
                                                </Text>
                                            )}
                                        </TouchableOpacity>

                                        {editingId && (
                                            <TouchableOpacity
                                                style={styles.cancelEditBtn}
                                                onPress={() => {
                                                    setEditingId(null);
                                                    setTempFoodItem({ name: "", description: "", price: "", category: "", image: null });
                                                }}
                                            >
                                                <Text style={styles.cancelText}>Cancel</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={styles.alertBox}>
                        <MaterialIcons name="info-outline" size={20} color="#2c5aa0" />
                        <Text style={styles.alertText}>
                            Direct editing is coming soon. You can currently toggle visibility or delete this listing.
                        </Text>
                    </View>
                </View>
                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.statusToggleBtn, service.status === "active" ? styles.deactivateBtn : styles.activateBtn]}
                    onPress={toggleStatus}
                    disabled={updatingStatus}
                >
                    {updatingStatus ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <MaterialIcons
                                name={service.status === "active" ? "visibility-off" : "visibility"}
                                size={20}
                                color="#fff"
                            />
                            <Text style={styles.toggleBtnText}>
                                {service.status === "active" ? "Set to Inactive" : "Set to Active"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        paddingBottom: 15,
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
    deleteBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,0,0,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
    },
    scrollView: {
        flex: 1,
    },
    coverImage: {
        width: "100%",
        height: 200,
        backgroundColor: "#f0f0f0",
    },
    content: {
        padding: 20,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    titleContainer: {
        flex: 1,
        marginRight: 10,
    },
    name: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    type: {
        fontSize: 12,
        color: "#2c5aa0",
        fontWeight: "700",
        marginTop: 4,
        letterSpacing: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusActive: {
        backgroundColor: "#e8f5e9",
    },
    statusInactive: {
        backgroundColor: "#ffebee",
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
    },
    statusTextActive: {
        color: "#4CAF50",
    },
    statusTextInactive: {
        color: "#e53935",
    },
    statsRow: {
        flexDirection: "row",
        backgroundColor: "#f8f9fa",
        borderRadius: 16,
        padding: 15,
        marginTop: 20,
        justifyContent: "space-around",
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        marginTop: 4,
    },
    statLabel: {
        fontSize: 11,
        color: "#666",
        marginTop: 2,
    },
    section: {
        marginTop: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 10,
    },
    description: {
        fontSize: 15,
        color: "#444",
        lineHeight: 22,
    },
    iconInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    infoText: {
        fontSize: 15,
        color: "#444",
    },
    alertBox: {
        flexDirection: "row",
        backgroundColor: "#e3f2fd",
        padding: 15,
        borderRadius: 14,
        marginTop: 30,
        alignItems: "center",
        gap: 12,
    },
    alertText: {
        flex: 1,
        fontSize: 13,
        color: "#2c5aa0",
        lineHeight: 18,
    },
    bottomBar: {
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
    },
    statusToggleBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 15,
        borderRadius: 14,
        gap: 8,
    },
    activateBtn: {
        backgroundColor: "#4CAF50",
    },
    deactivateBtn: {
        backgroundColor: "#FF9800",
    },
    toggleBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    pricingType: {
        fontSize: 12,
        color: "#888",
        marginLeft: 26,
        marginTop: 2,
    },
    menuContainer: {
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 12,
    },
    menuItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#eee",
    },
    menuItemInfo: {
        flex: 1,
    },
    menuItemName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    menuItemPrice: {
        fontSize: 13,
        color: "#ff9800",
        fontWeight: "700",
    },
    addMenuForm: {
        marginTop: 15,
        gap: 10,
    },
    menuInput: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    addMenuBtn: {
        backgroundColor: "#2c5aa0",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    addMenuBtnText: {
        color: "#fff",
        fontWeight: "700",
    },
    menuItemActions: {
        flexDirection: "row",
        gap: 12,
    },
    actionBtnIcon: {
        padding: 4,
    },
    itemMeta: {
        fontSize: 11,
        color: "#999",
        marginTop: 2,
    },
    formTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
    },
    menuArea: {
        minHeight: 60,
        textAlignVertical: "top",
    },
    formActionsRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 5,
    },
    cancelEditBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelText: {
        color: "#666",
        fontWeight: "600",
    },
    formImageRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 10,
    },
    formImageBtn: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#eee",
        overflow: "hidden",
    },
    formTempImage: {
        width: "100%",
        height: "100%",
    },
    addFoodImagePlaceholder: {
        alignItems: "center",
        justifyContent: "center",
    },
    addFoodImageText: {
        fontSize: 10,
        color: "#2c5aa0",
        marginTop: 2,
    },
    formMainInputs: {
        flex: 1,
        gap: 8,
    },
    fieldSubTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#666",
        marginBottom: 8,
        marginTop: 5,
    },
    categoryScroll: {
        marginBottom: 15,
    },
    categoryTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: "#f0f0f0",
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    categoryTagActive: {
        backgroundColor: "#2c5aa0",
        borderColor: "#2c5aa0",
    },
    categoryTagText: {
        fontSize: 11,
        color: "#666",
        fontWeight: "600",
    },
    categoryTagTextActive: {
        color: "#fff",
    },
});

export default EditServiceScreen;
