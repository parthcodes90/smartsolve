import { View, Text, Pressable, StyleSheet, Animated, Alert } from "react-native";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../constants/theme";
import Card from "./ui/Card";
import { useAuth } from "../context/AuthContext";
import { API_CONFIG } from "../config/api";

type ValidationItem = {
    id: string;
    title: string;
    description: string;
    category: string;
    validationCount: number;
    status: string;
};

type Props = {
    item: ValidationItem;
    onValidated?: () => void;
};

export default function ValidationCard({ item, onValidated }: Props) {
    const { getToken } = useAuth();
    const [verifying, setVerifying] = useState(false);
    const [localValidationCount, setLocalValidationCount] = useState(item.validationCount || 0);
    const [hasValidated, setHasValidated] = useState(false);

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleVerify = async () => {
        const token = await getToken();
        if (!token || verifying || hasValidated) return;

        // Feedback animation
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        setVerifying(true);
        try {
            const response = await fetch(API_CONFIG.ENDPOINTS.VALIDATE_COMPLAINT(item.id), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setHasValidated(true);
                setLocalValidationCount(prev => prev + 1);
                Alert.alert("Verified!", "Thank you for helping the community. You earned +5 points! 🌟");
                if (onValidated) onValidated();
            } else {
                const err = await response.json();
                Alert.alert("Error", err.error || "Failed to verify. You might have already verified this.");
            }
        } catch (err) {
            Alert.alert("Network Error", "Could not connect to the server.");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <Card style={styles.card} elevation={1} padding="md">
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.category}>{item.category}</Text>
                    <View style={styles.verifiedBadge}>
                        <Ionicons name="shield-checkmark" size={10} color={COLORS.primary[600]} />
                        <Text style={styles.verifiedText}>{item.status}</Text>
                    </View>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            </View>

            <View style={styles.actionRow}>
                <View style={styles.voteContainer}>
                    <Text style={styles.agreeText}>{localValidationCount} community validations</Text>
                </View>

                <View style={styles.buttons}>
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <Pressable
                            onPress={handleVerify}
                            disabled={verifying || hasValidated}
                            style={[
                                styles.voteButton,
                                (hasValidated || verifying) && styles.upvoteActive
                            ]}
                        >
                            <Ionicons
                                name={hasValidated ? "checkmark-circle" : "checkmark-circle-outline"}
                                size={18}
                                color={(hasValidated || verifying) ? COLORS.neutral.white : COLORS.success[600]}
                            />
                            <Text style={[
                                styles.voteText,
                                (hasValidated || verifying) && styles.activeText,
                                { color: (hasValidated || verifying) ? COLORS.neutral.white : COLORS.success[600] }
                            ]}>
                                {verifying ? "..." : hasValidated ? "Verified" : "Verify"}
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </View>
        </Card>
    );
}

// Helper to avoid duplicate variable error in the local scope if any
const type = 'up';

const styles = StyleSheet.create({
    card: {
        marginBottom: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.primary[100],
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.xs,
    },
    verifiedText: {
        ...TYPOGRAPHY.caption,
        fontSize: 9,
        color: COLORS.primary[600],
        fontWeight: '700',
    },
    content: {
        marginBottom: SPACING.sm,
    },
    category: {
        ...TYPOGRAPHY.caption,
        color: COLORS.primary[600],
        textTransform: "uppercase",
        fontWeight: "700",
    },
    title: {
        ...TYPOGRAPHY.bodyLarge,
        fontWeight: "700",
        color: COLORS.neutral[800],
        marginBottom: 2,
    },
    description: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.neutral[500],
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
        paddingTop: SPACING.sm,
    },
    voteContainer: {
        flex: 1,
    },
    agreeText: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.success[600],
        fontWeight: '600',
    },
    buttons: {
        flexDirection: 'row',
        gap: SPACING.sm,
        alignItems: 'center',
    },
    voteButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.neutral[50],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.sm,
        gap: 6,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
    },
    upvoteActive: {
        backgroundColor: COLORS.success[600],
        borderColor: COLORS.success[600],
    },
    downvoteActive: {
        backgroundColor: COLORS.error[600],
        borderColor: COLORS.error[600],
    },
    voteText: {
        ...TYPOGRAPHY.bodyRegular,
        fontWeight: "700",
    },
    activeText: {
        color: "#fff",
    },
});
