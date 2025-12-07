import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../AuthContext"; //

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth(); // ✅ get login function from AuthContext
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");

      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      await login(email, password); // ✅ login via AuthContext
      // user state handled by AuthContext
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>CeyGo</Text>
            <Text style={styles.tagline}>Discover Sri Lanka</Text>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            {error ? (
              <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            {/* Social Login */}
            <View style={styles.socialLoginContainer}>
              <Text style={styles.orText}>OR</Text>

              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>
                  🔍 Continue with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>
                  📘 Continue with Facebook
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  keyboardAvoidingView: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: { alignItems: "center", marginBottom: 40 },
  logo: { fontSize: 42, fontWeight: "bold", color: "#2c5aa0", marginBottom: 8 },
  tagline: { fontSize: 16, color: "#666", marginBottom: 20 },
  welcomeText: { fontSize: 24, fontWeight: "600", color: "#333" },
  form: { flex: 1 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "500", color: "#333", marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 30 },
  forgotPasswordText: { color: "#2c5aa0", fontSize: 14, fontWeight: "500" },
  loginButton: {
    backgroundColor: "#2c5aa0",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  socialLoginContainer: { marginBottom: 30 },
  orText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "500",
  },
  socialButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  socialButtonText: { color: "#333", fontSize: 16, fontWeight: "500" },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: { color: "#666", fontSize: 16 },
  registerLink: { color: "#2c5aa0", fontSize: 16, fontWeight: "600" },
});

export default LoginScreen;
