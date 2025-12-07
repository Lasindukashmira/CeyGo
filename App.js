import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";

import LoginScreen from "./Screens/LoginScreen";
import RegisterScreen from "./Screens/RegisterScreen";
import MainTabNavigator from "./Screens/MainTabNavigator";
import PlaceDetailsScreen from "./Screens/PlaceDetailsScreen";
import DistrictDetailsScreen from "./Screens/DistrictDetailsScreen";
import { AuthProvider, useAuth } from "./AuthContext";

import { StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";

const Stack = createStackNavigator();

function Root() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {true ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen
            name="PlaceDetails"
            component={PlaceDetailsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="DistrictDetails"
            component={DistrictDetailsScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {(props) => (
              <RegisterScreen
                {...props}
                onRegister={() => setIsLoggedIn(true)}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
