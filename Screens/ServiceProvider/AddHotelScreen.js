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

const AddHotelScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [images, setImages] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        starRating: "3",
        roomTypes: "",
        amenities: "WiFi, AC, Parking, Pool",
        checkIn: "14:00",
        checkOut: "11:00",
        basePrice: "", // Price per night (base)
        address: "",
        district: "",
    });

    const [errors, setErrors] = useState({});

    const steps = [
        { id: 1, title: "Basic Info" },
        { id: 2, title: "Property Details" },
        { id: 3, title: "Pricing & Location" },
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
            if (!formData.name.trim()) newErrors.name = "Property name is required";
            if (!formData.description.trim()) newErrors.description = "Description is required";
            if (formData.description.length < 50) newErrors.description = "Description must be at least 50 characters";
        } else if (step === 2) {
            if (!formData.roomTypes.trim()) newErrors.roomTypes = "Room types are required";
            if (!formData.amenities.trim()) newErrors.amenities = "Amenities are required";
        } else if (step === 3) {
            if (!formData.basePrice.trim()) newErrors.basePrice = "Base price is required";
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
            console.log("Adding property for provider:", user.uid);

            const priceLKR = parseFloat(formData.basePrice);
            const priceUSD = parseFloat((priceLKR / 300).toFixed(2));

            const serviceData = {
                providerId: user.uid,
                providerName: user.providerProfile?.businessName || user.firstName + " " + user.lastName,
                type: "hotel",
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
                    pricingType: "per_night",
                },
                contact: {
                    phone: user.providerProfile?.contactPhone || user.phone || "",
                    email: user.email,
                    whatsapp: user.providerProfile?.contactPhone || user.phone || "",
                },
                hotelDetails: {
                    starRating: parseInt(formData.starRating) || 3,
                    roomTypes: formData.roomTypes.split(",").map((s) => s.trim()).filter(Boolean),
                    amenities: formData.amenities.split(",").map((s) => s.trim()).filter(Boolean),
                    checkIn: formData.checkIn,
                    checkOut: formData.checkOut,
                },
                viewCount: 0,
                favoriteCount: 0,
                reviewCount: 0,
                avgRating: 0,
            };

            const docRef = await addDoc(collection(db, "services"), serviceData);
            console.log("Property added with ID:", docRef.id);

            Alert.alert(
                "Property Published! 🎉",
                "Your property has been successfully listed and is now visible to tourists.",
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
            console.error("Error adding hotel:", error);
            Alert.alert("Error", `Failed to publish property: ${error.message}`);
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

    const renderStep1 = () => (
        <>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Property Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.textInput, errors.name && styles.inputError]}
                    value={formData.name}
                    onChangeText={(text) => updateField("name", text)}
                    placeholder="e.g., Grand Hyatt Colombo"
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
                    placeholder="Describe your property, rooms, and special features..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                />
                <Text style={styles.charCount}>{formData.description.length}/50 characters minimum</Text>
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Property Images (up to 5)</Text>
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
                <Text style={styles.inputLabel}>Star Rating</Text>
                <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                            key={star}
                            onPress={() => updateField("starRating", star.toString())}
                        >
                            <MaterialIcons
                                name={star <= parseInt(formData.starRating) ? "star" : "star-border"}
                                size={40}
                                color={star <= parseInt(formData.starRating) ? "#FFD700" : "#ccc"}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Room Types <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.textInput, errors.roomTypes && styles.inputError]}
                    value={formData.roomTypes}
                    onChangeText={(text) => updateField("roomTypes", text)}
                    placeholder="e.g., Standard, Deluxe, Suite (comma separated)"
                    placeholderTextColor="#999"
                />
                {errors.roomTypes && <Text style={styles.errorText}>{errors.roomTypes}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amenities <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.textInput, styles.textArea, errors.amenities && styles.inputError]}
                    value={formData.amenities}
                    onChangeText={(text) => updateField("amenities", text)}
                    placeholder="e.g., WiFi, Pool, Spa, Gym, Restaurant (comma separated)"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                />
                {errors.amenities && <Text style={styles.errorText}>{errors.amenities}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Check-in / Check-out</Text>
                <View style={styles.rowInputs}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.subLabel}>Check-in After</Text>
                        <TextInput
                            style={styles.textInput}
                            value={formData.checkIn}
                            onChangeText={(text) => updateField("checkIn", text)}
                            placeholder="e.g., 14:00"
                        />
                    </View>
                    <View style={{ width: 15 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.subLabel}>Check-out Before</Text>
                        <TextInput
                            style={styles.textInput}
                            value={formData.checkOut}
                            onChangeText={(text) => updateField("checkOut", text)}
                            placeholder="e.g., 11:00"
                        />
                    </View>
                </View>
            </View>
        </>
    );

    const renderStep3 = () => (
        <>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Base Price (LKR per night) <Text style={styles.required}>*</Text></Text>
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
                    placeholder="e.g., 123 Galle Road, Colombo"
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

            <LinearGradient colors={["#e91e63", "#c2185b"]} style={styles.header}>
                <SafeAreaView style={styles.headerContent}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add Property</Text>
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
                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.bottomCTA}>
                <TouchableOpacity
                    style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
                    onPress={currentStep < 3 ? handleNext : handleSubmit}
                    disabled={saving}
                >
                    <LinearGradient
                        colors={saving ? ["#999", "#888"] : ["#e91e63", "#c2185b"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitGradient}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.submitText}>
                                    {currentStep < 3 ? "Continue" : "Publish Property"}
                                </Text>
                                <MaterialIcons name={currentStep < 3 ? "arrow-forward" : "check"} size={20} color="#fff" />
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
        backgroundColor: "#e91e63",
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
        color: "#e91e63",
        fontWeight: "600",
    },
    stepConnector: {
        width: 40,
        height: 2,
        backgroundColor: "#e0e0e0",
        marginHorizontal: 10,
        marginBottom: 20,
    },
    stepConnectorActive: {
        backgroundColor: "#4CAF50",
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputGroup: {
        marginBottom: 25,
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
    starContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
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
});

export default AddHotelScreen;
