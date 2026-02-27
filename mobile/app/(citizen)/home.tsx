import { useCallback, useEffect } from "react";
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import Button from "@/components/ui/Button";
import ComplaintCard from "@/components/ComplaintCard";
import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import {
  useComplaintActions,
  useComplaintError,
  useComplaintList,
  useComplaintLoading,
} from "@/stores/complaintStore";

export default function HomeScreen() {
  const complaints = useComplaintList();
  const isLoading = useComplaintLoading();
  const error = useComplaintError();
  const { fetchComplaints } = useComplaintActions();

  useEffect(() => {
    fetchComplaints({ page: 1, limit: 20 });
  }, [fetchComplaints]);

  useEffect(() => {
    if (error) {
      Alert.alert("Could not load complaints", error);
    }
  }, [error]);

  const onRefresh = useCallback(() => {
    fetchComplaints({ page: 1, limit: 20 });
  }, [fetchComplaints]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Municipal Complaints</Text>
        <Button label="Submit Complaint" onPress={() => router.push("/(citizen)/submit-complaint")} />

        {isLoading && complaints.length === 0 ? <ActivityIndicator color={COLORS.primary[600]} /> : null}

        <View style={styles.list}>
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              item={{
                id: complaint.id,
                title: complaint.description,
                category: typeof complaint.category === "string" ? complaint.category : complaint.category?.name ?? "General",
                status: complaint.status,
                createdAt: complaint.createdAt,
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: SPACING.lg, gap: SPACING.md },
  title: { ...TYPOGRAPHY.h2, color: COLORS.neutral[800] },
  list: { marginTop: SPACING.sm },
});
