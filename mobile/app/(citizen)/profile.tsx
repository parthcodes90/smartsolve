import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Pressable,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import Card from "@/components/ui/Card";

export default function ProfileScreen() {
    const { user, signOut } = useAuth();

    const displayName = user?.name || "User";
    const userEmail = user?.email || "User";
    const points = user?.points ?? 0;


    // Compute rank from points
    const getRank = (pts: number) => {
        if (pts >= 2000) return "Zen Master";
        if (pts >= 501) return "City Guardian";
        if (pts >= 101) return "Community Hero";
        return "Civic Starter";
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut();
                            router.replace("/(auth)/login");
                        } catch (err: any) {
                            Alert.alert("Error", err.message || "Logout failed");
                        }
                    }
                }
            ]
        );
    };

    const SETTINGS_OPTIONS = [
        { id: "edit", icon: "person-outline", label: "Edit Profile", color: COLORS.primary[600] },
        { id: "notifications", icon: "notifications-outline", label: "Notifications", color: COLORS.warning[500] },
        { id: "privacy", icon: "shield-outline", label: "Privacy & Security", color: COLORS.success[600] },
        { id: "help", icon: "help-circle-outline", label: "Help & Support", color: COLORS.neutral[400] },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* ─── Profile Header ─── */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                        </View>
                        <Pressable style={styles.editAvatarBtn}>
                            <Ionicons name="camera" size={16} color={COLORS.neutral.white} />
                        </Pressable>
                    </View>
                    <Text style={styles.userName}>{displayName}</Text>
                    <Text style={styles.userEmail}>{userEmail}</Text>
                </View>

                {/* ─── Stats Card ─── */}
                <Card style={styles.statsCard} padding="lg">
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{user?.role || "CITIZEN"}</Text>
                        <Text style={styles.statLabel}>Role</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{points}</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{getRank(points)}</Text>
                        <Text style={styles.statLabel}>Rank</Text>
                    </View>
                </Card>

                {/* ─── Settings Menu ─── */}
                <View style={styles.menuContainer}>
                    {SETTINGS_OPTIONS.map((item, index) => (
                        <Pressable key={item.id} style={styles.menuItem}>
                            <View style={[styles.menuIconContainer, { backgroundColor: item.color + "15" }]}>
                                <Ionicons name={item.icon as any} size={20} color={item.color} />
                            </View>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={18} color={COLORS.neutral[300]} />
                        </Pressable>
                    ))}
                </View>

                {/* ─── Logout ─── */}
                <Pressable onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.error[600]} />
                    <Text style={styles.logoutText}>Logout</Text>
                </Pressable>

                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>ZenApp v1.0.0</Text>
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
        alignItems: "center",
        marginTop: SPACING.xl,
        marginBottom: SPACING["2xl"],
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary[600],
        alignItems: "center",
        justifyContent: "center",
        ...SHADOWS.elevation3,
    },
    avatarText: {
        ...TYPOGRAPHY.h1,
        fontSize: 36,
        color: COLORS.neutral.white,
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.neutral[800],
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: COLORS.neutral[50],
    },
    userName: {
        ...TYPOGRAPHY.h2,
        color: COLORS.neutral[800],
    },
    userEmail: {
        ...TYPOGRAPHY.bodyRegular,
        color: COLORS.neutral[400],
        marginTop: 4,
    },
    statsCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: COLORS.neutral.white,
        marginBottom: SPACING.xl,
        ...SHADOWS.elevation2,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        ...TYPOGRAPHY.h3,
        color: COLORS.neutral[800],
    },
    statLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.neutral[400],
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.neutral[100],
        marginVertical: SPACING.xs,
    },
    menuContainer: {
        backgroundColor: COLORS.neutral.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.xs,
        marginBottom: SPACING.xl,
        ...SHADOWS.elevation1,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: SPACING.md,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
        marginRight: SPACING.md,
    },
    menuLabel: {
        ...TYPOGRAPHY.bodyLarge,
        fontWeight: "600",
        color: COLORS.neutral[700],
        flex: 1,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.error[100],
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        gap: 8,
    },
    logoutText: {
        ...TYPOGRAPHY.bodyLarge,
        fontWeight: "700",
        color: COLORS.error[600],
    },
    versionContainer: {
        alignItems: "center",
        marginTop: SPACING["2xl"],
    },
    versionText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.neutral[300],
    },
    bottomSpacer: {
        height: SPACING["3xl"],
    },
});
