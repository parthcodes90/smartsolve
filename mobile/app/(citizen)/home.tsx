import {
    View,
    Text,
    Pressable,
    Alert,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    RefreshControl
} from "react-native";

import { useAuth } from "@/context/AuthContext";
import { Redirect, router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import ComplaintCard from "@/components/ComplaintCard";

import RewardsSection from "@/components/RewardsSection";
import { API_CONFIG } from "@/config/api";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import Button from "@/components/ui/Button";

export default function Home() {
    const { isSignedIn, getToken, user, loading } = useAuth();


    const [complaints, setComplaints] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHomeData = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const response = await fetch(API_CONFIG.ENDPOINTS.MY_COMPLAINTS, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                },
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to fetch complaints (${response.status})`);
            }

            const data = await response.json();
            setComplaints(data);
            setError(null);
        } catch (err: any) {
            console.error("Home fetch error:", err);
            setError(err.message);
        } finally {
            setLoadingData(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isSignedIn) {
            fetchHomeData();
        }
    }, [isSignedIn]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchHomeData();
    }, [isSignedIn]);

    if (loading) return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary[600]} />
        </View>
    );

    if (!isSignedIn) {
        return <Redirect href="/(auth)/login" />;
    }

    const displayName = user?.name || "User";
    const userEmail = user?.email || "";


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
                {/* ─── Header Section ─── */}
                <View style={styles.header}>
                    <View style={styles.greetingCard}>
                        <View style={styles.headerTop}>
                            <View style={styles.greetingContent}>
                                <Text style={styles.greetingLabel}>Welcome back,</Text>
                                <Text style={styles.displayName}>{displayName} 👋</Text>
                                <Text style={styles.emailText}>{userEmail}</Text>
                            </View>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                            </View>
                        </View>
                    </View>

                </View>

                {/* ─── Submit Complaint CTA ─── */}
                <Button
                    label="Submit a Complaint"
                    onPress={() => router.push("/(citizen)/submit-complaint")}
                    icon={<Ionicons name="add-circle" size={24} color="#fff" />}
                    style={styles.ctaButton}
                />

                {/* ─── Rewards Section ─── */}
                <Text style={styles.sectionTitle}>Your Contributions & Rewards</Text>
                <RewardsSection
                    points={user?.points ?? 0}
                    loading={loadingData || refreshing}
                />

                {/* ─── My Complaints ─── */}
                <View style={styles.sectionHeaderLine}>
                    <Text style={styles.sectionTitle}>My Complaints</Text>
                    {complaints.length > 0 && (
                        <Text style={styles.countBadge}>{complaints.length}</Text>
                    )}
                </View>

                {loadingData && (
                    <View style={styles.stateContainer}>
                        <ActivityIndicator size="small" color={COLORS.primary[600]} />
                        <Text style={styles.stateText}>Fetching your dashboard…</Text>
                    </View>
                )}

                {!loadingData && error && (
                    <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={24} color={COLORS.error[600]} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.errorTitle}>Failed to load complaints</Text>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                        <Button
                            label="Retry"
                            onPress={fetchHomeData}
                            variant="secondary"
                            size="md"
                            style={{ borderColor: COLORS.error[600] }}
                            textStyle={{ color: COLORS.error[600] }}
                        />
                    </View>
                )}

                {!loadingData && !error && complaints.length === 0 && (
                    <View style={styles.emptyBox}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="document-text-outline" size={48} color={COLORS.neutral[300]} />
                        </View>
                        <Text style={styles.emptyTitle}>No complaints yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Start by submitting a new complaint to help your community
                        </Text>
                    </View>
                )}

                {!loadingData && !error && complaints.length > 0 && (
                    <View style={styles.listContainer}>
                        {complaints.map((item) => (
                            <ComplaintCard key={item.id} item={item} />
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.neutral[50],
    },
    content: {
        padding: SPACING.lg,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: SPACING.xl,
        marginTop: SPACING.sm,
    },
    greetingCard: {
        flex: 1,
        backgroundColor: COLORS.primary[600],
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        ...SHADOWS.elevation2,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greetingContent: {
        flex: 1,
    },
    greetingLabel: {
        ...TYPOGRAPHY.bodyRegular,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: "500",
    },
    displayName: {
        ...TYPOGRAPHY.h2,
        color: COLORS.neutral.white,
        marginTop: 2,
    },
    emailText: {
        ...TYPOGRAPHY.caption,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: {
        ...TYPOGRAPHY.h3,
        color: COLORS.neutral.white,
    },


    // CTA
    ctaButton: {
        marginBottom: SPACING.xl,
    },

    // Sections
    sectionTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.neutral[800],
        marginBottom: SPACING.sm,
    },
    sectionHeaderLine: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: SPACING.sm,
    },
    countBadge: {
        backgroundColor: COLORS.primary[100],
        color: COLORS.primary[600],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
        ...TYPOGRAPHY.caption,
        fontWeight: '800',
    },
    listContainer: {
        marginBottom: SPACING.lg,
    },
    validationList: {
        marginBottom: SPACING.sm,
    },

    // States
    stateContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: SPACING.xl,
        justifyContent: 'center',
    },
    stateText: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.neutral[400],
    },
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: COLORS.error[100],
        padding: SPACING.lg,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.xl,
    },
    errorTitle: {
        ...TYPOGRAPHY.bodyLarge,
        fontWeight: '700',
        color: COLORS.error[600],
    },
    errorText: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.error[600],
        opacity: 0.8,
    },
    emptyBox: {
        alignItems: "center",
        paddingVertical: SPACING["3xl"],
        paddingHorizontal: SPACING.xl,
        backgroundColor: COLORS.neutral.white,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        marginBottom: SPACING.xl,
        ...SHADOWS.elevation1,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.neutral[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    emptyTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.neutral[600],
        marginBottom: SPACING.xs,
    },
    emptySubtitle: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.neutral[400],
        textAlign: "center",
        lineHeight: 22,
    },

    bottomSpacer: {
        height: SPACING["3xl"],
    },
});
