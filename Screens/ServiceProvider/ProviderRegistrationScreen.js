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
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../AuthContext";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const { width } = Dimensions.get("window");

const businessTypes = [
    { id: "tour_operator", label: "Tour Operator", icon: "map-marker-path" },
    { id: "hotel", label: "Hotel / Accommodation", icon: "bed" },
    { id: "restaurant", label: "Restaurant", icon: "silverware-fork-knife" },
    { id: "attraction", label: "Attraction / Activity", icon: "camera" },
    { id: "transport", label: "Transport Service", icon: "car" },
    { id: "other", label: "Other", icon: "dots-horizontal" },
];

const ProviderRegistrationScreen = ({ navigation }) => {
    const { user, refreshUser } = useAuth();
    const [saving, setSaving] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const [formData, setFormData] = useState({
        businessName: "",
        businessType: "",
        description: "",
        address: "",
        contactPhone: user?.phone || "",
        registrationNumber: "",
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.businessName.trim()) {
            newErrors.businessName = "Business name is required";
        }
        if (!formData.businessType) {
            newErrors.businessType = "Please select a business type";
        }
        if (!formData.description.trim()) {
            newErrors.description = "Business description is required";
        }
        if (formData.description.length < 50) {
            newErrors.description = "Description must be at least 50 characters";
        }
        if (!formData.address.trim()) {
            newErrors.address = "Business address is required";
        }
        if (!formData.contactPhone.trim()) {
            newErrors.contactPhone = "Contact phone is required";
        }
        if (!acceptedTerms) {
            newErrors.terms = "You must accept the terms and conditions";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert("Validation Error", "Please fill in all required fields correctly.");
            return;
        }

        setSaving(true);
        try {
            console.log("Registering provider for user:", user.uid);

            // Update user document with provider profile
            await updateDoc(doc(db, "users", user.uid), {
                role: "service_provider",
                providerProfile: {
                    businessName: formData.businessName.trim(),
                    businessType: formData.businessType,
                    description: formData.description.trim(),
                    address: formData.address.trim(),
                    contactPhone: formData.contactPhone.trim(),
                    registrationNumber: formData.registrationNumber.trim() || null,
                    verificationStatus: "pending",
                    appliedAt: serverTimestamp(),
                    verifiedAt: null,
                },
            });

            console.log("Provider registration successful, refreshing user data...");

            // Refresh user data in context
            await refreshUser();

            Alert.alert(
                "Registration Successful! 🎉",
                "Welcome to CeyGo Service Providers! You can now start listing your services.",
                [
                    {
                        text: "Go to Dashboard",
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [
                                    { name: "MainTabs" },
                                    { name: "ProviderDashboard" },
                                ],
                            });
                        },
                    },
                ]
            );
        } catch (error) {
            console.error("Error registering provider:", error);
            Alert.alert("Error", `Failed to register: ${error.message}`);
        }
        setSaving(false);
    };

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
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
                        <Text style={styles.headerTitle}>Register as Provider</Text>
                        <View style={{ width: 44 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Business Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Business Name <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.textInput, errors.businessName && styles.inputError]}
                            value={formData.businessName}
                            onChangeText={(text) => updateField("businessName", text)}
                            placeholder="e.g., Ceylon Adventures Tours"
                            placeholderTextColor="#999"
                        />
                        {errors.businessName && (
                            <Text style={styles.errorText}>{errors.businessName}</Text>
                        )}
                    </View>

                    {/* Business Type */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Business Type <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.businessTypeGrid}>
                            {businessTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.businessTypeCard,
                                        formData.businessType === type.id && styles.businessTypeCardActive,
                                    ]}
                                    onPress={() => updateField("businessType", type.id)}
                                >
                                    <MaterialCommunityIcons
                                        name={type.icon}
                                        size={24}
                                        color={formData.businessType === type.id ? "#2c5aa0" : "#666"}
                                    />
                                    <Text
                                        style={[
                                            styles.businessTypeLabel,
                                            formData.businessType === type.id && styles.businessTypeLabelActive,
                                        ]}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.businessType && (
                            <Text style={styles.errorText}>{errors.businessType}</Text>
                        )}
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Business Description <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea, errors.description && styles.inputError]}
                            value={formData.description}
                            onChangeText={(text) => updateField("description", text)}
                            placeholder="Describe your business, services offered, and what makes you unique..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        <Text style={styles.charCount}>
                            {formData.description.length}/50 characters minimum
                        </Text>
                        {errors.description && (
                            <Text style={styles.errorText}>{errors.description}</Text>
                        )}
                    </View>

                    {/* Address */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Business Address <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.textInput, errors.address && styles.inputError]}
                            value={formData.address}
                            onChangeText={(text) => updateField("address", text)}
                            placeholder="e.g., 123 Galle Road, Colombo 03"
                            placeholderTextColor="#999"
                        />
                        {errors.address && (
                            <Text style={styles.errorText}>{errors.address}</Text>
                        )}
                    </View>

                    {/* Contact Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Contact Phone <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.textInput, errors.contactPhone && styles.inputError]}
                            value={formData.contactPhone}
                            onChangeText={(text) => updateField("contactPhone", text)}
                            placeholder="+94 77 123 4567"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                        />
                        {errors.contactPhone && (
                            <Text style={styles.errorText}>{errors.contactPhone}</Text>
                        )}
                    </View>

                    {/* Registration Number (Optional) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Business Registration Number{" "}
                            <Text style={styles.optional}>(Optional)</Text>
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            value={formData.registrationNumber}
                            onChangeText={(text) => updateField("registrationNumber", text)}
                            placeholder="e.g., BRN123456"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Terms & Conditions */}
                    <TouchableOpacity
                        style={styles.termsRow}
                        onPress={() => setAcceptedTerms(!acceptedTerms)}
                    >
                        <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
                            {acceptedTerms && (
                                <MaterialIcons name="check" size={16} color="#fff" />
                            )}
                        </View>
                        <Text style={styles.termsText}>
                            I agree to the{" "}
                            <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                            <Text style={styles.termsLink}>Provider Guidelines</Text>
                        </Text>
                    </TouchableOpacity>
                    {errors.terms && (
                        <Text style={[styles.errorText, { marginTop: 5 }]}>{errors.terms}</Text>
                    )}

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Submit Button */}
            <View style={styles.bottomCTA}>
                <TouchableOpacity
                    style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={saving}
                >
                    <LinearGradient
                        colors={saving ? ["#999", "#888"] : ["#2c5aa0", "#1e3d6f"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitGradient}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.submitText}>Submit Application</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
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
        paddingBottom: 20,
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
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 25,
    },
    inputGroup: {
        marginBottom: 22,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        marginBottom: 10,
    },
    required: {
        color: "#e53935",
    },
    optional: {
        color: "#888",
        fontWeight: "400",
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
    businessTypeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    businessTypeCard: {
        width: (width - 60) / 3,
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#e0e0e0",
    },
    businessTypeCardActive: {
        borderColor: "#2c5aa0",
        backgroundColor: "#f0f6ff",
    },
    businessTypeLabel: {
        fontSize: 11,
        color: "#666",
        marginTop: 8,
        textAlign: "center",
        fontWeight: "500",
    },
    businessTypeLabelActive: {
        color: "#2c5aa0",
        fontWeight: "600",
    },
    termsRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    checkboxActive: {
        backgroundColor: "#2c5aa0",
        borderColor: "#2c5aa0",
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        color: "#666",
        lineHeight: 22,
    },
    termsLink: {
        color: "#2c5aa0",
        fontWeight: "600",
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

export default ProviderRegistrationScreen;
