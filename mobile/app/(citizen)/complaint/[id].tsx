import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Pressable,
    ActivityIndicator,
    Image,
    Alert
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { API_CONFIG } from "@/config/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ComplaintDetail() {
    const { id } = useLocalSearchParams();
    const { getToken } = useAuth();
    const [complaint, setComplaint] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const res = await fetch(`${API_CONFIG.ENDPOINTS.COMPLAINTS}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setComplaint(data);
                } else {
                    // Fallback: fetch all and find (since backend might not have GET /:id)
                    const allRes = await fetch(API_CONFIG.ENDPOINTS.COMPLAINTS, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const allData = await allRes.json();
                    const found = allData.find((c: any) => c.id === id);
                    if (found) setComplaint(found);
                    else throw new Error("Complaint not found");
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary[600]} />
            </View>
        );
    }

    if (error || !complaint) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error || "Complaint not found"}</Text>
                <Button label="Go Back" onPress={() => router.back()} style={{ marginTop: 20 }} />
            </View>
        );
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "SUBMITTED":
                return { label: "Submitted", color: COLORS.primary[600], bg: COLORS.primary[100], progress: 0.1 };
            case "ASSIGNED":
                return { label: "Assigned", color: COLORS.warning[700], bg: COLORS.warning[100], progress: 0.3 };
            case "IN_PROGRESS":
                return { label: "In Progress", color: COLORS.neutral[600], bg: COLORS.neutral[100], progress: 0.6 };
            case "RESOLVED":
                return { label: "Resolved", color: COLORS.success[600], bg: COLORS.success[100], progress: 1.0 };
            case "ESCALATED":
                return { label: "Escalated", color: COLORS.error[600], bg: COLORS.error[100], progress: 0.8 };
            default:
                return { label: status, color: COLORS.neutral[500], bg: COLORS.neutral[100], progress: 0 };
        }
    };

    const handleVerify = async () => {
        const token = await getToken();
        if (!token || !complaint?.id) return;

        try {
            const res = await fetch(API_CONFIG.ENDPOINTS.VALIDATE_COMPLAINT(complaint.id), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const refreshed = await fetch(`${API_CONFIG.ENDPOINTS.COMPLAINTS}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (refreshed.ok) setComplaint(await refreshed.json());
                Alert.alert("Verified!", "Thank you for verifying this issue. +5 Points earned! 🌟");
            } else {
                const err = await res.json();
                Alert.alert("Error", err.error || "Failed to verify");
            }
        } catch (err) {
            Alert.alert("Error", "Network error occurred");
        }
    };

    const statusInfo = getStatusInfo(complaint.status);
    const dateStr = complaint.createdAt || complaint.created_at || new Date().toISOString();
    const creationDate = new Date(dateStr).toLocaleDateString(undefined, {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.neutral[800]} />
                </Pressable>
                <Text style={styles.headerTitle} numberOfLines={1}>Complaint Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ─── Status & Progress ─── */}
                <Card style={styles.statusCard} padding="lg" elevation={1}>
                    <View style={styles.statusHeader}>
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                            <Text style={[styles.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                        </View>
                        <Text style={styles.dateText}>Reported {creationDate}</Text>
                    </View>

                    <Text style={styles.title}>{complaint.title}</Text>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Resolution Progress</Text>
                            <Text style={styles.progressValue}>{Math.round(statusInfo.progress * 100)}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${statusInfo.progress * 100}%`, backgroundColor: statusInfo.color }
                                ]}
                            />
                        </View>
                    </View>
                </Card>

                {/* ─── Complaint Info ─── */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.neutral[400]} />
                    <Text style={styles.sectionTitle}>Details</Text>
                </View>

                <Card style={styles.detailsCard} padding="lg">
                    <Text style={styles.categoryLabel}>{complaint.category}</Text>
                    <Text style={styles.description}>{complaint.description}</Text>

                    {complaint.latitude && (
                        <View style={styles.locationInfo}>
                            <Ionicons name="location-outline" size={16} color={COLORS.neutral[400]} />
                            <Text style={styles.locationText}>
                                {parseFloat(complaint.latitude).toFixed(4)}, {parseFloat(complaint.longitude).toFixed(4)}
                            </Text>
                        </View>
                    )}
                </Card>

                {/* ─── Community Hub ─── */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="people-outline" size={20} color={COLORS.neutral[400]} />
                    <Text style={styles.sectionTitle}>Community Hub</Text>
                </View>

                <Card style={styles.hubCard} padding="lg" elevation={2}>
                    <View style={styles.hubHeader}>
                        <Text style={styles.hubTitle}>Issue Verification</Text>
                        <View style={styles.verifyCount}>
                            <Text style={styles.verifyCountText}>{complaint.validationCount || 0} Verifications</Text>
                        </View>
                    </View>
                    <Text style={styles.hubText}>
                        Community members have confirmed this issue. Verified issues receive priority from local authorities.
                    </Text>
                    <Button
                        label="Upvote & Verify"
                        onPress={handleVerify}
                        variant="secondary"
                        icon={<Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary[600]} />}
                        style={{ marginTop: SPACING.md }}
                    />
                </Card>

                {/* ─── Timeline / Stages ─── */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="git-branch-outline" size={20} color={COLORS.neutral[400]} />
                    <Text style={styles.sectionTitle}>Timeline</Text>
                </View>

                <View style={styles.timeline}>
                    <TimelineItem
                        title="Complaint Received"
                        date={creationDate}
                        isFirst
                        isCompleted
                    />
                    <TimelineItem
                        title="Assignment to Dept"
                        date={complaint.status !== 'SUBMITTED' ? "Assigned" : "Pending"}
                        isCompleted={complaint.status !== 'SUBMITTED'}
                        isActive={complaint.status === 'ASSIGNED'}
                    />
                    <TimelineItem
                        title="Field Inspection"
                        isCompleted={['IN_PROGRESS', 'RESOLVED'].includes(complaint.status)}
                        isActive={complaint.status === 'IN_PROGRESS'}
                    />
                    <TimelineItem
                        title="Resolved"
                        isLast
                        isCompleted={complaint.status === 'RESOLVED'}
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

function TimelineItem({ title, date, isFirst, isLast, isCompleted, isActive }: any) {
    return (
        <View style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
                <View style={[styles.timelineLine, isFirst && { height: '50%', top: '50%' }, isLast && { height: '50%', top: 0 }, (!isFirst && !isLast) && { height: '100%' }]} />
                <View style={[
                    styles.timelineDot,
                    isCompleted && { backgroundColor: COLORS.success[500] },
                    isActive && { backgroundColor: COLORS.primary[500], transform: [{ scale: 1.2 }] }
                ]}>
                    {isCompleted && <Ionicons name="checkmark" size={10} color="#fff" />}
                </View>
            </View>
            <View style={styles.timelineRight}>
                <Text style={[styles.timelineTitle, (isCompleted || isActive) && { color: COLORS.neutral[800], fontWeight: '700' }]}>{title}</Text>
                {date && <Text style={styles.timelineDate}>{date}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.neutral.white,
        ...SHADOWS.elevation1,
    },
    backBtn: {
        padding: SPACING.sm,
        borderRadius: RADIUS.full,
    },
    headerTitle: {
        ...TYPOGRAPHY.bodyLarge,
        fontWeight: '700',
        color: COLORS.neutral[800],
        flex: 1,
        textAlign: 'center',
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    statusCard: {
        marginBottom: SPACING.lg,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
    },
    statusLabel: {
        ...TYPOGRAPHY.caption,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    dateText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.neutral[400],
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.neutral[800],
        marginBottom: SPACING.lg,
    },
    progressContainer: {
        marginTop: SPACING.sm,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    progressLabel: {
        ...TYPOGRAPHY.caption,
        fontWeight: '700',
        color: COLORS.neutral[500],
    },
    progressValue: {
        ...TYPOGRAPHY.caption,
        fontWeight: '800',
        color: COLORS.neutral[800],
    },
    progressBarBg: {
        height: 8,
        backgroundColor: COLORS.neutral[100],
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SPACING.sm,
        marginTop: SPACING.sm,
    },
    sectionTitle: {
        ...TYPOGRAPHY.bodyRegular,
        fontWeight: '800',
        color: COLORS.neutral[500],
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    detailsCard: {
        marginBottom: SPACING.lg,
    },
    categoryLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.primary[600],
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: SPACING.xs,
    },
    description: {
        ...TYPOGRAPHY.bodyLarge,
        color: COLORS.neutral[700],
        lineHeight: 24,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    locationText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.neutral[500],
    },
    hubCard: {
        backgroundColor: COLORS.neutral.white,
        borderColor: COLORS.primary[100],
        borderWidth: 1,
        marginBottom: SPACING.lg,
    },
    hubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    hubTitle: {
        ...TYPOGRAPHY.bodyLarge,
        fontWeight: '800',
        color: COLORS.neutral[800],
    },
    verifyCount: {
        backgroundColor: COLORS.success[100],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    verifyCountText: {
        ...TYPOGRAPHY.caption,
        fontSize: 10,
        color: COLORS.success[700],
        fontWeight: '800',
    },
    hubText: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.neutral[600],
        lineHeight: 20,
    },
    timeline: {
        backgroundColor: COLORS.neutral.white,
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        ...SHADOWS.elevation1,
    },
    timelineItem: {
        flexDirection: 'row',
        height: 60,
    },
    timelineLeft: {
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timelineLine: {
        position: 'absolute',
        width: 2,
        backgroundColor: COLORS.neutral[100],
    },
    timelineDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.neutral[200],
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timelineRight: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: SPACING.md,
    },
    timelineTitle: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.neutral[400],
    },
    timelineDate: {
        ...TYPOGRAPHY.caption,
        color: COLORS.neutral[400],
        marginTop: 2,
    },
    errorText: {
        ...TYPOGRAPHY.bodyLarge,
        color: COLORS.error[600],
    },
});
