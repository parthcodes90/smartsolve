import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import Card from "@/components/ui/Card";
import RewardsSection from "@/components/RewardsSection";

import { useAuth } from "@/context/AuthContext";

const TIER_THRESHOLDS = [
    { tier: "Civic Starter", min: 0, max: 100, icon: "medal-outline", color: COLORS.neutral[400] },
    { tier: "Community Hero", min: 101, max: 500, icon: "shield-outline", color: COLORS.primary[600] },
    { tier: "City Guardian", min: 501, max: 2000, icon: "flame-outline", color: COLORS.warning[500] },
    { tier: "Zen Master", min: 2001, max: Infinity, icon: "star-outline", color: "#8b5cf6" },
];

const RECENT_ACTIVITY = [
    {
        id: "1",
        title: "Complaint Resolved",
        subtitle: "Broken streetlight verified",
        points: "+10",
        date: "Today",
    },
    {
        id: "2",
        title: "Community Verification",
        subtitle: "Verified pothole report",
        points: "+5",
        date: "Yesterday",
    },
    {
        id: "3",
        title: "First Complaint",
        subtitle: "Submitted initial report",
        points: "+20",
        date: "2 days ago",
    },
];

export default function RewardsScreen() {
    const { user } = useAuth();
    const points = user?.points ?? 0;

    const rewardTiers = TIER_THRESHOLDS.map((t) => ({
        ...t,
        points: t.max === Infinity ? `${t.min}+` : `${t.min} - ${t.max}`,
        active: points >= t.min && points <= t.max,
    }));

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* ─── Header ─── */}
                <View style={styles.header}>
                    <Text style={styles.screenTitle}>Rewards</Text>
                    <Text style={styles.screenSubtitle}>
                        Track your impact and earn recognition
                    </Text>
                </View>

                {/* ─── Main Progress ─── */}
                <RewardsSection points={points} />

                {/* ─── Reward Tiers ─── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Achievement Tiers</Text>
                </View>

                <View style={styles.tiersContainer}>
                    {rewardTiers.map((item, index) => (
                        <Card
                            key={index}
                            style={[
                                styles.tierCard,
                                item.active && styles.activeTierCard
                            ]}
                            padding="md"
                        >
                            <View style={[styles.tierIconBox, { backgroundColor: item.color + "20" }]}>
                                <Ionicons name={item.icon as any} size={24} color={item.color} />
                            </View>
                            <View style={styles.tierInfo}>
                                <Text style={styles.tierName}>{item.tier}</Text>
                                <Text style={styles.tierPoints}>{item.points} Points</Text>
                            </View>
                            {item.active && (
                                <View style={styles.currentBadge}>
                                    <Text style={styles.currentBadgeText}>CURRENT</Text>
                                </View>
                            )}
                        </Card>
                    ))}
                </View>

                {/* ─── Recent Activity ─── */}
                <View style={[styles.sectionHeader, { marginTop: SPACING.xl }]}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                </View>

                <View style={styles.activityList}>
                    {RECENT_ACTIVITY.map((item) => (
                        <View key={item.id} style={styles.activityItem}>
                            <View style={styles.activityDot} />
                            <View style={styles.activityContent}>
                                <View style={styles.activityMain}>
                                    <View>
                                        <Text style={styles.activityTitle}>{item.title}</Text>
                                        <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                                    </View>
                                    <Text style={styles.activityPoints}>{item.points}</Text>
                                </View>
                                <Text style={styles.activityDate}>{item.date}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    content: {
        padding: SPACING.lg,
    },
    header: {
        marginBottom: SPACING.xl,
        marginTop: SPACING.sm,
    },
    screenTitle: {
        ...TYPOGRAPHY.h1,
        color: COLORS.neutral[800],
    },
    screenSubtitle: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.neutral[400],
        marginTop: 2,
    },
    sectionHeader: {
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.neutral[800],
    },
    tiersContainer: {
        gap: SPACING.sm,
    },
    tierCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.neutral.white,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
    },
    activeTierCard: {
        borderColor: COLORS.warning[500],
        backgroundColor: COLORS.warning[100] + "20",
    },
    tierIconBox: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
        marginRight: SPACING.md,
    },
    tierInfo: {
        flex: 1,
    },
    tierName: {
        ...TYPOGRAPHY.bodyLarge,
        fontWeight: "700",
        color: COLORS.neutral[800],
    },
    tierPoints: {
        ...TYPOGRAPHY.caption,
        color: COLORS.neutral[400],
    },
    currentBadge: {
        backgroundColor: COLORS.warning[100],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.xs,
    },
    currentBadgeText: {
        ...TYPOGRAPHY.caption,
        fontSize: 10,
        fontWeight: "800",
        color: COLORS.warning[700],
    },
    activityList: {
        backgroundColor: COLORS.neutral.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        ...SHADOWS.elevation1,
    },
    activityItem: {
        flexDirection: "row",
        paddingVertical: SPACING.md,
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary[400],
        marginTop: 6,
        marginRight: SPACING.md,
    },
    activityContent: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[50],
        paddingBottom: SPACING.sm,
    },
    activityMain: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    activityTitle: {
        ...TYPOGRAPHY.bodyRegular,
        fontWeight: "700",
        color: COLORS.neutral[800],
    },
    activitySubtitle: {
        ...TYPOGRAPHY.caption,
        color: COLORS.neutral[400],
        marginTop: 1,
    },
    activityPoints: {
        ...TYPOGRAPHY.bodyRegular,
        fontWeight: "800",
        color: COLORS.success[600],
    },
    activityDate: {
        ...TYPOGRAPHY.caption,
        fontSize: 10,
        color: COLORS.neutral[300],
        marginTop: 4,
    },
    bottomSpacer: {
        height: SPACING["3xl"],
    },
});
