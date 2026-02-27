import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { API_CONFIG } from "@/config/api";

export default function Index() {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  const [backendStatus, setBackendStatus] = useState<"Online" | "Offline" | "Error" | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkBackend = async () => {
      try {
        console.log("[Index] Testing backend connectivity...");
        const res = await fetch(API_CONFIG.ENDPOINTS.HEALTH, { method: 'GET' });
        if (isMounted) setBackendStatus(res.ok ? "Online" : "Error");
        console.log("[Index] Backend reachable:", res.ok);
      } catch (e: any) {
        if (isMounted) setBackendStatus("Offline");
        console.warn("[Index] Backend connectivity check failed:", e.message);
      }
    };
    checkBackend();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    console.log("[Index] Auth Status Update:", { loading, isSignedIn });

    if (!loading) {
      // Don't auto-redirect if backend is offline to avoid confusion
      if (isSignedIn) {
        console.log("[Index] Redirecting to home...");
        router.replace("/(citizen)/home");
      } else {
        console.log("[Index] Redirecting to login...");
        router.replace("/(auth)/login");
      }
    }
  }, [loading, isSignedIn]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f4f8" }}>
      <View style={{ backgroundColor: "#fff", padding: 30, borderRadius: 20, alignItems: "center", elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 20, color: "#1e293b", fontSize: 18, fontWeight: "bold" }}>
          ZenApp is Loading
        </Text>
        <Text style={{ marginTop: 10, color: "#64748b", fontSize: 14, textAlign: "center" }}>
          Backend Status: <Text style={{ color: backendStatus === "Online" ? "green" : "red", fontWeight: "bold" }}>{backendStatus || "Checking..."}</Text>
        </Text>
        <Text style={{ marginTop: 5, color: "#94a3b8", fontSize: 12 }}>
          {loading ? "Initializing Auth..." : "Ready"}
        </Text>
        {backendStatus === "Offline" && (
          <Text style={{ marginTop: 15, color: "#ef4444", fontSize: 11, textAlign: "center" }}>
            Make sure your phone and PC are on the same WiFi and firewall allows port 3000.
          </Text>
        )}
      </View>
    </View>
  );
}
