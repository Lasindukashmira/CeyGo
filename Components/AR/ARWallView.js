/**
 * ARWallView.js — Immersive Location-Based AR
 *
 * Real-world scale: The wall is 3m wide × 2m tall. Its pixel size is
 * computed using the pinhole camera model so it matches the real
 * environment as seen through the camera.
 *
 * Device pitch: Uses DeviceMotion (beta) to know if the phone is
 * tilted up or down, so objects sit on the ground / horizon correctly.
 *
 * Game-style path trail: Arrow markers are spaced at real-world meter
 * intervals between the user and the wall, projected onto the ground
 * plane with full perspective. Like Google Maps AR or game navigation.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    Animated,
    Easing,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { DeviceMotion } from 'expo-sensors';
import { useAuth } from '../../AuthContext';
import {
    fetchWallMessages,
    postWallMessage,
    ensureWallExists,
    calculateDistance,
    calculateBearing,
} from '../../Services/ARWallService';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Camera intrinsics (typical smartphone) ─────────────────
const H_FOV_DEG = 63;   // horizontal field of view
const V_FOV_DEG = 50;   // vertical field of view
const H_FOV = (H_FOV_DEG * Math.PI) / 180;
const V_FOV = (V_FOV_DEG * Math.PI) / 180;
const FOCAL_PX_H = SW / (2 * Math.tan(H_FOV / 2)); // focal length in px
const FOCAL_PX_V = SH / (2 * Math.tan(V_FOV / 2));

// ── Wall real-world size (meters) ──────────────────────────
const WALL_REAL_W = 3.0; // 3 meters wide
const WALL_REAL_H = 2.0; // 2 meters tall

const COLORS = {
    accent: '#7C3AED', accentDark: '#6D28D9',
    text: '#1A1A1A', textLight: '#757575',
};

const PEN_COLORS = [
    '#FFFFFF', '#FF4444', '#FBBF24', '#34D399',
    '#60A5FA', '#A78BFA', '#F472B6', '#FB923C',
];

// ══════════ Helpers ══════════
const degToRad = (d) => (d * Math.PI) / 180;
const radToDeg = (r) => (r * 180) / Math.PI;

/**
 * Project a real-world point onto screen pixels.
 *
 * @param {number} dist   – distance to object in meters
 * @param {number} hAngle – horizontal angle offset in degrees (+ = right)
 * @param {number} vAngle – vertical angle offset in degrees   (+ = up)
 * @param {number} realW  – object real-world width in meters
 * @param {number} realH  – object real-world height in meters
 * @returns {{ x, y, w, h }} screen coordinates and pixel size
 */
const projectToScreen = (dist, hAngle, vAngle, realW, realH) => {
    const hRad = degToRad(hAngle);
    const vRad = degToRad(vAngle);

    // Screen position from angle offset
    const x = SW / 2 + Math.tan(hRad) * FOCAL_PX_H;
    const y = SH / 2 - Math.tan(vRad) * FOCAL_PX_V; // minus because screen Y is inverted

    // Pixel size from real size + distance (pinhole model)
    const w = (realW / Math.max(dist, 0.5)) * FOCAL_PX_H;
    const h = (realH / Math.max(dist, 0.5)) * FOCAL_PX_V;

    return { x, y, w, h };
};

const formatDist = (m) => m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
const getCardinal = (d) => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(d / 45) % 8];


// ══════════════════════════════════════════════════
// 🧱  3D BRICK WALL FACE
// ══════════════════════════════════════════════════
const BrickFace = ({ w, h, messages }) => {
    const brickH = Math.max(6, h / 12);
    const brickW = Math.max(10, w / 5);
    const gap = Math.max(1, w * 0.005);
    const rows = Math.ceil(h / (brickH + gap));

    return (
        <View style={{ width: w, height: h, overflow: 'hidden', backgroundColor: '#7A6455' }}>
            {Array.from({ length: rows }).map((_, r) => {
                const off = r % 2 === 1;
                const cnt = Math.ceil(w / (brickW + gap)) + 1;
                return (
                    <View key={r} style={{ flexDirection: 'row', marginBottom: gap, marginLeft: off ? -(brickW * 0.5) : 0 }}>
                        {Array.from({ length: cnt }).map((_, c) => {
                            const s = (r * 7 + c * 13) % 25;
                            return (
                                <View key={c} style={{
                                    width: brickW, height: brickH, marginRight: gap, borderRadius: 1,
                                    backgroundColor: `rgb(${155 + s},${90 + s * 0.6},${65 + s * 0.4})`,
                                    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.08)',
                                    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.15)',
                                }} />
                            );
                        })}
                    </View>
                );
            })}

            {/* Messages layer */}
            <View style={StyleSheet.absoluteFillObject}>
                {messages.length === 0 ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{
                            fontSize: Math.max(10, w / 16), color: 'rgba(255,255,255,0.75)', fontWeight: '800',
                            textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4,
                            textAlign: 'center',
                        }}>🎨 Write here!</Text>
                    </View>
                ) : (
                    messages.slice(0, 10).map((msg, idx) => (
                        <Graffiti key={msg.id} msg={msg} idx={idx} wallW={w} wallH={h} />
                    ))
                )}
            </View>
        </View>
    );
};

const Graffiti = ({ msg, idx, wallW, wallH }) => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => { Animated.spring(anim, { toValue: 1, delay: idx * 80, friction: 6, useNativeDriver: true }).start(); }, []);
    const maxTW = wallW * 0.35;
    const x = msg.position?.x != null ? Math.min(msg.position.x, wallW - maxTW - 8) : ((msg.text.charCodeAt(0) * 7 + idx * 53) % Math.max(1, wallW - maxTW - 8)) + 8;
    const y = msg.position?.y != null ? Math.min(msg.position.y, wallH - 30) : ((msg.text.charCodeAt(Math.min(1, msg.text.length - 1)) * 11 + idx * 47) % Math.max(1, wallH - 30)) + 8;
    const rot = ((idx * 7 + (msg.text.charCodeAt(0) || 0)) % 7) - 3;
    return (
        <Animated.View style={{ position: 'absolute', left: x, top: y, maxWidth: maxTW, opacity: anim, transform: [{ scale: anim }, { rotate: `${rot}deg` }] }}>
            <Text style={{ fontSize: Math.max(8, wallW / 22), fontWeight: '900', fontStyle: 'italic', color: msg.color || '#fff', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 3 }}>
                {msg.text}
            </Text>
            <Text style={{ fontSize: Math.max(6, wallW / 38), color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>— {msg.userName}</Text>
        </Animated.View>
    );
};


// ══════════════════════════════════════════════════
// 🧱  3D WALL COMPOSITE (front + top + sides + shadow)
// ══════════════════════════════════════════════════
const Wall3D = ({ screenW, screenH, angleDiff, messages }) => {
    const depth = Math.max(4, screenW * 0.07);
    const sideAngle = Math.max(-25, Math.min(25, angleDiff * 0.9));

    return (
        <View style={{ alignItems: 'center' }}>
            {/* Ground shadow (ellipse under the wall) */}
            <View style={{ position: 'absolute', bottom: -Math.max(4, screenH * 0.04), width: screenW * 0.9, height: Math.max(6, screenH * 0.06), borderRadius: 200, backgroundColor: 'rgba(0,0,0,0.35)', transform: [{ scaleX: 1.1 }] }} />

            {/* TOP LEDGE */}
            <View style={{
                width: screenW, height: depth, backgroundColor: '#6B5548', borderTopLeftRadius: 2, borderTopRightRadius: 2,
                transform: [{ perspective: 600 }, { rotateX: '65deg' }, { skewX: `${sideAngle * 0.3}deg` }],
                borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.2)', marginBottom: -1,
            }} />

            {/* BODY */}
            <View style={{ flexDirection: 'row' }}>
                {sideAngle > 3 && <View style={{ width: Math.min(depth, Math.abs(sideAngle) * 0.7), height: screenH, backgroundColor: '#5D4A3D', transform: [{ perspective: 400 }, { rotateY: '-60deg' }], marginRight: -1 }} />}

                {/* FRONT FACE */}
                <View style={{
                    width: screenW, height: screenH, borderWidth: 2, borderColor: '#4A3728', borderRadius: 2, overflow: 'hidden',
                    transform: [{ perspective: 800 }, { rotateY: `${sideAngle * 0.15}deg` }],
                    shadowColor: '#000', shadowOffset: { width: 4, height: 8 }, shadowOpacity: 0.7, shadowRadius: 20, elevation: 20,
                }}>
                    <BrickFace w={screenW} h={screenH} messages={messages} />
                    {/* Directional light */}
                    <LinearGradient
                        colors={[`rgba(255,255,255,${sideAngle > 0 ? 0.07 : 0.02})`, 'rgba(0,0,0,0.1)']}
                        start={{ x: sideAngle > 0 ? 0 : 1, y: 0 }} end={{ x: sideAngle > 0 ? 1 : 0, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                </View>

                {sideAngle < -3 && <View style={{ width: Math.min(depth, Math.abs(sideAngle) * 0.7), height: screenH, backgroundColor: '#5D4A3D', transform: [{ perspective: 400 }, { rotateY: '60deg' }], marginLeft: -1 }} />}
            </View>

            {/* BOTTOM LEDGE */}
            <View style={{ width: screenW + 4, height: Math.max(3, depth * 0.3), backgroundColor: '#4A3728', borderBottomLeftRadius: 3, borderBottomRightRadius: 3, marginTop: -1 }} />
        </View>
    );
};


// ══════════════════════════════════════════════════
// 🔺  GAME-STYLE PATH TRAIL
// Each chevron is placed at a real-world meter position
// between user → wall, projected onto the ground plane.
// ══════════════════════════════════════════════════
const PathTrail = ({ heading, wallBearing, distance, pitch }) => {
    // How many arrows to show (every 3-5 meters, max 8)
    const spacing = distance < 20 ? 2 : distance < 80 ? 5 : 10;
    const count = Math.min(8, Math.max(2, Math.floor(distance / spacing)));

    // Compass angle diff
    let bearDiff = wallBearing - heading;
    while (bearDiff > 180) bearDiff -= 360;
    while (bearDiff < -180) bearDiff += 360;

    // If wall is behind us (>90°), show turn indicator instead
    if (Math.abs(bearDiff) > 90) {
        return <TurnIndicator angleDiff={bearDiff} distance={distance} />;
    }

    const arrows = [];
    for (let i = 1; i <= count; i++) {
        const d = i * spacing; // meters away along the path
        if (d >= distance) break;

        // Project this arrow onto the screen
        // Arrow is on the ground → vertical angle = pitch offset - atan(cameraHeight / d)
        const cameraH = 1.5; // phone held ~1.5m high
        const groundAngle = -radToDeg(Math.atan(cameraH / d)) + pitch; // pitch adjusts for phone tilt
        const { x, y } = projectToScreen(d, bearDiff, groundAngle, 0, 0);

        // Arrow size shrinks with distance (perspective)
        const arrowSize = Math.max(14, (1.2 / d) * FOCAL_PX_H * 0.8);

        // Only draw if on screen
        if (x > -50 && x < SW + 50 && y > 0 && y < SH + 50) {
            arrows.push(
                <PathArrow
                    key={i}
                    x={x}
                    y={y}
                    size={arrowSize}
                    index={i}
                    total={count}
                    depth={d}
                />
            );
        }
    }

    return <View style={StyleSheet.absoluteFillObject} pointerEvents="none">{arrows}</View>;
};

const PathArrow = ({ x, y, size, index, total, depth }) => {
    const pulse = useRef(new Animated.Value(0)).current;
    const appear = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(appear, { toValue: 1, duration: 400, delay: index * 100, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }).start();
        Animated.loop(Animated.sequence([
            Animated.timing(pulse, { toValue: 1, duration: 700, delay: index * 100, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])).start();
    }, []);

    const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
    const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
    // Color fades from bright (near) to dim (far)
    const intensity = Math.max(0.3, 1 - (index / total) * 0.7);

    return (
        <Animated.View style={{
            position: 'absolute',
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
            opacity: Animated.multiply(appear, glowOpacity),
            transform: [
                { scale: glowScale },
                { perspective: 500 },
                { rotateX: '60deg' }, // flat on ground
            ],
        }}>
            {/* Glow ring */}
            <View style={{
                width: size, height: size, borderRadius: size / 2,
                backgroundColor: `rgba(124, 58, 237, ${0.15 * intensity})`,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6 * intensity, shadowRadius: size * 0.4,
            }}>
                {/* Chevron */}
                <View style={{
                    width: 0, height: 0,
                    borderLeftWidth: size * 0.3, borderRightWidth: size * 0.3, borderBottomWidth: size * 0.5,
                    borderLeftColor: 'transparent', borderRightColor: 'transparent',
                    borderBottomColor: `rgba(124, 58, 237, ${0.9 * intensity})`,
                }} />
            </View>
        </Animated.View>
    );
};


// ══════════════════════════════════════════════════
//  ↩  TURN INDICATOR (when wall is behind you)
// ══════════════════════════════════════════════════
const TurnIndicator = ({ angleDiff, distance }) => {
    const isLeft = angleDiff < 0;
    const absAngle = Math.abs(angleDiff);
    const pulse = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
        ])).start();
    }, []);

    return (
        <View style={[StyleSheet.absoluteFillObject, { alignItems: isLeft ? 'flex-start' : 'flex-end', justifyContent: 'center', paddingHorizontal: 12 }]} pointerEvents="none">
            {/* Edge glow */}
            <LinearGradient
                colors={isLeft ? ['rgba(124,58,237,0.25)', 'transparent'] : ['transparent', 'rgba(124,58,237,0.25)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', top: 0, bottom: 0, width: 80, [isLeft ? 'left' : 'right']: 0 }}
            />

            <Animated.View style={{ opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }}>
                <LinearGradient colors={[COLORS.accent, '#9333EA']} style={{
                    borderRadius: 20, paddingVertical: 16, paddingHorizontal: 18, alignItems: 'center', gap: 6,
                    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 14,
                }}>
                    <MaterialCommunityIcons name={isLeft ? 'rotate-left' : 'rotate-right'} size={32} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>{Math.round(absAngle)}°</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' }}>Turn {isLeft ? 'left' : 'right'}</Text>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, marginTop: 4 }}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{formatDist(distance)}</Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        </View>
    );
};


// ══════════════════════════════════════════════════
//  🎥  MAIN AR VIEW
// ══════════════════════════════════════════════════
const ARWallView = ({ place, onClose }) => {
    const { user } = useAuth();
    const [permission, requestPermission] = useCameraPermissions();
    const [messages, setMessages] = useState([]);
    const [isWriteModalOpen, setWriteModalOpen] = useState(false);
    const [newText, setNewText] = useState('');
    const [selectedColor, setSelectedColor] = useState(PEN_COLORS[0]);
    const [isPosting, setIsPosting] = useState(false);

    // Sensor state
    const [heading, setHeading] = useState(0);
    const [pitch, setPitch] = useState(0); // degrees, + = looking up
    const [wallBearing, setWallBearing] = useState(0);
    const [distanceToWall, setDistanceToWall] = useState(50);

    const headingSubRef = useRef(null);
    const locationSubRef = useRef(null);
    const motionSubRef = useRef(null);

    const wallLat = place.geolocation?.latitude || 0;
    const wallLon = place.geolocation?.longitude || 0;

    useEffect(() => {
        loadMessages();
        startTracking();
        return () => {
            if (headingSubRef.current) headingSubRef.current.remove();
            if (locationSubRef.current) locationSubRef.current.remove();
            if (motionSubRef.current) motionSubRef.current.remove();
        };
    }, []);

    const startTracking = async () => {
        try {
            // Compass heading
            headingSubRef.current = await Location.watchHeadingAsync((data) => {
                setHeading(data.trueHeading ?? data.magHeading ?? 0);
            });

            // GPS position
            locationSubRef.current = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 2000, distanceInterval: 1 },
                (loc) => {
                    setDistanceToWall(calculateDistance(loc.coords.latitude, loc.coords.longitude, wallLat, wallLon));
                    setWallBearing(calculateBearing(loc.coords.latitude, loc.coords.longitude, wallLat, wallLon));
                }
            );

            // Device pitch (phone tilt)
            DeviceMotion.setUpdateInterval(100);
            motionSubRef.current = DeviceMotion.addListener((data) => {
                if (data.rotation) {
                    // beta = pitch: 0 = flat, π/2 = upright, -π/2 = upside down
                    const betaDeg = radToDeg(data.rotation.beta || 0);
                    // Convert to our convention: 0 = looking at horizon, + = looking up, - = looking down
                    const lookAngle = 90 - betaDeg; // when phone is at 90° (upright), we look at horizon (0°)
                    setPitch(lookAngle);
                }
            });
        } catch (err) {
            console.error('[AR] Tracking error:', err);
        }
    };

    const loadMessages = async () => {
        if (!place?.id) return;
        await ensureWallExists(place);
        setMessages(await fetchWallMessages(place.id));
    };

    const handlePost = async () => {
        if (!newText.trim() || !user?.uid) return;
        setIsPosting(true);
        try {
            await postWallMessage(place.id, {
                userId: user.uid,
                userName: user.displayName || user.name || 'Traveler',
                text: newText.trim(),
                color: selectedColor,
                position: {
                    x: Math.floor(Math.random() * 200) + 10,
                    y: Math.floor(Math.random() * 120) + 10,
                },
            });
            setNewText('');
            setWriteModalOpen(false);
            await loadMessages();
        } catch (e) {
            Alert.alert('Error', 'Failed to post.');
        } finally {
            setIsPosting(false);
        }
    };

    // ── AR MATH ──────────────────────────────────────
    let bearDiff = wallBearing - heading;
    while (bearDiff > 180) bearDiff -= 360;
    while (bearDiff < -180) bearDiff += 360;

    // Wall bottom sits on the ground.
    // Ground is ~1.5m below camera → vertical angle = -atan(1.5/distance) + pitch
    const cameraHeight = 1.5;
    const wallBottomAngle = -radToDeg(Math.atan(cameraHeight / Math.max(distanceToWall, 0.5))) + pitch;
    // Wall top = bottom + angular height of wall
    const wallAngularHeight = radToDeg(Math.atan(WALL_REAL_H / Math.max(distanceToWall, 0.5)));
    const wallCenterAngle = wallBottomAngle + wallAngularHeight / 2;

    const projected = projectToScreen(distanceToWall, bearDiff, wallCenterAngle, WALL_REAL_W, WALL_REAL_H);

    // Clamp wall size to reasonable bounds
    const wallPxW = Math.max(40, Math.min(SW * 2.5, projected.w));
    const wallPxH = Math.max(30, Math.min(SH * 2, projected.h));
    const wallScreenX = projected.x - wallPxW / 2;
    const wallScreenY = projected.y - wallPxH / 2;

    // Is the wall in the camera's field of view?
    const wallInView = Math.abs(bearDiff) < (H_FOV_DEG / 2 + 12)
        && wallScreenY + wallPxH > 0 && wallScreenY < SH;

    // Permission
    if (!permission) return <View style={st.container} />;
    if (!permission.granted) {
        return (
            <View style={st.permCont}>
                <MaterialCommunityIcons name="camera-off" size={60} color={COLORS.accent} />
                <Text style={st.permTitle}>Camera Access Needed</Text>
                <Text style={st.permSub}>Enable camera to see the 3D AR wall in the real world</Text>
                <TouchableOpacity onPress={requestPermission} style={st.permBtn}><Text style={st.permBtnTxt}>Grant Access</Text></TouchableOpacity>
                <TouchableOpacity onPress={onClose}><Text style={st.permBack}>Go Back</Text></TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={st.container}>
            {/* Camera */}
            <CameraView style={StyleSheet.absoluteFillObject} facing="back" />

            {/* Top bar */}
            <View style={st.topBar}>
                <TouchableOpacity onPress={onClose} style={st.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
                </TouchableOpacity>
                <View style={st.topCenter}>
                    <MaterialCommunityIcons name="cube-scan" size={14} color="#fff" />
                    <Text style={st.topTitle} numberOfLines={1}>{place.name}</Text>
                </View>
                <View style={st.liveBadge}>
                    <View style={st.liveDot} />
                    <Text style={st.liveText}>AR</Text>
                </View>
            </View>

            {/* ── PATH TRAIL (always visible) ── */}
            <PathTrail heading={heading} wallBearing={wallBearing} distance={distanceToWall} pitch={pitch} />

            {/* ── 3D WALL (only when in view) ── */}
            {wallInView && (
                <View style={{
                    position: 'absolute',
                    left: wallScreenX,
                    top: wallScreenY,
                    zIndex: 5,
                }}>
                    <Wall3D
                        screenW={wallPxW}
                        screenH={wallPxH}
                        angleDiff={bearDiff}
                        messages={messages}
                    />
                </View>
            )}

            {/* ── HUD ── */}
            <View style={st.hud}>
                <View style={st.hudPill}>
                    <MaterialCommunityIcons name="map-marker-distance" size={14} color="#fff" />
                    <Text style={st.hudText}>{formatDist(distanceToWall)}</Text>
                </View>
                <View style={st.hudPillDark}>
                    <MaterialCommunityIcons name="compass" size={14} color="rgba(255,255,255,0.6)" />
                    <Text style={st.hudTextDim}>{heading.toFixed(0)}° {getCardinal(heading)}</Text>
                </View>
                <View style={st.hudPillDark}>
                    <MaterialCommunityIcons name="angle-acute" size={14} color="rgba(255,255,255,0.6)" />
                    <Text style={st.hudTextDim}>Pitch {pitch.toFixed(0)}°</Text>
                </View>
            </View>

            {/* Status */}
            <View style={st.status}>
                {wallInView ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialCommunityIcons name="check-circle" size={16} color="#34D399" />
                        <Text style={st.statusTxt}>Wall found • {messages.length} entries</Text>
                    </View>
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialCommunityIcons name="magnify" size={16} color="#FBBF24" />
                        <Text style={st.statusTxt}>Follow the arrows to find the wall</Text>
                    </View>
                )}
            </View>

            {/* Write FAB */}
            {wallInView && (
                <TouchableOpacity style={st.fab} onPress={() => setWriteModalOpen(true)} activeOpacity={0.85}>
                    <LinearGradient colors={[COLORS.accent, COLORS.accentDark]} style={st.fabGrad}>
                        <MaterialCommunityIcons name="spray" size={26} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            )}

            {/* Write Modal */}
            <Modal visible={isWriteModalOpen} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={st.modalOvl}>
                    <View style={st.modal}>
                        <View style={st.modalHead}>
                            <Text style={st.modalTitle}>🎨 Spray on the Wall</Text>
                            <TouchableOpacity onPress={() => setWriteModalOpen(false)}>
                                <MaterialCommunityIcons name="close" size={22} color={COLORS.textLight} />
                            </TouchableOpacity>
                        </View>
                        <View style={st.preview}>
                            <Text style={[st.previewTxt, { color: selectedColor }]}>{newText || 'Your message...'}</Text>
                        </View>
                        <TextInput
                            style={[st.input, { borderColor: selectedColor }]}
                            placeholder="Leave your mark..."
                            placeholderTextColor="rgba(0,0,0,0.3)"
                            value={newText} onChangeText={setNewText}
                            maxLength={80} multiline autoFocus
                        />
                        <Text style={st.colorLabel}>Paint color</Text>
                        <View style={st.colorRow}>
                            {PEN_COLORS.map(c => (
                                <TouchableOpacity key={c} onPress={() => setSelectedColor(c)}
                                    style={[st.dot, { backgroundColor: c }, selectedColor === c && st.dotSel, c === '#FFFFFF' && { borderColor: '#ddd', borderWidth: 1 }]}
                                >
                                    {selectedColor === c && <MaterialCommunityIcons name="check" size={14} color={c === '#FFFFFF' ? '#000' : '#fff'} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={st.charCnt}>{newText.length}/80</Text>
                        <TouchableOpacity onPress={handlePost} disabled={!newText.trim() || isPosting} activeOpacity={0.8}>
                            <LinearGradient colors={newText.trim() ? [COLORS.accent, '#9333EA'] : ['#ccc', '#aaa']} style={st.postBtn}>
                                <MaterialCommunityIcons name={isPosting ? 'loading' : 'spray'} size={18} color="#fff" />
                                <Text style={st.postBtnTxt}>{isPosting ? 'Spraying...' : 'Spray on Wall'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const st = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    permCont: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FB', paddingHorizontal: 40 },
    permTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 20, marginBottom: 8 },
    permSub: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginBottom: 30 },
    permBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12, marginBottom: 12 },
    permBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
    permBack: { color: COLORS.textLight, fontSize: 14, paddingVertical: 10 },

    topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, flexDirection: 'row', alignItems: 'center', paddingTop: 54, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: 'rgba(0,0,0,0.3)' },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    topCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    topTitle: { fontSize: 15, fontWeight: '700', color: '#fff', maxWidth: 180 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399' },
    liveText: { fontSize: 10, fontWeight: '800', color: '#34D399', letterSpacing: 1 },

    hud: { position: 'absolute', bottom: 120, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 },
    hudPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(124,58,237,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    hudPillDark: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
    hudText: { fontSize: 12, fontWeight: '700', color: '#fff' },
    hudTextDim: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },

    status: { position: 'absolute', bottom: 90, left: 0, right: 0, alignItems: 'center' },
    statusTxt: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },

    fab: { position: 'absolute', bottom: 28, right: 24, zIndex: 30, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 14, elevation: 10 },
    fabGrad: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },

    modalOvl: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
    modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    preview: { backgroundColor: '#8B6F5C', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 14, marginBottom: 14, minHeight: 50, justifyContent: 'center', borderWidth: 2, borderColor: '#5C3D2E' },
    previewTxt: { fontSize: 15, fontWeight: '800', fontStyle: 'italic', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
    input: { borderWidth: 2, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, fontWeight: '600', minHeight: 56, textAlignVertical: 'top', marginBottom: 12, color: '#333' },
    colorLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textLight, marginBottom: 8 },
    colorRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
    dot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
    dotSel: { borderColor: COLORS.text },
    charCnt: { textAlign: 'right', fontSize: 11, color: COLORS.textLight, marginBottom: 12 },
    postBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
    postBtnTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

export default ARWallView;
