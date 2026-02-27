import { useEffect } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import Card from "@/components/ui/Card";
import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import {
  useComplaintActions,
  useComplaintError,
  useComplaintLoading,
  useSelectedComplaint,
} from "@/stores/complaintStore";

export default function ComplaintDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const complaint = useSelectedComplaint();
  const isLoading = useComplaintLoading();
  const error = useComplaintError();
  const { fetchComplaintById } = useComplaintActions();

  useEffect(() => {
    if (params.id) {
      fetchComplaintById(params.id);
    }
  }, [fetchComplaintById, params.id]);

  useEffect(() => {
    if (error) {
      Alert.alert("Unable to load complaint", error);
    }
  }, [error]);

  if (isLoading && !complaint) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary[600]} />
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>Complaint not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Complaint Details</Text>
        <Card>
          <Text style={styles.label}>Status</Text>
          <Text>{complaint.status}</Text>
          <Text style={styles.label}>Description</Text>
          <Text>{complaint.description}</Text>
          <Text style={styles.label}>Coordinates</Text>
          <Text>
            {complaint.latitude}, {complaint.longitude}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: SPACING.lg, gap: SPACING.md },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { ...TYPOGRAPHY.h2, color: COLORS.neutral[800] },
  label: { marginTop: SPACING.sm, fontWeight: "700" },
  muted: { color: COLORS.neutral[500] },
});
