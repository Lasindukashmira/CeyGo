import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./HomeScreen";
import ExploreScreen from "./ExploreScreen";
import TourismPlanScreen from "./TourismPlanScreen";
import FavouritesScreen from "./FavouritesScreen";
import VRScreen from "./VRScreen";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          paddingBottom: 5,
          paddingTop: 5,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarActiveTintColor: "#2c5aa0",
        tabBarInactiveTintColor: "#666",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={25}
              color={focused ? "#2c5aa0" : "#0008"}
            />
            // <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "map-marker" : "map-marker-outline"}
              size={25}
              color={focused ? "#2c5aa0" : "#0008"}
            />
            // <Text style={{ fontSize: size, color }}>🗺️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="AI Planner"
        component={TourismPlanScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "robot" : "robot-outline"}
              size={25}
              color={focused ? "#2c5aa0" : "#0008"}
            />
            // <Text style={{ fontSize: size, color }}>🤖</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Favourites"
        component={FavouritesScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "heart" : "heart-outline"}
              size={25}
              color={focused ? "#2c5aa0" : "#0008"}
            />
            // <Text style={{ fontSize: size, color }}>❤️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="VR"
        component={VRScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "headset" : "headset-vr"}
              size={25}
              color={focused ? "#2c5aa0" : "#0008"}
            />
            // <Text style={{ fontSize: size, color }}>🥽</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
