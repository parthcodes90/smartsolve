import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS, TYPOGRAPHY } from "@/constants/theme";
import { Platform } from "react-native";

export default function CitizenLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary[600],
                tabBarInactiveTintColor: COLORS.neutral[400],
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                    letterSpacing: 0.3,
                    marginBottom: Platform.OS === "ios" ? 0 : 6,
                },
                tabBarStyle: {
                    backgroundColor: COLORS.neutral.white,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.neutral[100],
                    height: Platform.OS === "ios" ? 88 : 68,
                    ...SHADOWS.elevation3,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
            }}
        >
            {/* ─── Visible Tabs ─── */}
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="community"
                options={{
                    title: "Community",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "people" : "people-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="rewards"
                options={{
                    title: "Rewards",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "trophy" : "trophy-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "person" : "person-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />

            {/* ─── Hidden Screens (accessible via navigation, not tabs) ─── */}
            <Tabs.Screen
                name="submit-complaint"
                options={{
                    href: null, // hides from tab bar
                }}
            />
            <Tabs.Screen
                name="complaint/[id]"
                options={{
                    href: null, // hides from tab bar
                }}
            />
        </Tabs>
    );
}
