import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";

import LoginScreen from "./Screens/LoginScreen";
import RegisterScreen from "./Screens/RegisterScreen";
import MainTabNavigator from "./Screens/MainTabNavigator";
import PlaceDetailsScreen from "./Screens/PlaceDetailsScreen";
import DistrictDetailsScreen from "./Screens/DistrictDetailsScreen";
import HotelDetailsScreen from "./Screens/HotelDetailsScreen";
import RestaurantDetailsScreen from "./Screens/RestaurantDetailsScreen";
import ProfileScreen from "./Screens/ProfileScreen";
import FavouritesScreen from "./Screens/FavouritesScreen";

// Service Provider Screens
import ProviderIntroScreen from "./Screens/ServiceProvider/ProviderIntroScreen";
import ProviderRegistrationScreen from "./Screens/ServiceProvider/ProviderRegistrationScreen";
import ProviderDashboardScreen from "./Screens/ServiceProvider/ProviderDashboardScreen";
import ServiceTypeSelectionScreen from "./Screens/ServiceProvider/ServiceTypeSelectionScreen";
import AddTourScreen from "./Screens/ServiceProvider/AddTourScreen";
import AddHotelScreen from "./Screens/ServiceProvider/AddHotelScreen";
import AddRestaurantScreen from "./Screens/ServiceProvider/AddRestaurantScreen";
import AddAttractionScreen from "./Screens/ServiceProvider/AddAttractionScreen";
import EditServiceScreen from "./Screens/ServiceProvider/EditServiceScreen";

import { AuthProvider, useAuth } from "./AuthContext";

import { StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";
import LoadingScreen from "./Components/LoadingScreen";

const Stack = createStackNavigator();

function Root() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen message="Checking authentication..." />;

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {user ? (
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
          <Stack.Screen
            name="HotelDetails"
            component={HotelDetailsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="RestaurantDetails"
            component={RestaurantDetailsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerShown: false,
            }}
          />
          {/* Service Provider Screens */}
          <Stack.Screen
            name="ProviderIntro"
            component={ProviderIntroScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProviderRegistration"
            component={ProviderRegistrationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ServiceTypeSelection"
            component={ServiceTypeSelectionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddTour"
            component={AddTourScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddHotel"
            component={AddHotelScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddRestaurant"
            component={AddRestaurantScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddAttraction"
            component={AddAttractionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditService"
            component={EditServiceScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Favourites"
            component={FavouritesScreen}
            options={{ headerShown: false }}
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
