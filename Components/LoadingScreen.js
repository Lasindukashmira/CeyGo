import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const LoadingScreen = ({ message = "Loading..." }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>CeyGo</Text>
                    <View style={styles.dot} />
                </View>
                <Text style={styles.tagline}>Discover Sri Lanka</Text>

                {/* Loader */}
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>{message}</Text>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2c5aa0', // Main brand color
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 5,
    },
    logoText: {
        fontSize: 50,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
    },
    dot: {
        width: 10,
        height: 10,
        backgroundColor: '#FFD700', // Gold accent
        borderRadius: 5,
        marginLeft: 4,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        marginBottom: 50,
        letterSpacing: 1,
    },
    loaderContainer: {
        alignItems: 'center',
        gap: 15,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '500',
    }
});

export default LoadingScreen;
