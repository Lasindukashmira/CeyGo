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
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Image,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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

const AddRestaurantScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [images, setImages] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [tempFoodItem, setTempFoodItem] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
    });

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        cuisineTypes: "",
        priceRange: "$$",
        openingTime: "11:00 AM",
        closingTime: "10:00 PM",
        diningOptions: "Dine-in, Takeaway",
        basePrice: "", // Average price per person in LKR
        address: "",
        district: "",
        phone: "",
        website: "",
        openingHours: {
            monday: { active: true, open: "09:00 AM", close: "10:00 PM" },
            tuesday: { active: true, open: "09:00 AM", close: "10:00 PM" },
            wednesday: { active: true, open: "09:00 AM", close: "10:00 PM" },
            thursday: { active: true, open: "09:00 AM", close: "10:00 PM" },
            friday: { active: true, open: "09:00 AM", close: "10:00 PM" },
            saturday: { active: true, open: "09:00 AM", close: "10:00 PM" },
            sunday: { active: true, open: "09:00 AM", close: "10:00 PM" },
        },
        menu: [], // Array of { id, name, description, price, category, image }
    });

    const [errors, setErrors] = useState({});

    const steps = [
        { id: 1, title: "Basic Info" },
        { id: 2, title: "Dining Details" },
        { id: 3, title: "Location & Pricing" },
        { id: 4, title: "Menu Items" },
    ];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 5,
        });

        if (!result.canceled) {
            const newImages = result.assets.map((asset) => asset.uri);
            setImages([...images, ...newImages].slice(0, 5));
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.name.trim()) newErrors.name = "Restaurant name is required";
            if (!formData.description.trim()) newErrors.description = "Description is required";
            if (formData.description.length < 50) newErrors.description = "Description must be at least 50 characters";
        } else if (step === 2) {
            if (!formData.cuisineTypes.trim()) newErrors.cuisineTypes = "Cuisine types are required";
            if (!formData.openingTime.trim()) newErrors.openingTime = "Opening time is required";
            if (!formData.closingTime.trim()) newErrors.closingTime = "Closing time is required";
        } else if (step === 3) {
            if (!formData.basePrice.trim()) newErrors.basePrice = "Average price is required";
            if (isNaN(parseFloat(formData.basePrice))) newErrors.basePrice = "Please enter a valid price";
            if (!formData.address.trim()) newErrors.address = "Address is required";
            if (!formData.district.trim()) newErrors.district = "District is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        setSaving(true);
        try {
            console.log("Adding restaurant for provider:", user.uid);

            const priceLKR = parseFloat(formData.basePrice);
            const priceUSD = parseFloat((priceLKR / 300).toFixed(2)); // Approximate conversion

            const serviceData = {
                providerId: user.uid,
                providerName: user.providerProfile?.businessName || user.firstName + " " + user.lastName,
                type: "restaurant",
                status: "active",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                name: formData.name.trim(),
                description: formData.description.trim(),
                images: images,
                coverImage: images[0] || null,
                location: {
                    address: formData.address.trim(),
                    district: formData.district.trim(),
                    province: "",
                    latitude: null,
                    longitude: null,
                },
                pricing: {
                    basePrice: priceUSD,
                    priceLKR: priceLKR,
                    pricingType: "per_person",
                },
                contact: {
                    phone: user.providerProfile?.contactPhone || user.phone || "",
                    email: user.email,
                    whatsapp: user.providerProfile?.contactPhone || user.phone || "",
                },
                restaurantDetails: {
                    cuisineTypes: formData.cuisineTypes.split(",").map((s) => s.trim()).filter(Boolean),
                    priceRange: formData.priceRange,
                    openingHours: formData.openingHours,
                    diningOptions: formData.diningOptions.split(",").map((s) => s.trim()).filter(Boolean),
                    menu: formData.menu,
                    phone: formData.phone.trim(),
                    website: formData.website.trim(),
                },
                viewCount: 0,
                favoriteCount: 0,
                reviewCount: 0,
                avgRating: 0,
            };

            const docRef = await addDoc(collection(db, "services"), serviceData);
            console.log("Restaurant added with ID:", docRef.id);

            Alert.alert(
                "Restaurant Published! 🎉",
                "Your restaurant has been successfully listed and is now visible to tourists.",
                [
                    {
                        text: "View Dashboard",
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: "MainTabs", params: { screen: "Dashboard" } }],
                            });
                        },
                    },
                ]
            );
        } catch (error) {
            console.error("Error adding restaurant:", error);
            Alert.alert("Error", `Failed to publish restaurant: ${error.message}`);
        }
        setSaving(false);
    };

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <View style={styles.stepItem}>
                        <View style={[
                            styles.stepCircle,
                            currentStep >= step.id && styles.stepCircleActive,
                            currentStep > step.id && styles.stepCircleCompleted,
                        ]}>
                            {currentStep > step.id ? (
                                <MaterialIcons name="check" size={16} color="#fff" />
                            ) : (
                                <Text style={[
                                    styles.stepNumber,
                                    currentStep >= step.id && styles.stepNumberActive,
                                ]}>{step.id}</Text>
                            )}
                        </View>
                        <Text style={[
                            styles.stepLabel,
                            currentStep >= step.id && styles.stepLabelActive,
                        ]}>{step.title}</Text>
                    </View>
                    {index < steps.length - 1 && (
                        <View style={[
                            styles.stepConnector,
                            currentStep > step.id && styles.stepConnectorActive,
                        ]} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Restaurant Menu</Text>
                <Text style={styles.menuSubtitle}>Add food items with images and prices</Text>
            </View>

            <View style={styles.foodItemList}>
                {(formData.menu || []).map((item, index) => (
                    <View key={index} style={styles.foodItemCard}>
                        {item.image && (
                            <Image source={{ uri: item.image }} style={styles.foodItemImage} />
                        )}
                        <View style={styles.foodItemContent}>
                            <View style={styles.foodItemRow}>
                                <Text style={styles.foodItemName}>{item.name}</Text>
                                <Text style={styles.foodItemPrice}>Rs. {item.price}</Text>
                            </View>
                            <Text style={styles.foodItemDesc} numberOfLines={1}>{item.description}</Text>
                            <Text style={styles.foodItemCategory}>{item.category}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.removeFoodBtn}
                            onPress={() => {
                                const newMenu = [...formData.menu];
                                newMenu.splice(index, 1);
                                updateField("menu", newMenu);
                            }}
                        >
                            <MaterialIcons name="delete-outline" size={20} color="#e53935" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <View style={styles.addFoodContainer}>
                <Text style={styles.addFoodTitle}>Add New Food Item</Text>

                <View style={styles.foodImageRow}>
                    <TouchableOpacity style={styles.foodImageBtn} onPress={async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            quality: 0.6,
                            allowsEditing: true,
                            aspect: [1, 1],
                        });
                        if (!result.canceled) {
                            setTempFoodItem({ ...tempFoodItem, image: result.assets[0].uri });
                        }
                    }}>
                        {tempFoodItem.image ? (
                            <Image source={{ uri: tempFoodItem.image }} style={styles.tempFoodImage} />
                        ) : (
                            <View style={styles.addImagePlaceholder}>
                                <MaterialIcons name="add-a-photo" size={24} color="#666" />
                                <Text style={styles.addImagePlaceholderText}>Photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <View style={styles.foodNameCol}>
                        <TextInput
                            style={styles.foodInput}
                            placeholder="Item Name"
                            value={tempFoodItem.name}
                            onChangeText={(val) => setTempFoodItem({ ...tempFoodItem, name: val })}
                        />
                        <TextInput
                            style={styles.foodInput}
                            placeholder="Price (LKR)"
                            value={tempFoodItem.price}
                            onChangeText={(val) => setTempFoodItem({ ...tempFoodItem, price: val })}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                <TextInput
                    style={[styles.foodInput, styles.foodArea]}
                    placeholder="Description (Optional)"
                    value={tempFoodItem.description}
                    onChangeText={(val) => setTempFoodItem({ ...tempFoodItem, description: val })}
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

                <TouchableOpacity
                    style={styles.addFoodToListBtn}
                    onPress={() => {
                        if (!tempFoodItem.name || !tempFoodItem.price) {
                            Alert.alert("Error", "Name and Price are required for food items.");
                            return;
                        }
                        const newMenu = [...(formData.menu || []), { ...tempFoodItem, id: Date.now().toString() }];
                        updateField("menu", newMenu);
                        setTempFoodItem({ name: "", description: "", price: "", category: "", image: null });
                    }}
                >
                    <Text style={styles.addFoodToListText}>Add to Menu</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStep1 = () => (
        <>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Restaurant Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.textInput, errors.name && styles.inputError]}
                    value={formData.name}
                    onChangeText={(text) => updateField("name", text)}
                    placeholder="e.g., The Lagoon Seafood Restaurant"
                    placeholderTextColor="#999"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.textInput, styles.textArea, errors.description && styles.inputError]}
                    value={formData.description}
                    onChangeText={(text) => updateField("description", text)}
                    placeholder="Describe your restaurant, the ambiance, and your signature dishes..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                />
                <Text style={styles.charCount}>{formData.description.length}/50 characters minimum</Text>
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Phone (Optional)</Text>
                <TextInput
                    style={styles.textInput}
                    value={formData.phone}
                    onChangeText={(text) => updateField("phone", text)}
                    placeholder="e.g., +94 77 123 4567"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Website (Optional)</Text>
                <TextInput
                    style={styles.textInput}
                    value={formData.website}
                    onChangeText={(text) => updateField("website", text)}
                    placeholder="e.g., www.restaurant.com"
                    placeholderTextColor="#999"
                    keyboardType="url"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Restaurant Images (up to 5)</Text>
                <View style={styles.imagesGrid}>
                    {images.map((uri, index) => (
                        <View key={index} style={styles.imagePreview}>
                            <Image source={{ uri }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                                <MaterialIcons name="close" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {images.length < 5 && (
                        <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                            <MaterialIcons name="add-a-photo" size={28} color="#666" />
                            <Text style={styles.addImageText}>Add</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </>
    );

    const renderStep2 = () => (
        <>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cuisine Types <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.textInput, errors.cuisineTypes && styles.inputError]}
                    value={formData.cuisineTypes}
                    onChangeText={(text) => updateField("cuisineTypes", text)}
                    placeholder="e.g., Sri Lankan, Seafood, Chinese (comma separated)"
                    placeholderTextColor="#999"
                />
                {errors.cuisineTypes && <Text style={styles.errorText}>{errors.cuisineTypes}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price Range</Text>
                <View style={styles.priceRangeContainer}>
                    {["$", "$$", "$$$", "$$$$"].map((range) => (
                        <TouchableOpacity
                            key={range}
                            style={[
                                styles.priceRangeBtn,
                                formData.priceRange === range && styles.priceRangeBtnActive
                            ]}
                            onPress={() => updateField("priceRange", range)}
                        >
                            <Text style={[
                                styles.priceRangeText,
                                formData.priceRange === range && styles.priceRangeTextActive
                            ]}>{range}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Opening Hours <Text style={styles.required}>*</Text></Text>
                <View style={styles.hoursContainer}>
                    {Object.keys(formData.openingHours).map((day) => (
                        <View key={day} style={styles.dayRow}>
                            <TouchableOpacity
                                style={[styles.dayToggle, formData.openingHours[day].active && styles.dayToggleActive]}
                                onPress={() => {
                                    const newHours = { ...formData.openingHours };
                                    newHours[day].active = !newHours[day].active;
                                    updateField("openingHours", newHours);
                                }}
                            >
                                <Text style={[styles.dayName, formData.openingHours[day].active && styles.dayNameActive]}>
                                    {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                                </Text>
                            </TouchableOpacity>

                            {formData.openingHours[day].active ? (
                                <View style={styles.dayInputs}>
                                    <TextInput
                                        style={styles.hourInput}
                                        value={formData.openingHours[day].open}
                                        onChangeText={(val) => {
                                            const newHours = { ...formData.openingHours };
                                            newHours[day].open = val;
                                            updateField("openingHours", newHours);
                                        }}
                                        placeholder="Opens"
                                    />
                                    <Text style={styles.hourDash}>-</Text>
                                    <TextInput
                                        style={styles.hourInput}
                                        value={formData.openingHours[day].close}
                                        onChangeText={(val) => {
                                            const newHours = { ...formData.openingHours };
                                            newHours[day].close = val;
                                            updateField("openingHours", newHours);
                                        }}
                                        placeholder="Closes"
                                    />
                                </View>
                            ) : (
                                <Text style={styles.closedText}>Closed</Text>
                            )}
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dining Options</Text>
                <TextInput
                    style={styles.textInput}
                    value={formData.diningOptions}
                    onChangeText={(text) => updateField("diningOptions", text)}
                    placeholder="e.g., Dine-in, Takeaway, Delivery (comma separated)"
                    placeholderTextColor="#999"
                />
            </View>
        </>
    );

    const renderStep3 = () => (
        <>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Average Price (LKR per person) <Text style={styles.required}>*</Text></Text>
                <View style={styles.priceInputContainer}>
                    <Text style={styles.currencySymbol}>Rs.</Text>
                    <TextInput
                        style={[styles.textInput, styles.priceInput, errors.basePrice && styles.inputError]}
                        value={formData.basePrice}
                        onChangeText={(text) => updateField("basePrice", text)}
                        placeholder="0.00"
                        placeholderTextColor="#999"
                        keyboardType="decimal-pad"
                    />
                </View>
                <Text style={styles.usdEquivalent}>
                    ≈ ${formData.basePrice ? (parseFloat(formData.basePrice) / 300).toFixed(2) : "0.00"} USD
                </Text>
                {errors.basePrice && <Text style={styles.errorText}>{errors.basePrice}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.textInput, errors.address && styles.inputError]}
                    value={formData.address}
                    onChangeText={(text) => updateField("address", text)}
                    placeholder="e.g., 123 Galle Road, Colombo 03"
                    placeholderTextColor="#999"
                />
                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>District <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.textInput, errors.district && styles.inputError]}
                    value={formData.district}
                    onChangeText={(text) => updateField("district", text)}
                    placeholder="e.g., Colombo, Kandy, Galle"
                    placeholderTextColor="#999"
                />
                {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}
            </View>
        </>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <LinearGradient colors={["#ff9800", "#f57c00"]} style={styles.header}>
                <SafeAreaView style={styles.headerContent}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add Restaurant</Text>
                        <View style={{ width: 44 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {renderStepIndicator()}

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
                    onPress={currentStep < 4 ? handleNext : handleSubmit}
                    disabled={saving}
                >
                    <LinearGradient
                        colors={saving ? ["#999", "#888"] : ["#ff9800", "#f57c00"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitGradient}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.submitText}>
                                    {currentStep < 4 ? "Continue" : "Publish Restaurant"}
                                </Text>
                                <MaterialIcons name={currentStep < 4 ? "arrow-forward" : "check"} size={20} color="#fff" />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
    },
    stepIndicator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    stepItem: {
        alignItems: "center",
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    stepCircleActive: {
        backgroundColor: "#ff9800",
    },
    stepCircleCompleted: {
        backgroundColor: "#4CAF50",
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: "600",
        color: "#999",
    },
    stepNumberActive: {
        color: "#fff",
    },
    stepLabel: {
        fontSize: 11,
        color: "#999",
        marginTop: 6,
    },
    stepLabelActive: {
        color: "#ff9800",
        fontWeight: "600",
    },
    stepConnector: {
        width: (width - 240) / 3,
        height: 2,
        backgroundColor: "#e0e0e0",
        marginHorizontal: 8,
        marginBottom: 20,
    },
    stepConnectorActive: {
        backgroundColor: "#4CAF50",
    },
    // Hours Styles
    hoursContainer: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: "#eee",
    },
    dayRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f5f5f5",
    },
    dayToggle: {
        width: 45,
        height: 30,
        borderRadius: 8,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    dayToggleActive: {
        backgroundColor: "#ff9800",
    },
    dayName: {
        fontSize: 12,
        fontWeight: "700",
        color: "#666",
    },
    dayNameActive: {
        color: "#fff",
    },
    dayInputs: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    hourInput: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 13,
        borderWidth: 1,
        borderColor: "#eee",
        width: 85,
        textAlign: "center",
    },
    hourDash: {
        color: "#999",
    },
    closedText: {
        fontSize: 13,
        color: "#999",
        fontStyle: "italic",
        marginRight: 20,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        marginBottom: 10,
    },
    subLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 6,
    },
    required: {
        color: "#e53935",
    },
    textInput: {
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    textArea: {
        minHeight: 100,
        paddingTop: 14,
        textAlignVertical: "top",
    },
    inputError: {
        borderColor: "#e53935",
    },
    errorText: {
        color: "#e53935",
        fontSize: 12,
        marginTop: 6,
    },
    charCount: {
        color: "#888",
        fontSize: 12,
        marginTop: 6,
        textAlign: "right",
    },
    rowInputs: {
        flexDirection: "row",
    },
    priceInputContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginRight: 8,
    },
    priceInput: {
        flex: 1,
    },
    priceRangeContainer: {
        flexDirection: "row",
        gap: 10,
    },
    priceRangeBtn: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    priceRangeBtnActive: {
        backgroundColor: "#fff3e0",
        borderColor: "#ff9800",
    },
    priceRangeText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    priceRangeTextActive: {
        color: "#ff9800",
    },
    imagesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    imagePreview: {
        width: (width - 70) / 4,
        height: (width - 70) / 4,
        borderRadius: 12,
        overflow: "hidden",
    },
    previewImage: {
        width: "100%",
        height: "100%",
    },
    removeImageBtn: {
        position: "absolute",
        top: 4,
        right: 4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    addImageBtn: {
        width: (width - 70) / 4,
        height: (width - 70) / 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#ddd",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
    },
    addImageText: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
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
    submitBtn: {
        borderRadius: 16,
        overflow: "hidden",
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        gap: 10,
    },
    submitText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },
    usdEquivalent: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
        marginLeft: 4,
    },
    // Menu Styles
    menuContainer: {
        paddingBottom: 20,
    },
    menuHeader: {
        marginBottom: 20,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    menuSubtitle: {
        fontSize: 13,
        color: "#666",
        marginTop: 4,
    },
    foodItemList: {
        marginBottom: 25,
    },
    foodItemCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 14,
        marginBottom: 12,
        padding: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#eee",
    },
    foodItemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    foodItemContent: {
        flex: 1,
    },
    foodItemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
    },
    foodItemName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    foodItemPrice: {
        fontSize: 14,
        fontWeight: "700",
        color: "#ff9800",
    },
    foodItemDesc: {
        fontSize: 12,
        color: "#666",
    },
    foodItemCategory: {
        fontSize: 10,
        color: "#ff9800",
        fontWeight: "700",
        marginTop: 4,
        textTransform: "uppercase",
    },
    removeFoodBtn: {
        padding: 8,
    },
    addFoodContainer: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderStyle: "dashed",
    },
    addFoodTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#333",
        marginBottom: 15,
    },
    foodImageRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    foodImageBtn: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        overflow: "hidden",
    },
    tempFoodImage: {
        width: "100%",
        height: "100%",
    },
    foodNameCol: {
        flex: 1,
        gap: 8,
    },
    foodInput: {
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        borderWidth: 1,
        borderColor: "#eee",
        marginBottom: 10,
    },
    fieldSubTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
        marginBottom: 8,
        marginTop: 5,
    },
    categoryScroll: {
        marginBottom: 15,
    },
    categoryTag: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    categoryTagActive: {
        backgroundColor: "#ff9800",
        borderColor: "#ff9800",
    },
    categoryTagText: {
        fontSize: 12,
        color: "#666",
        fontWeight: "600",
    },
    categoryTagTextActive: {
        color: "#fff",
    },
    addImagePlaceholder: {
        alignItems: "center",
        justifyContent: "center",
    },
    addImagePlaceholderText: {
        fontSize: 10,
        color: "#888",
        marginTop: 2,
    },
    foodArea: {
        minHeight: 60,
        textAlignVertical: "top",
    },
    addFoodToListBtn: {
        backgroundColor: "#fff3e0",
        borderColor: "#ff9800",
        borderWidth: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 5,
    },
    addFoodToListText: {
        color: "#ff9800",
        fontWeight: "700",
        fontSize: 14,
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 10,
    },
});

export default AddRestaurantScreen;
