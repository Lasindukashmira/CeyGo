// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

// Required to properly close the browser on Android after OAuth
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const EXPO_USERNAME = process.env.EXPO_PUBLIC_EXPO_USERNAME || "";

// This redirect URI must be whitelisted in Google Cloud Console
// Credentials -> your Web OAuth Client -> Authorized redirect URIs
const redirectUri = EXPO_USERNAME
  ? `https://auth.expo.io/@${EXPO_USERNAME}/CeyGo_Tourism_App`
  : makeRedirectUri();

console.log("[GoogleAuth] Whitelist this URI in Google Cloud Console:", redirectUri);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data from Firestore
  const fetchUserData = async (firebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        return { ...firebaseUser, ...userDoc.data() };
      }
      return firebaseUser;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return firebaseUser;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Refresh user data from Firestore (call after profile updates)
  const refreshUser = async () => {
    if (auth.currentUser) {
      const userData = await fetchUserData(auth.currentUser);
      setUser(userData);
      return userData;
    }
    return null;
  };

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, extraData) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    // Store extra user info in Firestore
    await setDoc(doc(db, "users", uid), {
      email,
      ...extraData,
      createdAt: new Date(),
    });

    return userCredential;
  };

  const logout = () => signOut(auth);

  // Sign in with a Google ID token (called by useGoogleAuth hook below)
  const loginWithGoogle = async (idToken) => {
    if (!idToken) throw new Error("No ID token provided for Google sign-in");

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const { uid, displayName, email, photoURL } = userCredential.user;

    // Create Firestore user doc on first Google sign-in
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: displayName || "",
        email: email || "",
        photoURL: photoURL || "",
        provider: "google",
        createdAt: new Date(),
      });
    }

    return userCredential;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, loginWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

/**
 * useGoogleAuth — custom hook that encapsulates the full Google OAuth flow.
 *
 * Usage in any screen:
 *   const { promptGoogleSignIn, googleLoading, googleError } = useGoogleAuth();
 *   <Button onPress={promptGoogleSignIn} />
 */
export const useGoogleAuth = () => {
  const { loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleCredential(id_token);
    } else if (response?.type === "error") {
      setGoogleError("Google sign-in failed. Please try again.");
    }
  }, [response]);

  const handleCredential = async (idToken) => {
    try {
      setGoogleError("");
      setGoogleLoading(true);
      await loginWithGoogle(idToken);
      // onAuthStateChanged in AuthContext will update user and trigger navigation
    } catch (err) {
      setGoogleError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const promptGoogleSignIn = () => {
    setGoogleError("");
    promptAsync();
  };

  return { promptGoogleSignIn, request, googleLoading, googleError };
};
