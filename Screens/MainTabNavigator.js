import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./HomeScreen";
import ExploreScreen from "./ExploreScreen";
import TourismPlanScreen from "./TourismPlanScreen";
import FavouritesScreen from "./FavouritesScreen";
import VRScreen from "./VRScreen";
import ProviderDashboardScreen from "./ServiceProvider/ProviderDashboardScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../AuthContext";

const Tab = createBottomTabNavigator();

// Custom center button for Provider Dashboard
const DashboardTabButton = ({ onPress }) => (
  <TouchableOpacity
    style={styles.dashboardButtonContainer}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <LinearGradient
      colors={["#2c5aa0", "#1e3d6f"]}
      style={styles.dashboardButton}
    >
      <MaterialCommunityIcons name="view-dashboard" size={26} color="#fff" />
    </LinearGradient>
  </TouchableOpacity>
);

// Tourist Navigator - Fixed tabs for tourists
const TouristTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabBarLabel,
      tabBarActiveTintColor: "#2c5aa0",
      tabBarInactiveTintColor: "#999",
      tabBarIconStyle: { marginBottom: -2 },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={focused ? "#2c5aa0" : "#999"}
            />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Explore"
      component={ExploreScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
            <MaterialCommunityIcons
              name={focused ? "compass" : "compass-outline"}
              size={24}
              color={focused ? "#2c5aa0" : "#999"}
            />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="AI Plan"
      component={TourismPlanScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
            <MaterialCommunityIcons
              name={focused ? "robot" : "robot-outline"}
              size={24}
              color={focused ? "#2c5aa0" : "#999"}
            />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Favourites"
      component={FavouritesScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
            <MaterialCommunityIcons
              name={focused ? "heart" : "heart-outline"}
              size={24}
              color={focused ? "#2c5aa0" : "#999"}
            />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="VR"
      component={VRScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
            <MaterialCommunityIcons
              name="virtual-reality"
              size={24}
              color={focused ? "#2c5aa0" : "#999"}
            />
          </View>
        ),
      }}
    />
  </Tab.Navigator>
);

// Provider Navigator - Fixed tabs for service providers
const ProviderTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabBarLabel,
      tabBarActiveTintColor: "#2c5aa0",
      tabBarInactiveTintColor: "#999",
      tabBarIconStyle: { marginBottom: -2 },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={focused ? "#2c5aa0" : "#999"}
            />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Explore"
      component={ExploreScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
            <MaterialCommunityIcons
              name={focused ? "compass" : "compass-outline"}
              size={24}
              color={focused ? "#2c5aa0" : "#999"}
            />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Dashboard"
      component={ProviderDashboardScreen}
      options={{
        tabBarLabel: () => null,
        tabBarIcon: () => null,
        tabBarButton: (props) => <DashboardTabButton {...props} />,
      }}
    />
    <Tab.Screen
      name="AI Plan"
      component={TourismPlanScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
            <MaterialCommunityIcons
              name={focused ? "robot" : "robot-outline"}
              size={24}
              color={focused ? "#2c5aa0" : "#999"}
            />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="VR"
      component={VRScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
            <MaterialCommunityIcons
              name="virtual-reality"
              size={24}
              color={focused ? "#2c5aa0" : "#999"}
            />
          </View>
        ),
      }}
    />
  </Tab.Navigator>
);

const MainTabNavigator = () => {
  const { user } = useAuth();

  // Memoize the provider check to avoid re-renders
  const isProvider = useMemo(() => {
    return user?.role === "service_provider";
  }, [user?.role]);

  // Return appropriate navigator based on role
  // Using separate components prevents re-render issues
  return isProvider ? <ProviderTabs /> : <TouristTabs />;
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 0,
    height: 75,
    paddingBottom: 12,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 15,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  iconWrapper: {
    width: 42,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperActive: {
    backgroundColor: "#e3f2fd",
  },
  dashboardButtonContainer: {
    top: -18,
    justifyContent: "center",
    alignItems: "center",
  },
  dashboardButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2c5aa0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default MainTabNavigator;
