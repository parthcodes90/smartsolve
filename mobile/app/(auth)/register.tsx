import {
    View,
    Text,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Pressable
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { API_CONFIG } from "@/config/api";
import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();

    useEffect(() => {
        const checkConnectivity = async () => {
            console.log(`[Diagnostic] Pinging health endpoint: ${API_CONFIG.ENDPOINTS.HEALTH}`);
            try {
                const res = await fetch(API_CONFIG.ENDPOINTS.HEALTH);
                const data = await res.json();
                console.log(`[Diagnostic] Backend health check OK:`, data);
            } catch (err: any) {
                console.warn(`[Diagnostic] Backend health check FAILED: ${err.message}`);
                console.warn(`[Diagnostic] Tip: If using Emulator, use http://10.0.2.2:3000. If physical device, ensure same WiFi and check firewall.`);
            }
        };
        checkConnectivity();
    }, []);

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert("Error", "Name, email and password are required");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password);
            Alert.alert("Success", "Account created successfully! Please log in.");
            router.replace("/(auth)/login");
        } catch (err: any) {
            Alert.alert("Signup Failed", err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="person-add" size={40} color={COLORS.success[600]} />
                    </View>
                    <Text style={styles.title}>Join ZenApp</Text>
                    <Text style={styles.subtitle}>Start making an impact today</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        value={name}
                        onChangeText={setName}
                        leftIcon={<Ionicons name="person-outline" size={20} color={COLORS.neutral[400]} />}
                    />

                    <Input
                        label="Email Address"
                        placeholder="you@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        leftIcon={<Ionicons name="mail-outline" size={20} color={COLORS.neutral[400]} />}
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        leftIcon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.neutral[400]} />}
                        rightIcon={
                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={COLORS.neutral[400]}
                                />
                            </Pressable>
                        }
                    />

                    <Input
                        label="Confirm Password"
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={COLORS.neutral[400]} />}
                        error={confirmPassword && password !== confirmPassword ? "Passwords do not match" : ""}
                    />

                    <Button
                        label="Create Account"
                        onPress={handleSignup}
                        loading={loading}
                        variant="success"
                        style={styles.registerButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Pressable onPress={() => router.replace("/(auth)/login")}>
                            <Text style={styles.loginLink}>Log in</Text>
                        </Pressable>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral.white,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING["2xl"],
        paddingBottom: SPACING.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logoContainer: {
        width: 72,
        height: 72,
        borderRadius: 18,
        backgroundColor: COLORS.success[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    title: {
        ...TYPOGRAPHY.h1,
        color: COLORS.neutral[800],
    },
    subtitle: {
        ...TYPOGRAPHY.bodyLarge,
        color: COLORS.neutral[500],
        marginTop: SPACING.xs,
    },
    form: {
        width: '100%',
    },
    registerButton: {
        width: '100%',
        marginVertical: SPACING.xl,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.neutral[500],
    },
    loginLink: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.primary[600],
        fontWeight: '700',
    },
});
