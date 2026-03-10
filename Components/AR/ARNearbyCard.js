import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistance } from '../../Services/ARWallService';

const COLORS = {
    primary: '#2c5aa0',
    primaryDark: '#1a3b70',
    gold: '#FFD700',
    accent: '#7C3AED',
    bg: '#F8F9FB',
    text: '#1A1A1A',
    textLight: '#757575',
    white: '#FFFFFF',
    success: '#10B981',
};

const ARNearbyCard = ({ place, distance, onNavigate, onViewWall, totalMessages }) => {
    const isClose = distance < 500; // Within 500m
    const isVeryClose = distance < 50;  // Within 50m — can access wall

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={isVeryClose ? onViewWall : onNavigate}
        >
            {/* Place Image */}
            <Image
                source={{ uri: place.image_urls?.[0] || 'https://images.unsplash.com/photo-1586619782390-50d4d8fc38b3?w=400' }}
                style={styles.cardImage}
            />

            {/* Distance Badge */}
            <View style={[styles.distanceBadge, isClose && styles.distanceBadgeClose]}>
                <MaterialCommunityIcons
                    name={isVeryClose ? "check-circle" : isClose ? "walk" : "map-marker-distance"}
                    size={12}
                    color={isClose ? "#fff" : COLORS.primary}
                />
                <Text style={[styles.distanceText, isClose && styles.distanceTextClose]}>
                    {formatDistance(distance)}
                </Text>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
                <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                <Text style={styles.placeDistrict} numberOfLines={1}>
                    {place.geolocation?.district}, {place.geolocation?.province}
                </Text>

                {/* Wall Activity */}
                <View style={styles.wallActivity}>
                    <MaterialCommunityIcons name="wall" size={14} color={COLORS.accent} />
                    <Text style={styles.wallActivityText}>
                        {totalMessages || 0} {totalMessages === 1 ? 'message' : 'messages'} on wall
                    </Text>
                </View>

                {/* Action Button */}
                {isVeryClose ? (
                    <TouchableOpacity onPress={onViewWall} activeOpacity={0.8}>
                        <LinearGradient
                            colors={[COLORS.accent, '#9333EA']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.actionBtn}
                        >
                            <MaterialCommunityIcons name="cube-scan" size={14} color="#fff" />
                            <Text style={styles.actionBtnText}>Open Wall</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={onNavigate} style={styles.navigateBtn} activeOpacity={0.8}>
                        <MaterialCommunityIcons name="navigation-variant" size={14} color={COLORS.primary} />
                        <Text style={styles.navigateBtnText}>
                            {isClose ? 'Almost there!' : 'Navigate'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginHorizontal: 20,
        marginBottom: 14,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    cardImage: {
        width: 110,
        height: '100%',
        minHeight: 140,
    },
    distanceBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    distanceBadgeClose: {
        backgroundColor: COLORS.success,
    },
    distanceText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.primary,
    },
    distanceTextClose: {
        color: '#fff',
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    placeName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    placeDistrict: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    wallActivity: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 10,
    },
    wallActivityText: {
        fontSize: 11,
        color: COLORS.accent,
        fontWeight: '600',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 10,
    },
    actionBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    navigateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    navigateBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
});

export default ARNearbyCard;
