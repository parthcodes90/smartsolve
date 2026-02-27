import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../constants/theme";
import Card from "./ui/Card";
import { router } from "expo-router";

type Complaint = {
    id: string;
    title: string;
    category: string;
    status: string;
    createdAt?: string;
    created_at?: string;
};

type Props = {
    item: Complaint;
};

export default function ComplaintCard({ item }: Props) {
    const dateStr = item.createdAt || item.created_at || new Date().toISOString();
    const formattedDate = new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    const getStatusStyle = () => {
        switch (item.status) {
            case "SUBMITTED":
                return {
                    bg: COLORS.primary[100],
                    text: COLORS.primary[600],
                    icon: "paper-plane-outline" as const
                };
            case "ASSIGNED":
                return {
                    bg: COLORS.warning[100],
                    text: COLORS.warning[700],
                    icon: "person-outline" as const
                };
            case "IN_PROGRESS":
                return {
                    bg: COLORS.neutral[100],
                    text: COLORS.neutral[500],
                    icon: "time-outline" as const
                };
            case "RESOLVED":
                return {
                    bg: COLORS.success[100],
                    text: COLORS.success[600],
                    icon: "checkmark-circle-outline" as const
                };
            case "ESCALATED":
                return {
                    bg: COLORS.error[100],
                    text: COLORS.error[600],
                    icon: "alert-circle-outline" as const
                };
            default:
                return {
                    bg: COLORS.neutral[50],
                    text: COLORS.neutral[400],
                    icon: "help-circle-outline" as const
                };
        }
    };

    const statusStyle = getStatusStyle();

    return (
        <Pressable onPress={() => router.push(`/(citizen)/complaint/${item.id}`)}>
            <Card style={styles.card} padding="lg" elevation={2}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Ionicons name={statusStyle.icon} size={12} color={statusStyle.text} />
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.details}>
                    <View style={styles.detailItem}>
                        <Ionicons name="folder-open-outline" size={14} color={COLORS.neutral[400]} />
                        <Text style={styles.detailText}>{item.category}</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={14} color={COLORS.neutral[400]} />
                        <Text style={styles.detailText}>{formattedDate}</Text>
                    </View>
                </View>
            </Card>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: SPACING.md,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.md,
    },
    title: {
        ...TYPOGRAPHY.bodyLarge,
        fontWeight: "700",
        color: COLORS.neutral[800],
        flex: 1,
        marginRight: SPACING.sm,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
        gap: 4,
    },
    statusText: {
        ...TYPOGRAPHY.caption,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    details: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    detailText: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.neutral[500],
    },
    separator: {
        width: 1,
        height: 12,
        backgroundColor: COLORS.neutral[100],
        marginHorizontal: SPACING.md,
    },
});
