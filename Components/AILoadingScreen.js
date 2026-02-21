import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Rotating status messages
const AI_MESSAGES = [
    { text: "AI is analyzing your preferences...", icon: "brain" },
    { text: "Discovering hidden gems for you...", icon: "diamond-stone" },
    { text: "Crafting the perfect itinerary...", icon: "map-marker-path" },
    { text: "Finding the best hotels & stays...", icon: "bed-outline" },
    { text: "Curating local dining experiences...", icon: "silverware-fork-knife" },
    { text: "Optimizing your travel budget...", icon: "calculator-variant-outline" },
    { text: "Almost there, hang tight...", icon: "rocket-launch-outline" },
    { text: "Adding finishing touches...", icon: "creation" },
];

// Floating particle component
const FloatingParticle = ({ delay, size, startX, startY, duration }) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animateParticle = () => {
            translateY.setValue(0);
            translateX.setValue(0);
            opacity.setValue(0);

            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: -height * 0.4,
                        duration: duration,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateX, {
                        toValue: (Math.random() - 0.5) * 100,
                        duration: duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.timing(opacity, {
                            toValue: 0.6,
                            duration: duration * 0.2,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0.6,
                            duration: duration * 0.5,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: duration * 0.3,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]).start(() => animateParticle());
        };

        animateParticle();
    }, []);

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    left: startX,
                    bottom: startY,
                    opacity,
                    transform: [{ translateY }, { translateX }],
                },
            ]}
        />
    );
};

const AILoadingScreen = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    // --- Animations ---
    const ringRotation1 = useRef(new Animated.Value(0)).current;
    const ringRotation2 = useRef(new Animated.Value(0)).current;
    const ringRotation3 = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;
    const messageFade = useRef(new Animated.Value(1)).current;
    const messageSlide = useRef(new Animated.Value(0)).current;
    const dotScale1 = useRef(new Animated.Value(0.4)).current;
    const dotScale2 = useRef(new Animated.Value(0.4)).current;
    const dotScale3 = useRef(new Animated.Value(0.4)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;
    const bgShimmer = useRef(new Animated.Value(0)).current;

    // Rotating rings
    useEffect(() => {
        const spin = (anim, duration) => {
            Animated.loop(
                Animated.timing(anim, {
                    toValue: 1,
                    duration,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        };
        spin(ringRotation1, 3000);
        spin(ringRotation2, 5000);
        spin(ringRotation3, 7000);
    }, []);

    // Center icon pulse
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();
    }, []);

    // Glow effect
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 0.8, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0.3, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();
    }, []);

    // Background shimmer
    useEffect(() => {
        Animated.loop(
            Animated.timing(bgShimmer, {
                toValue: 1,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    // "Typing" dots animation
    useEffect(() => {
        const animateDot = (dot, delay) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0.4, duration: 300, useNativeDriver: true }),
                ])
            ).start();
        };
        animateDot(dotScale1, 0);
        animateDot(dotScale2, 200);
        animateDot(dotScale3, 400);
    }, []);

    // Rotating messages with fade in/out
    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out
            Animated.parallel([
                Animated.timing(messageFade, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(messageSlide, { toValue: -20, duration: 400, useNativeDriver: true }),
            ]).start(() => {
                setMessageIndex(prev => (prev + 1) % AI_MESSAGES.length);
                messageSlide.setValue(20);
                // Fade in
                Animated.parallel([
                    Animated.timing(messageFade, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.timing(messageSlide, { toValue: 0, duration: 400, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
                ]).start();
            });
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    // Slow progress bar
    useEffect(() => {
        Animated.timing(progressWidth, {
            toValue: 1,
            duration: 45000, // 45 seconds to fill
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, []);

    // Interpolations
    const spin1 = ringRotation1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const spin2 = ringRotation2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
    const spin3 = ringRotation3.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const shimmerTranslate = bgShimmer.interpolate({ inputRange: [0, 1], outputRange: [-width, width] });

    const progressWidthInterp = progressWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '85%'], // Never fully fills (AI dependent)
    });

    const currentMessage = AI_MESSAGES[messageIndex];

    // Particle data
    const particles = [
        { delay: 0, size: 4, startX: width * 0.15, startY: 80, duration: 4000 },
        { delay: 600, size: 3, startX: width * 0.4, startY: 60, duration: 5000 },
        { delay: 1200, size: 5, startX: width * 0.7, startY: 100, duration: 4500 },
        { delay: 1800, size: 3, startX: width * 0.25, startY: 40, duration: 5500 },
        { delay: 2400, size: 4, startX: width * 0.85, startY: 70, duration: 4200 },
        { delay: 800, size: 3, startX: width * 0.55, startY: 90, duration: 5200 },
        { delay: 1500, size: 4, startX: width * 0.1, startY: 50, duration: 4800 },
        { delay: 2000, size: 3, startX: width * 0.65, startY: 30, duration: 5000 },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0a0e27', '#0f1845', '#161b4d', '#0d1138']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Shimmer overlay */}
            <Animated.View
                style={[
                    styles.shimmerOverlay,
                    { transform: [{ translateX: shimmerTranslate }] },
                ]}
            />

            {/* Floating particles */}
            {particles.map((p, i) => (
                <FloatingParticle key={i} {...p} />
            ))}

            {/* Top text */}
            <View style={styles.topSection}>
                <View style={styles.topBadge}>
                    <MaterialCommunityIcons name="creation" size={12} color="#FFD700" />
                    <Text style={styles.topBadgeText}>AI POWERED</Text>
                </View>
                <Text style={styles.topTitle}>Creating Your{'\n'}Dream Trip</Text>
                <Text style={styles.topSubtitle}>
                    Our AI is analyzing thousands of options{'\n'}to build your perfect itinerary
                </Text>
            </View>

            {/* Orbital rings + Center icon */}
            <View style={styles.orbitalContainer}>
                {/* Outer glow */}
                <Animated.View style={[styles.outerGlow, { opacity: glowAnim }]} />

                {/* Ring 3 (outermost) */}
                <Animated.View style={[styles.ring, styles.ring3, { transform: [{ rotate: spin3 }] }]}>
                    <View style={styles.ringDot3} />
                </Animated.View>

                {/* Ring 2 */}
                <Animated.View style={[styles.ring, styles.ring2, { transform: [{ rotate: spin2 }] }]}>
                    <View style={styles.ringDot2} />
                </Animated.View>

                {/* Ring 1 (inner) */}
                <Animated.View style={[styles.ring, styles.ring1, { transform: [{ rotate: spin1 }] }]}>
                    <View style={styles.ringDot1} />
                </Animated.View>

                {/* Center brain icon */}
                <Animated.View style={[styles.centerIcon, { transform: [{ scale: pulseAnim }] }]}>
                    <LinearGradient
                        colors={['#4F46E5', '#7C3AED', '#A855F7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.centerIconGradient}
                    >
                        <MaterialCommunityIcons name="brain" size={36} color="#fff" />
                    </LinearGradient>
                </Animated.View>
            </View>

            {/* Rotating message */}
            <View style={styles.messageSection}>
                <Animated.View
                    style={[
                        styles.messageContainer,
                        {
                            opacity: messageFade,
                            transform: [{ translateY: messageSlide }],
                        },
                    ]}
                >
                    <View style={styles.messageIconBox}>
                        <MaterialCommunityIcons name={currentMessage.icon} size={18} color="#A78BFA" />
                    </View>
                    <Text style={styles.messageText}>{currentMessage.text}</Text>
                </Animated.View>

                {/* Typing dots */}
                <View style={styles.dotsContainer}>
                    <Animated.View style={[styles.dot, { opacity: dotScale1, transform: [{ scale: dotScale1 }] }]} />
                    <Animated.View style={[styles.dot, { opacity: dotScale2, transform: [{ scale: dotScale2 }] }]} />
                    <Animated.View style={[styles.dot, { opacity: dotScale3, transform: [{ scale: dotScale3 }] }]} />
                </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressSection}>
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: progressWidthInterp }]}>
                        <LinearGradient
                            colors={['#4F46E5', '#7C3AED', '#A855F7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFillObject}
                        />
                    </Animated.View>
                </View>
                <Text style={styles.progressHint}>This may take a moment — great things take time ✨</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width * 0.6,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.02)',
        transform: [{ skewX: '-20deg' }],
    },

    // Particles
    particle: {
        position: 'absolute',
        backgroundColor: 'rgba(167, 139, 250, 0.5)',
    },

    // Top Section
    topSection: {
        alignItems: 'center',
        marginBottom: 50,
        paddingHorizontal: 40,
    },
    topBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255, 215, 0, 0.12)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
        marginBottom: 16,
    },
    topBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FFD700',
        letterSpacing: 1.5,
    },
    topTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: -0.5,
        lineHeight: 38,
        marginBottom: 10,
    },
    topSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Orbital Container
    orbitalContainer: {
        width: 220,
        height: 220,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
    },
    outerGlow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(79, 70, 229, 0.15)',
    },
    ring: {
        position: 'absolute',
        borderRadius: 999,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    ring1: {
        width: 100,
        height: 100,
        borderColor: 'rgba(79, 70, 229, 0.5)',
    },
    ring2: {
        width: 150,
        height: 150,
        borderColor: 'rgba(124, 58, 237, 0.35)',
    },
    ring3: {
        width: 200,
        height: 200,
        borderColor: 'rgba(168, 85, 247, 0.2)',
    },
    ringDot1: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4F46E5',
        marginTop: -4,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 6,
    },
    ringDot2: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#7C3AED',
        marginTop: -3,
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 6,
    },
    ringDot3: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#A855F7',
        marginTop: -2.5,
        shadowColor: '#A855F7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 6,
    },

    // Center Icon
    centerIcon: {
        position: 'absolute',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    centerIconGradient: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Message Section
    messageSection: {
        alignItems: 'center',
        height: 80,
        justifyContent: 'center',
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    messageIconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
        letterSpacing: -0.2,
    },

    // Typing Dots
    dotsContainer: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 16,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#A78BFA',
    },

    // Progress
    progressSection: {
        position: 'absolute',
        bottom: 60,
        width: width - 80,
        alignItems: 'center',
    },
    progressTrack: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressHint: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.35)',
        marginTop: 12,
        fontWeight: '500',
    },
});

export default AILoadingScreen;
