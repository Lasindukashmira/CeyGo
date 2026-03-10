import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    StatusBar,
    Animated,
    Easing,
    Platform,
    Alert,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import ARNearbyCard from '../Components/AR/ARNearbyCard';
import ARDirectionArrow from '../Components/AR/ARDirectionArrow';
import ARWallView from '../Components/AR/ARWallView';
import {
    fetchARPlaces,
    calculateDistance,
    calculateBearing,
    formatDistance,
    createTestWallAtLocation,
} from '../Services/ARWallService';
import { useAuth } from '../AuthContext';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#2c5aa0',
    primaryDark: '#1a3b70',
    accent: '#7C3AED',
    accentLight: '#EDE9FE',
    bg: '#F8F9FB',
    text: '#1A1A1A',
    textLight: '#757575',
    white: '#FFFFFF',
    success: '#10B981',
    gold: '#FBBF24',
};

// Configure notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// Modes
const MODE = {
    DISCOVER: 'discover',
    NAVIGATE: 'navigate',
    WALL: 'wall',
};

const ARScreen = () => {
    const { user } = useAuth();
    const [mode, setMode] = useState(MODE.DISCOVER);
    const [places, setPlaces] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifiedPlaces, setNotifiedPlaces] = useState(new Set());
    const locationSubRef = useRef(null);
    const headerAnim = useRef(new Animated.Value(0)).current;

    // Animate header on mount
    useEffect(() => {
        Animated.timing(headerAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
        }).start();
    }, []);

    // Request notification permissions
    useEffect(() => {
        (async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('[AR] Notification permission not granted');
            }
        })();
    }, []);

    // Load places and start location tracking
    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            const init = async () => {
                setLoading(true);
                try {
                    // Request location permission
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert(
                            'Location Required',
                            'Please enable location services to use AR features.',
                            [{ text: 'OK' }]
                        );
                        setLoading(false);
                        return;
                    }

                    // Get initial location
                    const loc = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    if (isMounted) {
                        setUserLocation(loc.coords);
                    }

                    // Fetch AR places
                    const arPlaces = await fetchARPlaces();
                    if (isMounted) {
                        setPlaces(arPlaces);
                        setLoading(false);
                    }

                    // Start watching location
                    locationSubRef.current = await Location.watchPositionAsync(
                        {
                            accuracy: Location.Accuracy.Balanced,
                            timeInterval: 5000,
                            distanceInterval: 10,
                        },
                        (newLoc) => {
                            if (isMounted) {
                                setUserLocation(newLoc.coords);
                            }
                        }
                    );
                } catch (error) {
                    console.error('[AR] Init error:', error);
                    if (isMounted) setLoading(false);
                }
            };

            init();

            return () => {
                isMounted = false;
                if (locationSubRef.current) {
                    locationSubRef.current.remove();
                }
            };
        }, [])
    );

    // Check proximity and send notifications
    useEffect(() => {
        if (!userLocation || places.length === 0) return;

        places.forEach((place) => {
            if (!place.geolocation?.latitude || !place.geolocation?.longitude) return;

            const dist = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                place.geolocation.latitude,
                place.geolocation.longitude
            );

            // Send notification when within 500m and haven't notified yet
            if (dist < 500 && !notifiedPlaces.has(place.id)) {
                sendProximityNotification(place, dist);
                setNotifiedPlaces((prev) => new Set(prev).add(place.id));
            }
        });
    }, [userLocation, places]);

    const sendProximityNotification = async (place, distance) => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🧱 AR Wall Nearby!',
                    body: `${place.name} community wall is ${formatDistance(distance)} away. Open the app to view and sign it!`,
                    data: { placeId: place.id },
                },
                trigger: null, // Immediate
            });
        } catch (error) {
            console.error('[AR] Notification error:', error);
        }
    };

    // Calculate distances and sort places
    const placesWithDistance = places
        .map((p) => {
            if (!userLocation || !p.geolocation?.latitude) return { ...p, distance: Infinity };
            const dist = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                p.geolocation.latitude,
                p.geolocation.longitude
            );
            const bear = calculateBearing(
                userLocation.latitude,
                userLocation.longitude,
                p.geolocation.latitude,
                p.geolocation.longitude
            );
            return { ...p, distance: dist, bearing: bear };
        })
        .sort((a, b) => a.distance - b.distance);

    const handleNavigate = (place) => {
        setSelectedPlace(place);
        setMode(MODE.NAVIGATE);
    };

    const handleOpenWall = (place) => {
        setSelectedPlace(place);
        setMode(MODE.WALL);
    };

    const handleBack = () => {
        setSelectedPlace(null);
        setMode(MODE.DISCOVER);
    };

    // Create a test wall at current location for testing
    const handleCreateTestWall = async () => {
        if (!userLocation) {
            Alert.alert('Location not available', 'Please wait for GPS to lock.');
            return;
        }
        try {
            setLoading(true);
            await createTestWallAtLocation(userLocation.latitude, userLocation.longitude);
            // Refresh places
            const arPlaces = await fetchARPlaces();
            setPlaces(arPlaces);
            setLoading(false);
            Alert.alert('✅ Test Wall Created!', 'A wall has been placed at your current location. It should appear at 0m distance in the list.');
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', 'Failed to create test wall: ' + error.message);
        }
    };

    // === WALL MODE ===
    if (mode === MODE.WALL && selectedPlace) {
        return <ARWallView place={selectedPlace} onClose={handleBack} />;
    }

    // === NAVIGATE / DISCOVER MODE ===
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: headerAnim,
                        transform: [{
                            translateY: headerAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0],
                            })
                        }],
                    },
                ]}
            >
                {mode === MODE.NAVIGATE ? (
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerIcon}>
                        <MaterialCommunityIcons name="cube-scan" size={24} color={COLORS.accent} />
                    </View>
                )}
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>
                        {mode === MODE.NAVIGATE ? 'Navigate to Wall' : 'AR Experience'}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        {mode === MODE.NAVIGATE
                            ? selectedPlace?.name
                            : `${placesWithDistance.filter((p) => p.distance < 500).length} walls nearby`}
                    </Text>
                </View>
                {mode === MODE.DISCOVER && (
                    <View style={styles.locationBadge}>
                        <MaterialCommunityIcons name="crosshairs-gps" size={14} color={COLORS.success} />
                        <Text style={styles.locationBadgeText}>Live</Text>
                    </View>
                )}
            </Animated.View>

            {/* Loading */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                    <Text style={styles.loadingText}>Finding AR walls near you...</Text>
                </View>
            ) : mode === MODE.NAVIGATE && selectedPlace ? (
                /* NAVIGATE MODE */
                <View style={styles.navigateContainer}>
                    <ARDirectionArrow
                        distance={selectedPlace.distance}
                        bearing={selectedPlace.bearing}
                        placeName={selectedPlace.name}
                    />

                    {/* Open Wall button — only when close enough */}
                    {selectedPlace.distance < 500 && (
                        <TouchableOpacity
                            onPress={() => handleOpenWall(selectedPlace)}
                            activeOpacity={0.85}
                            style={styles.openWallBtnContainer}
                        >
                            <LinearGradient
                                colors={[COLORS.accent, '#9333EA']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.openWallBtn}
                            >
                                <MaterialCommunityIcons name="wall" size={20} color="#fff" />
                                <Text style={styles.openWallBtnText}>Open Community Wall</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                /* DISCOVER MODE */
                <>
                    {/* Nearby alert banner */}
                    {placesWithDistance.some((p) => p.distance < 500) && (
                        <View style={styles.nearbyBanner}>
                            <LinearGradient
                                colors={[COLORS.accentLight, '#F3E8FF']}
                                style={styles.nearbyBannerGradient}
                            >
                                <MaterialCommunityIcons name="map-marker-radius" size={20} color={COLORS.accent} />
                                <Text style={styles.nearbyBannerText}>
                                    {placesWithDistance.filter((p) => p.distance < 500).length} AR wall{placesWithDistance.filter((p) => p.distance < 500).length > 1 ? 's' : ''} near you!
                                </Text>
                            </LinearGradient>
                        </View>
                    )}

                    {/* Places List */}
                    {placesWithDistance.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="cube-scan" size={60} color="#ddd" />
                            <Text style={styles.emptyTitle}>No AR Walls Found</Text>
                            <Text style={styles.emptyText}>
                                AR community walls are placed at famous locations.{'\n'}
                                Explore Sri Lanka to discover them!
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={placesWithDistance}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <ARNearbyCard
                                    place={item}
                                    distance={item.distance}
                                    onNavigate={() => handleNavigate(item)}
                                    onViewWall={() => handleOpenWall(item)}
                                    totalMessages={0}
                                />
                            )}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={
                                <Text style={styles.sectionTitle}>
                                    {placesWithDistance.some((p) => p.distance < 500)
                                        ? 'Nearby Walls'
                                        : 'All AR Walls'}
                                </Text>
                            }
                        />
                    )}

                    {/* DEV: Add test wall button */}
                    {userLocation && (
                        <TouchableOpacity
                            onPress={handleCreateTestWall}
                            style={styles.testWallBtn}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#F59E0B', '#D97706']}
                                style={styles.testWallBtnGradient}
                            >
                                <MaterialCommunityIcons name="map-marker-plus" size={18} color="#fff" />
                                <Text style={styles.testWallBtnText}>Create Test Wall Here</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    headerIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: COLORS.accentLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 1,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    locationBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.success,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 14,
    },

    // Nearby Banner
    nearbyBanner: {
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 12,
        overflow: 'hidden',
    },
    nearbyBannerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    nearbyBannerText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.accent,
    },

    // List
    listContent: {
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginHorizontal: 20,
        marginBottom: 12,
        marginTop: 6,
    },

    // Empty
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 20,
    },

    // Navigate mode
    navigateContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    openWallBtnContainer: {
        paddingHorizontal: 40,
        marginTop: 20,
    },
    openWallBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
    },
    openWallBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },

    // Test wall button
    testWallBtn: {
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    testWallBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
    },
    testWallBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
});

export default ARScreen;
