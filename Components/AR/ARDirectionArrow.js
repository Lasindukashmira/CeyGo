import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistance } from '../../Services/ARWallService';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#2c5aa0',
    accent: '#7C3AED',
    text: '#1A1A1A',
    textLight: '#757575',
    white: '#FFFFFF',
};

const ARDirectionArrow = ({ distance, bearing, placeName }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const ringAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        // Pulse the arrow
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Ring expand
        Animated.loop(
            Animated.sequence([
                Animated.timing(ringAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(ringAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Glow
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 0.7,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.3,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const ringScale = ringAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2.5],
    });
    const ringOpacity = ringAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 0],
    });

    const isVeryClose = distance < 50;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <MaterialCommunityIcons name="map-marker-path" size={20} color={COLORS.accent} />
                <Text style={styles.headerText}>Navigating to Wall</Text>
            </View>

            {/* Place name */}
            <Text style={styles.placeName} numberOfLines={1}>{placeName}</Text>

            {/* Arrow Container */}
            <View style={styles.arrowContainer}>
                {/* Expanding ring */}
                <Animated.View
                    style={[
                        styles.expandingRing,
                        {
                            transform: [{ scale: ringScale }],
                            opacity: ringOpacity,
                        },
                    ]}
                />

                {/* Glow circle */}
                <Animated.View style={[styles.glowCircle, { opacity: glowAnim }]} />

                {/* Arrow */}
                <Animated.View
                    style={[
                        styles.arrowWrapper,
                        {
                            transform: [
                                { scale: pulseAnim },
                                { rotate: `${bearing}deg` },
                            ],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={isVeryClose ? ['#10B981', '#059669'] : [COLORS.accent, '#9333EA']}
                        style={styles.arrowGradient}
                    >
                        <MaterialCommunityIcons
                            name={isVeryClose ? "check-circle" : "navigation"}
                            size={40}
                            color="#fff"
                        />
                    </LinearGradient>
                </Animated.View>
            </View>

            {/* Distance */}
            <View style={styles.distanceContainer}>
                <Text style={styles.distanceValue}>{formatDistance(distance)}</Text>
                <Text style={styles.distanceLabel}>
                    {isVeryClose ? "You're here! Tap to open the wall" : "to the wall"}
                </Text>
            </View>

            {/* Direction hint */}
            {!isVeryClose && (
                <View style={styles.hint}>
                    <MaterialCommunityIcons name="walk" size={16} color={COLORS.textLight} />
                    <Text style={styles.hintText}>
                        ~{Math.ceil(distance / 80)} min walk
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    headerText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.accent,
        letterSpacing: 0.3,
    },
    placeName: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 30,
        textAlign: 'center',
    },
    arrowContainer: {
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    expandingRing: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: COLORS.accent,
    },
    glowCircle: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
    },
    arrowWrapper: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    arrowGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    distanceContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    distanceValue: {
        fontSize: 36,
        fontWeight: '800',
        color: COLORS.text,
    },
    distanceLabel: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 2,
    },
    hint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.04)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    hintText: {
        fontSize: 13,
        color: COLORS.textLight,
        fontWeight: '500',
    },
});

export default ARDirectionArrow;
