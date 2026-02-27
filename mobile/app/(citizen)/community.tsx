import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Pressable,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import ValidationCard from "@/components/ValidationCard";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/constants/theme";

import { useAuth } from "@/context/AuthContext";
import { API_CONFIG } from "@/config/api";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, RefreshControl } from "react-native";

const FILTER_CATEGORIES = ["All", "ROAD", "WATER", "GARBAGE", "STREETLIGHT", "SANITATION"];

export default function CommunityScreen() {
    const { getToken, user, refreshProfile } = useAuth();
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCommunityData = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const response = await fetch(API_CONFIG.ENDPOINTS.COMPLAINTS, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch community data");
            }

            const data = await response.json();
            setComplaints(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCommunityData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCommunityData();
        refreshProfile();
    }, []);

    const filteredComplaints =
        selectedFilter === "All"
            ? complaints
            : complaints.filter((c) => c.category === selectedFilter);

    const totalVerified = complaints.filter(c => c.status === 'RESOLVED').length;
    const pendingReview = complaints.filter(c => c.status === 'SUBMITTED').length;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary[600]}
                        colors={[COLORS.primary[600]]}
                    />
                }
            >
                {/* ─── Header ─── */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.screenTitle}>Community</Text>
                        <Text style={styles.screenSubtitle}>
                            Help verify issues in your area
                        </Text>
                    </View>
                    <View style={styles.betaBadge}>
                        <Text style={styles.betaBadgeText}>BETA</Text>
                    </View>
                </View>

                {/* ─── Stats Banner ─── */}
                <View style={styles.statsBanner}>
                    <View style={styles.statItem}>
                        <View style={styles.statIconContainer}>
                            <Ionicons
                                name="shield-checkmark"
                                size={20}
                                color={COLORS.success[600]}
                            />
                        </View>
                        <Text style={styles.statValue}>{totalVerified}</Text>
                        <Text style={styles.statLabel}>Resolved</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <View
                            style={[
                                styles.statIconContainer,
                                { backgroundColor: COLORS.warning[100] },
                            ]}
                        >
                            <Ionicons
                                name="time"
                                size={20}
                                color={COLORS.warning[700]}
                            />
                        </View>
                        <Text style={styles.statValue}>{pendingReview}</Text>
                        <Text style={styles.statLabel}>New Issues</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <View
                            style={[
                                styles.statIconContainer,
                                { backgroundColor: COLORS.primary[100] },
                            ]}
                        >
                            <Ionicons
                                name="star"
                                size={20}
                                color={COLORS.primary[600]}
                            />
                        </View>
                        <Text style={styles.statValue}>+5</Text>
                        <Text style={styles.statLabel}>Pts / verify</Text>
                    </View>
                </View>

                {/* ─── How It Works ─── */}
                <View style={styles.howItWorks}>
                    <View style={styles.howItWorksHeader}>
                        <Ionicons
                            name="information-circle"
                            size={18}
                            color={COLORS.primary[600]}
                        />
                        <Text style={styles.howItWorksTitle}>How it works</Text>
                    </View>
                    <Text style={styles.howItWorksText}>
                        Review community-reported issues and tap{" "}
                        <Text style={{ fontWeight: "700", color: COLORS.success[600] }}>
                            Verify
                        </Text>{" "}
                        if you've seen the same problem, or{" "}
                        <Text style={{ fontWeight: "700", color: COLORS.error[600] }}>
                            ✕
                        </Text>{" "}
                        if it doesn't seem accurate. Earn reward points for each
                        verification!
                    </Text>
                </View>

                {/* ─── Filter Chips ─── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    {FILTER_CATEGORIES.map((cat) => (
                        <Pressable
                            key={cat}
                            onPress={() => setSelectedFilter(cat)}
                            style={[
                                styles.filterChip,
                                selectedFilter === cat && styles.filterChipActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === cat &&
                                    styles.filterChipTextActive,
                                ]}
                            >
                                {cat}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* ─── Section Label ─── */}
                <View style={styles.sectionHeaderLine}>
                    <Text style={styles.sectionTitle}>Issues to Review</Text>
                    <Text style={styles.countBadge}>
                        {filteredComplaints.length}
                    </Text>
                </View>

                {/* ─── Validation Cards ─── */}
                {loading ? (
                    <View style={styles.emptyState}>
                        <ActivityIndicator size="large" color={COLORS.primary[600]} />
                        <Text style={styles.emptyTitle}>Loading community issues...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="alert-circle" size={48} color={COLORS.error[600]} />
                        <Text style={styles.emptyTitle}>Oops! Something went wrong</Text>
                        <Text style={styles.emptySubtitle}>{error}</Text>
                        <Pressable onPress={fetchCommunityData} style={{ marginTop: SPACING.md }}>
                            <Text style={{ color: COLORS.primary[600], fontWeight: '700' }}>Try again</Text>
                        </Pressable>
                    </View>
                ) : filteredComplaints.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="checkmark-done-circle-outline"
                            size={48}
                            color={COLORS.neutral[300]}
                        />
                        <Text style={styles.emptyTitle}>All caught up!</Text>
                        <Text style={styles.emptySubtitle}>
                            No issues in this category need review right now.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.cardList}>
                        {filteredComplaints.map((item) => (
                            <ValidationCard
                                key={item.id}
                                item={item}
                                onValidated={() => {
                                    refreshProfile();
                                    // Optionally refresh list, but local update in card is faster
                                }}
                            />
                        ))}
                    </View>
                )}

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

    // Header
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
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
    betaBadge: {
        backgroundColor: COLORS.warning[500],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADIUS.xs,
        marginTop: 6,
    },
    betaBadgeText: {
        ...TYPOGRAPHY.caption,
        fontSize: 10,
        fontWeight: "800",
        color: COLORS.neutral.white,
    },

    // Stats Banner
    statsBanner: {
        flexDirection: "row",
        backgroundColor: COLORS.neutral.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        ...SHADOWS.elevation2,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.success[100],
        alignItems: "center",
        justifyContent: "center",
        marginBottom: SPACING.xs,
    },
    statValue: {
        ...TYPOGRAPHY.h3,
        color: COLORS.neutral[800],
    },
    statLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.neutral[400],
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.neutral[100],
        marginHorizontal: SPACING.sm,
    },

    // How It Works
    howItWorks: {
        backgroundColor: COLORS.primary[100],
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    howItWorksHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: SPACING.xs,
    },
    howItWorksTitle: {
        ...TYPOGRAPHY.bodyLarge,
        fontWeight: "700",
        color: COLORS.primary[600],
    },
    howItWorksText: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.neutral[600],
        lineHeight: 22,
    },

    // Filter Chips
    filterRow: {
        flexDirection: "row",
        gap: SPACING.sm,
        marginBottom: SPACING.xl,
        paddingVertical: 2,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.neutral.white,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    filterChipActive: {
        backgroundColor: COLORS.primary[600],
        borderColor: COLORS.primary[600],
    },
    filterChipText: {
        ...TYPOGRAPHY.bodyRegular,
        fontWeight: "600",
        color: COLORS.neutral[500],
    },
    filterChipTextActive: {
        color: COLORS.neutral.white,
    },

    // Section Header
    sectionHeaderLine: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.neutral[800],
    },
    countBadge: {
        backgroundColor: COLORS.primary[100],
        color: COLORS.primary[600],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
        ...TYPOGRAPHY.caption,
        fontWeight: "800",
    },

    // Card List
    cardList: {
        marginBottom: SPACING.sm,
    },

    // Empty State
    emptyState: {
        alignItems: "center",
        paddingVertical: SPACING["3xl"],
        paddingHorizontal: SPACING.xl,
        backgroundColor: COLORS.neutral.white,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOWS.elevation1,
    },
    emptyTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.neutral[600],
        marginTop: SPACING.md,
        marginBottom: SPACING.xs,
    },
    emptySubtitle: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.neutral[400],
        textAlign: "center",
    },

    bottomSpacer: {
        height: SPACING["3xl"],
    },
});
