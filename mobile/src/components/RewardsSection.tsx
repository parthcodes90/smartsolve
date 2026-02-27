import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../constants/theme";
import Card from "./ui/Card";

interface RewardsSectionProps {
    points?: number;
    nextGoal?: number;
    loading?: boolean;
}

export default function RewardsSection({ points = 0, nextGoal = 100, loading = false }: RewardsSectionProps) {
    const progress = Math.min(points / nextGoal, 1);

    if (loading && !points) {
        return (
            <Card style={[styles.container, styles.loadingContainer]} padding="lg" elevation={1}>
                <ActivityIndicator size="small" color={COLORS.warning[700]} />
                <Text style={styles.loadingText}>Syncing rewards...</Text>
            </Card>
        );
    }

    return (
        <Card style={styles.container} padding="lg" elevation={3}>
            <View style={styles.header}>
                <View style={styles.badgeContainer}>
                    <Ionicons name="ribbon" size={16} color={COLORS.warning[700]} />
                    <Text style={styles.badgeText}>🏅 Civic Starter</Text>
                </View>
                <View style={styles.progressRingPlaceholder}>
                    {/* In a real app we'd use a circular progress component, 
                       here we simulate it with a themed circle */}
                    <View style={styles.outerRing}>
                        <View style={[styles.innerRing, { height: `${progress * 100}%` }]} />
                        <Text style={styles.ringText}>{points}%</Text>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.pointsText}>
                    <Text style={styles.highlight}>{points}</Text> / {nextGoal} Points
                </Text>
                <Text style={styles.subtitle}>
                    Resolve {nextGoal - points} more units to reach next tier
                </Text>
            </View>

            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.warning[100],
        borderColor: COLORS.warning[200],
        marginBottom: SPACING.xl,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.md,
    },
    badgeContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.warning[200],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
        gap: 6,
    },
    badgeText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.warning[700],
        fontWeight: "700",
    },
    progressRingPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.neutral.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.warning[500],
    },
    outerRing: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: COLORS.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerRing: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: COLORS.warning[500],
        opacity: 0.3,
    },
    ringText: {
        ...TYPOGRAPHY.caption,
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.warning[700],
    },
    content: {
        marginBottom: SPACING.md,
    },
    pointsText: {
        ...TYPOGRAPHY.h3,
        color: COLORS.neutral[800],
    },
    highlight: {
        color: COLORS.warning[700],
        fontWeight: "800",
    },
    subtitle: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.neutral[700],
        opacity: 0.8,
        marginTop: 2,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: COLORS.neutral.white,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.warning[500],
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        minHeight: 100,
    },
    loadingText: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.warning[700],
        fontWeight: '600',
    },
});
