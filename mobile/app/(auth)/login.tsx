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
import { useState } from "react";
import { router } from "expo-router";
import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Email and password are required");
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);
            router.replace("/(citizen)/home");
        } catch (err: any) {
            Alert.alert("Login Failed", err.message || "An error occurred");
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
                        <Ionicons name="leaf" size={48} color={COLORS.primary[600]} />
                    </View>
                    <Text style={styles.title}>ZenApp</Text>
                    <Text style={styles.subtitle}>Civic Issues Made Simple</Text>
                </View>

                <View style={styles.form}>
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

                    <View style={styles.forgotPasswordContainer}>
                        <Pressable onPress={() => { }}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </Pressable>
                    </View>

                    <Button
                        label="Login"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Pressable onPress={() => router.push("/(auth)/register")}>
                            <Text style={styles.signupLink}>Sign up</Text>
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
        backgroundColor: "#fde2e2", // Light red to confirm it's not a dead white screen
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING["3xl"],
        paddingBottom: SPACING.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING["2xl"],
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: COLORS.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    title: {
        ...TYPOGRAPHY.h0,
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
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: SPACING.xl,
    },
    forgotPasswordText: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.primary[600],
        fontWeight: '600',
    },
    loginButton: {
        width: '100%',
        marginBottom: SPACING.xl,
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
    signupLink: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.primary[600],
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});

