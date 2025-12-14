import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./HomeScreen";
import ExploreScreen from "./ExploreScreen";
import TourismPlanScreen from "./TourismPlanScreen";
import FavouritesScreen from "./FavouritesScreen";
import VRScreen from "./VRScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
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
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarActiveTintColor: "#2c5aa0",
        tabBarInactiveTintColor: "#999",
        tabBarIconStyle: {
          marginBottom: -2,
        },
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
};

const styles = StyleSheet.create({
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
});

export default MainTabNavigator;
