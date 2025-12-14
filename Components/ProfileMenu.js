import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

const ProfileMenu = ({ visible, onClose, onLogout, navigation }) => {
    const slideAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: height,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    const menuItems = [
        {
            id: "profile",
            title: "My Profile",
            icon: "person-outline",
            iconLib: MaterialIcons,
            action: () => console.log("Profile pressed"),
        },
        {
            id: "settings",
            title: "Settings",
            icon: "settings-outline",
            iconLib: MaterialIcons,
            action: () => console.log("Settings pressed"),
        },
        {
            id: "service",
            title: "Provide a Service",
            icon: "briefcase-outline",
            iconLib: MaterialCommunityIcons,
            action: () => console.log("Provide Service pressed"),
            highlight: true,
        },
        {
            id: "logout",
            title: "Logout",
            icon: "logout",
            iconLib: MaterialIcons,
            action: onLogout,
            danger: true,
        },
    ];

    return (
        <Modal transparent visible={visible} animationType="none">
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.menuContainer,
                                { transform: [{ translateY: slideAnim }] },
                            ]}
                        >
                            <View style={styles.handleIndicator} />
                            <Text style={styles.menuHeader}>Menu</Text>

                            <View style={styles.menuItemsContainer}>
                                {menuItems.map((item, index) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.menuItem,
                                            index === menuItems.length - 1 && styles.lastMenuItem,
                                        ]}
                                        onPress={() => {
                                            item.action();
                                            if (item.id !== "logout") onClose();
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            style={[
                                                styles.iconContainer,
                                                item.danger && styles.dangerIconContainer,
                                                item.highlight && styles.highlightIconContainer,
                                            ]}
                                        >
                                            <item.iconLib
                                                name={item.icon}
                                                size={22}
                                                color={
                                                    item.danger
                                                        ? "#e53935"
                                                        : item.highlight
                                                            ? "#2c5aa0"
                                                            : "#555"
                                                }
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.menuItemText,
                                                item.danger && styles.dangerText,
                                                item.highlight && styles.highlightText,
                                            ]}
                                        >
                                            {item.title}
                                        </Text>
                                        <MaterialIcons
                                            name="chevron-right"
                                            size={20}
                                            color="#ccc"
                                            style={styles.chevron}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.versionText}>Version 1.0.0</Text>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    menuContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        paddingBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    handleIndicator: {
        width: 40,
        height: 5,
        backgroundColor: "#e0e0e0",
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: 15,
    },
    menuHeader: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
    },
    menuItemsContainer: {
        backgroundColor: "#f8f9fa",
        borderRadius: 16,
        overflow: "hidden",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    dangerIconContainer: {
        backgroundColor: "#ffebee",
    },
    highlightIconContainer: {
        backgroundColor: "#e3f2fd",
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
    dangerText: {
        color: "#e53935",
        fontWeight: "600",
    },
    highlightText: {
        color: "#2c5aa0",
        fontWeight: "600",
    },
    chevron: {
        opacity: 0.5,
    },
    versionText: {
        textAlign: "center",
        marginTop: 20,
        color: "#999",
        fontSize: 12,
    },
});

export default ProfileMenu;
