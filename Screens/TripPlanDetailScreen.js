import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
    StatusBar,
    Animated,
    Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// Premium Color Palette
const COLORS = {
    primary: "#2c5aa0",
    primaryDark: "#1a3b70",
    gold: "#FFD700",
    goldDark: "#FDB813",
    background: "#F4F6FA",
    cardBg: "#FFFFFF",
    textDark: "#1A1A1A",
    textMedium: "#555555",
    textLight: "#888888",
    white: "#FFFFFF",
    success: "#22C55E",
    warning: "#F59E0B",
    info: "#3B82F6",
    accent: "#8B5CF6",
    morning: "#F97316",
    afternoon: "#3B82F6",
    evening: "#8B5CF6",
    border: "#E8ECF0",
};

const TIME_SLOT_CONFIG = {
    morning: { label: "Morning", icon: "weather-sunset-up", color: COLORS.morning, gradient: ["#FFF7ED", "#FFEDD5"] },
    afternoon: { label: "Afternoon", icon: "weather-sunny", color: COLORS.afternoon, gradient: ["#EFF6FF", "#DBEAFE"] },
    evening: { label: "Evening", icon: "weather-night", color: COLORS.evening, gradient: ["#F5F3FF", "#EDE9FE"] },
};

const TripPlanDetailScreen = ({ route, navigation }) => {
    const { plan } = route.params || {};
    const [activeDay, setActiveDay] = useState(0);
    const [showFullBudget, setShowFullBudget] = useState(false);
    const [selectedHotelIndex, setSelectedHotelIndex] = useState(-1); // -1 = auto-select recommended
    const scrollY = useRef(new Animated.Value(0)).current;

    if (!plan) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No plan data found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.errorLink}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const dailyPlan = plan.dailyPlan || [];
    const budget = plan.budget || {};
    const tips = plan.tips || [];
    const packingList = plan.packingList || [];
    const hotelOptions = plan.hotelOptions || [];
    const currentDay = dailyPlan[activeDay] || {};

    const handleShare = async () => {
        try {
            await Share.share({
                title: plan.tripTitle,
                message: `Check out my AI-planned trip: ${plan.tripTitle}\n${plan.duration} days in ${plan.destination}\nPlanned with CeyGo!`,
            });
        } catch (error) {
            console.error("Share error:", error);
        }
    };

    // ========= Hero Header =========
    const renderHero = () => {
        const imageSource = typeof plan.image === "number"
            ? plan.image
            : { uri: plan.image || "https://images.unsplash.com/photo-1546708773-e578c7bd5f68?w=800" };

        return (
            <View style={styles.heroContainer}>
                <Image source={imageSource} style={styles.heroImage} />
                <LinearGradient
                    colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.8)"]}
                    style={styles.heroGradient}
                />

                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.glassButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.topBarRight}>
                        <TouchableOpacity style={styles.glassButton} onPress={handleShare}>
                            <MaterialIcons name="share" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Hero Content */}
                <View style={styles.heroContent}>
                    <View style={styles.aiBadge}>
                        <MaterialCommunityIcons name="creation" size={14} color="#333" />
                        <Text style={styles.aiBadgeText}>AI GENERATED</Text>
                    </View>
                    <Text style={styles.heroTitle} numberOfLines={2}>{plan.tripTitle}</Text>
                    <View style={styles.heroMeta}>
                        <View style={styles.heroMetaItem}>
                            <MaterialIcons name="calendar-today" size={14} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.heroMetaText}>{plan.duration} Days</Text>
                        </View>
                        <View style={styles.heroMetaDot} />
                        <View style={styles.heroMetaItem}>
                            <FontAwesome5 name="users" size={12} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.heroMetaText}>{plan.travelers}</Text>
                        </View>
                        <View style={styles.heroMetaDot} />
                        <View style={styles.heroMetaItem}>
                            <FontAwesome5 name="wallet" size={12} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.heroMetaText}>{plan.budgetTier}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    // ========= Summary Card =========
    const renderSummary = () => (
        <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
                <MaterialCommunityIcons name="text-box-outline" size={20} color={COLORS.primary} />
                <Text style={styles.summaryHeaderText}>Trip Overview</Text>
            </View>
            <Text style={styles.summaryText}>{plan.summary}</Text>
        </View>
    );

    // ========= Day Selector =========
    const renderDaySelector = () => (
        <View style={styles.daySelectorContainer}>
            <Text style={styles.sectionTitle}>Day-by-Day Itinerary</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dayPillsContainer}
            >
                {dailyPlan.map((day, index) => {
                    const isActive = index === activeDay;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setActiveDay(index)}
                            activeOpacity={0.7}
                        >
                            {isActive ? (
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.primaryDark]}
                                    style={styles.dayPillActive}
                                >
                                    <Text style={styles.dayPillNumber}>{day.day}</Text>
                                    <Text style={styles.dayPillLabel}>Day</Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.dayPill}>
                                    <Text style={styles.dayPillNumberInactive}>{day.day}</Text>
                                    <Text style={styles.dayPillLabelInactive}>Day</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    // ========= Activity Card =========
    const renderActivityCard = (slot, data) => {
        if (!data) return null;
        const config = TIME_SLOT_CONFIG[slot];

        return (
            <View style={styles.activityCard}>
                <LinearGradient
                    colors={config.gradient}
                    style={styles.activityGradient}
                >
                    {/* Time Slot Header */}
                    <View style={styles.activityHeader}>
                        <View style={[styles.timeSlotBadge, { backgroundColor: config.color + "20" }]}>
                            <MaterialCommunityIcons name={config.icon} size={16} color={config.color} />
                            <Text style={[styles.timeSlotText, { color: config.color }]}>{config.label}</Text>
                        </View>
                        <Text style={styles.timeText}>{data.time}</Text>
                    </View>

                    {/* Activity Content */}
                    <View style={styles.activityContent}>
                        <Text style={styles.activityPlace}>{data.place}</Text>
                        <Text style={styles.activityDescription}>{data.activity}</Text>

                        {data.tips && (
                            <View style={styles.activityTipRow}>
                                <MaterialCommunityIcons name="lightbulb-outline" size={14} color={COLORS.warning} />
                                <Text style={styles.activityTip}>{data.tips}</Text>
                            </View>
                        )}

                        {(data.estimatedCostLKR > 0 || data.estimatedCost > 0) && (
                            <View style={styles.activityCostBadge}>
                                <Text style={styles.activityCostText}>~Rs. {(data.estimatedCostLKR || data.estimatedCost || 0).toLocaleString()}</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </View>
        );
    };

    // ========= Meals Card =========
    const renderMeals = (meals) => {
        if (!meals) return null;
        const mealTypes = [
            { key: "breakfast", icon: "coffee", label: "Breakfast", color: COLORS.morning },
            { key: "lunch", icon: "utensils", label: "Lunch", color: COLORS.afternoon },
            { key: "dinner", icon: "moon", label: "Dinner", color: COLORS.evening },
        ];

        return (
            <View style={styles.mealsCard}>
                <View style={styles.mealsHeader}>
                    <FontAwesome5 name="utensils" size={14} color={COLORS.primary} />
                    <Text style={styles.mealsTitle}>Meals</Text>
                </View>
                {mealTypes.map(mt => {
                    const meal = meals[mt.key];
                    if (!meal) return null;
                    return (
                        <View key={mt.key} style={styles.mealRow}>
                            <View style={[styles.mealIconBox, { backgroundColor: mt.color + "15" }]}>
                                <FontAwesome5 name={mt.icon} size={12} color={mt.color} />
                            </View>
                            <View style={styles.mealInfo}>
                                <Text style={styles.mealLabel}>{mt.label}</Text>
                                <Text style={styles.mealRestaurant}>{meal.restaurant}</Text>
                                {meal.cuisine && <Text style={styles.mealCuisine}>{meal.cuisine}</Text>}
                            </View>
                            {(meal.estimatedCostLKR > 0 || meal.estimatedCost > 0) && (
                                <Text style={styles.mealCost}>Rs. {(meal.estimatedCostLKR || meal.estimatedCost || 0).toLocaleString()}</Text>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    // ========= Hotel Card =========
    const renderHotel = (hotel) => {
        if (!hotel) return null;
        return (
            <View style={styles.hotelCard}>
                <View style={styles.hotelHeader}>
                    <MaterialCommunityIcons name="bed-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.hotelTitle}>Tonight's Stay</Text>
                </View>
                <View style={styles.hotelContent}>
                    <View style={styles.hotelIconContainer}>
                        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.hotelIcon}>
                            <MaterialCommunityIcons name="domain" size={22} color="#fff" />
                        </LinearGradient>
                    </View>
                    <View style={styles.hotelInfo}>
                        <Text style={styles.hotelName}>{hotel.name}</Text>
                        {hotel.pricePerNight > 0 && (
                            <Text style={styles.hotelPrice}>${hotel.pricePerNight}/night</Text>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    // ========= Day View =========
    const renderDayView = () => (
        <View style={styles.dayViewContainer}>
            {/* Day Theme */}
            {currentDay.theme && (
                <View style={styles.dayThemeCard}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.dayThemeGradient}
                    >
                        <MaterialCommunityIcons name="compass-outline" size={20} color="#fff" />
                        <View>
                            <Text style={styles.dayThemeLabel}>Day {currentDay.day}</Text>
                            <Text style={styles.dayThemeText}>{currentDay.theme}</Text>
                        </View>
                    </LinearGradient>
                </View>
            )}

            {/* Transport */}
            {currentDay.transport && (
                <View style={styles.transportCard}>
                    <MaterialCommunityIcons name="car-outline" size={16} color={COLORS.info} />
                    <Text style={styles.transportText}>{currentDay.transport}</Text>
                </View>
            )}

            {/* Timeline */}
            {renderActivityCard("morning", currentDay.morning)}
            {renderActivityCard("afternoon", currentDay.afternoon)}
            {renderActivityCard("evening", currentDay.evening)}

            {/* Meals */}
            {renderMeals(currentDay.meals)}
        </View>
    );

    // ========= Hotel Options Selector =========
    const renderHotelOptions = () => {
        if (!hotelOptions.length) return null;

        // Auto-select the recommended one if user hasn't chosen
        const getSelectedIndex = () => {
            if (selectedHotelIndex >= 0) return selectedHotelIndex;
            const recIdx = hotelOptions.findIndex(h => h.recommended);
            return recIdx >= 0 ? recIdx : 0;
        };
        const activeIdx = getSelectedIndex();

        const tierColors = {
            "Budget": "#22C55E",
            "Standard": COLORS.primary,
            "Luxury": "#F59E0B",
        };

        return (
            <View style={styles.hotelOptionsSection}>
                <View style={styles.hotelOptionsSectionHeader}>
                    <MaterialCommunityIcons name="bed-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>Where to Stay</Text>
                </View>
                <Text style={styles.hotelOptionsSubtitle}>Tap to select your preferred hotel</Text>

                {hotelOptions.map((hotel, index) => {
                    const isSelected = index === activeIdx;
                    const tierColor = tierColors[hotel.tier] || COLORS.primary;

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.hotelOptionCard, isSelected && styles.hotelOptionCardSelected, isSelected && { borderColor: tierColor }]}
                            onPress={() => setSelectedHotelIndex(index)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.hotelOptionLeft}>
                                <View style={[styles.hotelOptionIcon, { backgroundColor: tierColor + "15" }]}>
                                    <MaterialCommunityIcons name="domain" size={20} color={tierColor} />
                                </View>
                                <View style={styles.hotelOptionInfo}>
                                    <View style={styles.hotelOptionNameRow}>
                                        <Text style={styles.hotelOptionName} numberOfLines={1}>{hotel.name}</Text>
                                        {hotel.recommended && (
                                            <View style={[styles.recommendedBadge, { backgroundColor: tierColor + "15" }]}>
                                                <Text style={[styles.recommendedText, { color: tierColor }]}>Recommended</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.hotelOptionMeta}>
                                        <Text style={styles.hotelOptionTier}>{hotel.tier}</Text>
                                        {hotel.rating > 0 && (
                                            <View style={styles.hotelOptionRating}>
                                                <MaterialIcons name="star" size={12} color="#F59E0B" />
                                                <Text style={styles.hotelOptionRatingText}>{hotel.rating}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <View style={styles.hotelOptionRight}>
                                <Text style={styles.hotelOptionPrice}>Rs. {(hotel.priceLKR || 0).toLocaleString()}</Text>
                                <Text style={styles.hotelOptionPriceLabel}>/night</Text>
                                {isSelected && (
                                    <MaterialIcons name="check-circle" size={20} color={tierColor} style={{ marginTop: 4 }} />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    // ========= Budget Breakdown =========
    const renderBudget = () => {
        const budgetItems = [
            { key: "accommodation", label: "Accommodation", icon: "bed", color: "#3B82F6" },
            { key: "food", label: "Food & Dining", icon: "utensils", color: "#22C55E" },
            { key: "transport", label: "Transport", icon: "car", color: "#F59E0B" },
            { key: "activities", label: "Activities", icon: "hiking", color: "#8B5CF6" },
            { key: "miscellaneous", label: "Miscellaneous", icon: "ellipsis-h", color: "#EC4899" },
        ];

        const total = budget.total || 0;

        return (
            <View style={styles.budgetSection}>
                <TouchableOpacity
                    style={styles.budgetHeaderRow}
                    onPress={() => setShowFullBudget(!showFullBudget)}
                    activeOpacity={0.7}
                >
                    <View style={styles.budgetHeaderLeft}>
                        <MaterialCommunityIcons name="calculator-variant-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Budget Planner</Text>
                    </View>
                    <MaterialIcons name={showFullBudget ? "expand-less" : "expand-more"} size={24} color={COLORS.textLight} />
                </TouchableOpacity>

                {/* Total */}
                <View style={styles.budgetTotalCard}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.budgetTotalGradient}
                    >
                        <View>
                            <Text style={styles.budgetTotalLabel}>Estimated Total</Text>
                            <Text style={styles.budgetTotalAmount}>
                                Rs. {total.toLocaleString()}
                                <Text style={styles.budgetCurrency}> {budget.currency || "LKR"}</Text>
                            </Text>
                        </View>
                        {budget.perPersonPerDay > 0 && (
                            <View style={styles.budgetPerDay}>
                                <Text style={styles.budgetPerDayAmount}>Rs. {budget.perPersonPerDay.toLocaleString()}</Text>
                                <Text style={styles.budgetPerDayLabel}>per person/day</Text>
                            </View>
                        )}
                    </LinearGradient>
                </View>

                {showFullBudget && (
                    <View style={styles.budgetBreakdown}>
                        {budgetItems.map(item => {
                            const amount = budget[item.key] || 0;
                            const percentage = total > 0 ? (amount / total) * 100 : 0;
                            return (
                                <View key={item.key} style={styles.budgetItem}>
                                    <View style={styles.budgetItemLeft}>
                                        <View style={[styles.budgetItemIcon, { backgroundColor: item.color + "15" }]}>
                                            <FontAwesome5 name={item.icon} size={12} color={item.color} />
                                        </View>
                                        <View>
                                            <Text style={styles.budgetItemLabel}>{item.label}</Text>
                                            <View style={styles.budgetBarContainer}>
                                                <View style={[styles.budgetBar, { width: `${Math.min(percentage, 100)}%`, backgroundColor: item.color }]} />
                                            </View>
                                        </View>
                                    </View>
                                    <Text style={styles.budgetItemAmount}>Rs. {amount.toLocaleString()}</Text>
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>
        );
    };

    // ========= Tips Section =========
    const renderTips = () => {
        if (!tips.length) return null;
        return (
            <View style={styles.tipsSection}>
                <View style={styles.tipsHeader}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={COLORS.warning} />
                    <Text style={styles.sectionTitle}>Travel Tips</Text>
                </View>
                {tips.map((tip, index) => (
                    <View key={index} style={styles.tipCard}>
                        <View style={styles.tipNumber}>
                            <Text style={styles.tipNumberText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.tipText}>{tip}</Text>
                    </View>
                ))}
            </View>
        );
    };

    // ========= Packing List =========
    const renderPackingList = () => {
        if (!packingList.length) return null;
        return (
            <View style={styles.packingSection}>
                <View style={styles.packingHeader}>
                    <MaterialCommunityIcons name="bag-checked" size={20} color={COLORS.accent} />
                    <Text style={styles.sectionTitle}>Packing Essentials</Text>
                </View>
                <View style={styles.packingGrid}>
                    {packingList.map((item, index) => (
                        <View key={index} style={styles.packingItem}>
                            <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
                            <Text style={styles.packingItemText}>{item}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {renderHero()}

                <View style={styles.contentContainer}>
                    {renderSummary()}
                    {renderHotelOptions()}
                    {renderDaySelector()}
                    {renderDayView()}
                    {renderBudget()}
                    {renderTips()}
                    {renderPackingList()}

                    {/* Bottom spacing */}
                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
    errorText: { fontSize: 16, color: COLORS.textMedium, marginBottom: 12 },
    errorLink: { fontSize: 16, color: COLORS.primary, fontWeight: "600" },

    // Hero
    heroContainer: { width, height: 320, position: "relative" },
    heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
    heroGradient: { ...StyleSheet.absoluteFillObject },
    topBar: {
        position: "absolute", top: 50, left: 0, right: 0,
        flexDirection: "row", justifyContent: "space-between",
        paddingHorizontal: 20, zIndex: 10,
    },
    topBarRight: { flexDirection: "row", gap: 10 },
    glassButton: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center",
    },
    heroContent: { position: "absolute", bottom: 25, left: 20, right: 20 },
    aiBadge: {
        flexDirection: "row", alignItems: "center", gap: 5,
        backgroundColor: COLORS.gold, paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 12, alignSelf: "flex-start", marginBottom: 10,
    },
    aiBadgeText: { fontSize: 10, fontWeight: "800", color: "#333", letterSpacing: 0.8 },
    heroTitle: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: -0.5, marginBottom: 8 },
    heroMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
    heroMetaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    heroMetaText: { fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: "500" },
    heroMetaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.5)" },

    // Content
    contentContainer: { marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: COLORS.background, paddingTop: 5 },

    // Summary
    summaryCard: {
        marginHorizontal: 20, marginTop: 20, padding: 18,
        backgroundColor: COLORS.cardBg, borderRadius: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    summaryHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    summaryHeaderText: { fontSize: 15, fontWeight: "700", color: COLORS.textDark },
    summaryText: { fontSize: 14, lineHeight: 22, color: COLORS.textMedium },

    // Section Title
    sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textDark, letterSpacing: -0.3 },

    // Day Selector
    daySelectorContainer: { paddingHorizontal: 20, marginTop: 25 },
    dayPillsContainer: { paddingTop: 15, gap: 10, paddingBottom: 5 },
    dayPillActive: {
        width: 56, height: 68, borderRadius: 18, alignItems: "center", justifyContent: "center",
        shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    dayPill: {
        width: 56, height: 68, borderRadius: 18, alignItems: "center", justifyContent: "center",
        backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.border,
    },
    dayPillNumber: { fontSize: 20, fontWeight: "800", color: "#fff" },
    dayPillLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.8)", marginTop: 1 },
    dayPillNumberInactive: { fontSize: 20, fontWeight: "800", color: COLORS.textDark },
    dayPillLabelInactive: { fontSize: 11, fontWeight: "600", color: COLORS.textLight, marginTop: 1 },

    // Day View
    dayViewContainer: { paddingHorizontal: 20, marginTop: 15 },

    // Day Theme
    dayThemeCard: { marginBottom: 15, borderRadius: 14, overflow: "hidden" },
    dayThemeGradient: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
    dayThemeLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
    dayThemeText: { fontSize: 16, fontWeight: "700", color: "#fff" },

    // Transport
    transportCard: {
        flexDirection: "row", alignItems: "center", gap: 8,
        backgroundColor: "#EFF6FF", paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 10, marginBottom: 15,
    },
    transportText: { fontSize: 13, color: COLORS.info, fontWeight: "500", flex: 1 },

    // Activity Card
    activityCard: { marginBottom: 12, borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    activityGradient: { padding: 16 },
    activityHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    timeSlotBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    timeSlotText: { fontSize: 12, fontWeight: "700" },
    timeText: { fontSize: 12, color: COLORS.textLight, fontWeight: "500" },
    activityContent: {},
    activityPlace: { fontSize: 17, fontWeight: "700", color: COLORS.textDark, marginBottom: 4 },
    activityDescription: { fontSize: 14, lineHeight: 20, color: COLORS.textMedium, marginBottom: 8 },
    activityTipRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 4, backgroundColor: "rgba(245,158,11,0.08)", padding: 8, borderRadius: 8 },
    activityTip: { fontSize: 12, color: COLORS.textMedium, flex: 1, lineHeight: 18 },
    activityCostBadge: { alignSelf: "flex-start", marginTop: 8, backgroundColor: COLORS.success + "15", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    activityCostText: { fontSize: 13, fontWeight: "700", color: COLORS.success },

    // Meals
    mealsCard: {
        backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, marginTop: 4, marginBottom: 12,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    mealsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    mealsTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textDark },
    mealRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    mealIconBox: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
    mealInfo: { flex: 1 },
    mealLabel: { fontSize: 11, fontWeight: "600", color: COLORS.textLight, textTransform: "uppercase", letterSpacing: 0.5 },
    mealRestaurant: { fontSize: 14, fontWeight: "600", color: COLORS.textDark, marginTop: 1 },
    mealCuisine: { fontSize: 12, color: COLORS.textLight },
    mealCost: { fontSize: 14, fontWeight: "700", color: COLORS.textDark },

    // Hotel
    hotelCard: {
        backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, marginBottom: 12,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    hotelHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    hotelTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textDark },
    hotelContent: { flexDirection: "row", alignItems: "center" },
    hotelIconContainer: { marginRight: 12 },
    hotelIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    hotelInfo: { flex: 1 },
    hotelName: { fontSize: 15, fontWeight: "600", color: COLORS.textDark },
    hotelPrice: { fontSize: 13, color: COLORS.primary, fontWeight: "600", marginTop: 2 },

    // Budget
    budgetSection: { paddingHorizontal: 20, marginTop: 20 },
    budgetHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    budgetHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    budgetTotalCard: { borderRadius: 16, overflow: "hidden", marginBottom: 12 },
    budgetTotalGradient: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 20 },
    budgetTotalLabel: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
    budgetTotalAmount: { fontSize: 30, fontWeight: "800", color: "#fff", marginTop: 2 },
    budgetCurrency: { fontSize: 14, fontWeight: "600" },
    budgetPerDay: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
    budgetPerDayAmount: { fontSize: 18, fontWeight: "800", color: "#fff" },
    budgetPerDayLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
    budgetBreakdown: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    budgetItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    budgetItemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    budgetItemIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    budgetItemLabel: { fontSize: 14, fontWeight: "600", color: COLORS.textDark },
    budgetBarContainer: { height: 4, width: 110, backgroundColor: "#F3F4F6", borderRadius: 2, marginTop: 4 },
    budgetBar: { height: 4, borderRadius: 2 },
    budgetItemAmount: { fontSize: 15, fontWeight: "700", color: COLORS.textDark },

    // Tips
    tipsSection: { paddingHorizontal: 20, marginTop: 25 },
    tipsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 15 },
    tipCard: {
        flexDirection: "row", alignItems: "flex-start", gap: 12,
        backgroundColor: COLORS.cardBg, padding: 14, borderRadius: 14, marginBottom: 10,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    tipNumber: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.warning + "15", alignItems: "center", justifyContent: "center" },
    tipNumberText: { fontSize: 12, fontWeight: "800", color: COLORS.warning },
    tipText: { fontSize: 13, lineHeight: 20, color: COLORS.textMedium, flex: 1 },

    // Packing
    packingSection: { paddingHorizontal: 20, marginTop: 25 },
    packingHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 15 },
    packingGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    packingItem: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: COLORS.cardBg, paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    },
    packingItemText: { fontSize: 13, color: COLORS.textDark, fontWeight: "500" },

    // Hotel Options
    hotelOptionsSection: { paddingHorizontal: 20, marginTop: 25 },
    hotelOptionsSectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    hotelOptionsSubtitle: { fontSize: 13, color: COLORS.textLight, marginBottom: 14 },
    hotelOptionCard: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 14, marginBottom: 10,
        borderWidth: 2, borderColor: COLORS.border,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    hotelOptionCardSelected: { shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
    hotelOptionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    hotelOptionIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
    hotelOptionInfo: { flex: 1 },
    hotelOptionNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
    hotelOptionName: { fontSize: 14, fontWeight: "700", color: COLORS.textDark, flexShrink: 1 },
    recommendedBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    recommendedText: { fontSize: 10, fontWeight: "700" },
    hotelOptionMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 },
    hotelOptionTier: { fontSize: 12, color: COLORS.textLight, fontWeight: "500" },
    hotelOptionRating: { flexDirection: "row", alignItems: "center", gap: 2 },
    hotelOptionRatingText: { fontSize: 12, color: COLORS.textMedium, fontWeight: "600" },
    hotelOptionRight: { alignItems: "flex-end", marginLeft: 10 },
    hotelOptionPrice: { fontSize: 15, fontWeight: "800", color: COLORS.textDark },
    hotelOptionPriceLabel: { fontSize: 11, color: COLORS.textLight },
});

export default TripPlanDetailScreen;
