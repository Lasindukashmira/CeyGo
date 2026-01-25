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

const AddAttractionScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [images, setImages] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        openingTime: "08:30 AM",
        closingTime: "06:00 PM",
        entryFeeLKR: "",
        address: "",
        district: "",
        features: "Scenic Views, Photography permitted, Guided Tours available",
    });

    const [errors, setErrors] = useState({});

    const steps = [
        { id: 1, title: "Basic Info" },
        { id: 2, title: "Attraction Details" },
        { id: 3, title: "Location & Pricing" },
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
            if (!formData.name.trim()) newErrors.name = "Attraction name is required";
            if (!formData.description.trim()) newErrors.description = "Description is required";
            if (formData.description.length < 50) newErrors.description = "Description must be at least 50 characters";
        } else if (step === 2) {
            if (!formData.openingTime.trim()) newErrors.openingTime = "Opening time is required";
            if (!formData.closingTime.trim()) newErrors.closingTime = "Closing time is required";
        } else if (step === 3) {
            if (!formData.entryFeeUSD.trim()) newErrors.entryFeeUSD = "Entry fee is required";
            if (isNaN(parseFloat(formData.entryFeeUSD))) newErrors.entryFeeUSD = "Please enter a valid price";
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
            console.log("Adding attraction for provider:", user.uid);

            const feeLKR = parseFloat(formData.entryFeeLKR);
            const feeUSD = parseFloat((feeLKR / 300).toFixed(2));

            const serviceData = {
                providerId: user.uid,
                providerName: user.providerProfile?.businessName || user.firstName + " " + user.lastName,
                type: "attraction",
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
                    basePrice: feeUSD,
                    priceLKR: feeLKR,
                    pricingType: "per_person",
                },
                contact: {
                    phone: user.providerProfile?.contactPhone || user.phone || "",
                    email: user.email,
                    whatsapp: user.providerProfile?.contactPhone || user.phone || "",
                },
                attractionDetails: {
                    openingHours: `${formData.openingTime} - ${formData.closingTime}`,
                    entryFees: {
                        foreigner: feeUSD,
                        local: Math.round(feeUSD / 10), // Example logic
                    },
                    features: formData.features.split(",").map((s) => s.trim()).filter(Boolean),
                },
                viewCount: 0,
                favoriteCount: 0,
                reviewCount: 0,
                avgRating: 0,
            };

            const docRef = await addDoc(collection(db, "services"), serviceData);
            console.log("Attraction added with ID:", docRef.id);

            Alert.alert(
                "Attraction Published! 🎉",
                "Your attraction has been successfully listed and is now visible to tourists.",
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
            console.error("Error adding attraction:", error);
            Alert.alert("Error", `Failed to publish attraction: ${error.message}`);
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
                <Text style={styles.inputLabel}>Attraction Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.textInput, errors.name && styles.inputError]}
                    value={formData.name}
                    onChangeText={(text) => updateField("name", text)}
                    placeholder="e.g., Nine Arches Bridge Viewpoint"
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
                    placeholder="Describe the attraction, history, and what visitors can see..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                />
                <Text style={styles.charCount}>{formData.description.length}/50 characters minimum</Text>
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Images (up to 5)</Text>
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
                <Text style={styles.inputLabel}>Operating Hours <Text style={styles.required}>*</Text></Text>
                <View style={styles.rowInputs}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.subLabel}>Opens At</Text>
                        <TextInput
                            style={[styles.textInput, errors.openingTime && styles.inputError]}
                            value={formData.openingTime}
                            onChangeText={(text) => updateField("openingTime", text)}
                            placeholder="e.g., 08:30 AM"
                        />
                    </View>
                    <View style={{ width: 15 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.subLabel}>Closes At</Text>
                        <TextInput
                            style={[styles.textInput, errors.closingTime && styles.inputError]}
                            value={formData.closingTime}
                            onChangeText={(text) => updateField("closingTime", text)}
                            placeholder="e.g., 06:00 PM"
                        />
                    </View>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Key Features / Highlights</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={formData.features}
                    onChangeText={(text) => updateField("features", text)}
                    placeholder="e.g., Panoramic views, Hiking trail, Cafe nearby (comma separated)"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                />
            </View>
        </>
    );

    const renderStep3 = () => (
        <>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Entry Fee (LKR per person) <Text style={styles.required}>*</Text></Text>
                <View style={styles.priceInputContainer}>
                    <Text style={styles.currencySymbol}>Rs.</Text>
                    <TextInput
                        style={[styles.textInput, styles.priceInput, errors.entryFeeLKR && styles.inputError]}
                        value={formData.entryFeeLKR}
                        onChangeText={(text) => updateField("entryFeeLKR", text)}
                        placeholder="0.00"
                        placeholderTextColor="#999"
                        keyboardType="decimal-pad"
                    />
                </View>
                <Text style={styles.usdEquivalent}>
                    ≈ ${formData.entryFeeLKR ? (parseFloat(formData.entryFeeLKR) / 300).toFixed(2) : "0.00"} USD
                </Text>
                {errors.entryFeeLKR && <Text style={styles.errorText}>{errors.entryFeeLKR}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.textInput, errors.address && styles.inputError]}
                    value={formData.address}
                    onChangeText={(text) => updateField("address", text)}
                    placeholder="e.g., Ella, Matale, Sigiriya"
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

            <LinearGradient colors={["#4caf50", "#2e7d32"]} style={styles.header}>
                <SafeAreaView style={styles.headerContent}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add Attraction</Text>
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
                        colors={saving ? ["#999", "#888"] : ["#4caf50", "#2e7d32"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitGradient}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.submitText}>
                                    {currentStep < 3 ? "Continue" : "Publish Attraction"}
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
        backgroundColor: "#4caf50",
    },
    stepCircleCompleted: {
        backgroundColor: "#2e7d32",
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
        color: "#4caf50",
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
        backgroundColor: "#2e7d32",
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
});

export default AddAttractionScreen;
