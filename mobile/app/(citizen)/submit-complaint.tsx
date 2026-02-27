import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useComplaintActions, useComplaintLoading } from "@/stores/complaintStore";
import { useZoneActions, useZones } from "@/stores/zoneStore";

export default function SubmitComplaintScreen() {
  const { submitComplaint } = useComplaintActions();
  const isSubmitting = useComplaintLoading();
  const { fetchZones } = useZoneActions();
  const zones = useZones();

  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [address, setAddress] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const zoneHint = useMemo(() => zones.map((zone) => zone.name).slice(0, 3).join(", "), [zones]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow gallery access to attach a photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const captureLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission required", "Please allow location access.");
      return;
    }

    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setLatitude(position.coords.latitude);
    setLongitude(position.coords.longitude);
  };

  const handleSubmit = async () => {
    if (!description || !categoryId || !photoUri || latitude == null || longitude == null) {
      Alert.alert("Missing details", "Description, category UUID, location, and photo are required.");
      return;
    }

    try {
      setUploadProgress(0);
      await submitComplaint({
        description,
        categoryId,
        address,
        submittedBy,
        latitude,
        longitude,
        photoUri,
        onUploadProgress: setUploadProgress,
      });
      Alert.alert("Success", "Complaint submitted successfully.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong, try again";
      Alert.alert("Submission failed", message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Submit Complaint</Text>
        <Input label="Description" value={description} onChangeText={setDescription} multiline helperText="Min 5 chars" />
        <Input label="Category UUID" value={categoryId} onChangeText={setCategoryId} helperText="Use backend category UUID" />
        <Input label="Address" value={address} onChangeText={setAddress} helperText={zoneHint ? `Zones: ${zoneHint}` : "Optional"} />
        <Input label="Submitted by" value={submittedBy} onChangeText={setSubmittedBy} helperText="Plain text, no auth required" />

        <View style={styles.actionsRow}>
          <Button label="Pick Photo" onPress={pickImage} variant="secondary" />
          <Button label="Use Current Location" onPress={captureLocation} variant="secondary" />
        </View>

        {photoUri ? <Image source={{ uri: photoUri }} style={styles.preview} /> : null}
        {latitude != null && longitude != null ? (
          <Text style={styles.locationText}>Location: {latitude.toFixed(5)}, {longitude.toFixed(5)}</Text>
        ) : null}

        {isSubmitting ? (
          <View style={styles.progressWrap}>
            <ActivityIndicator color={COLORS.primary[600]} />
            <Text style={styles.progressText}>Uploading… {Math.round(uploadProgress * 100)}%</Text>
          </View>
        ) : null}

        <Pressable onPress={handleSubmit} style={styles.submitBtn}>
          <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
          <Text style={styles.submitLabel}>Submit</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: SPACING.lg, gap: SPACING.md },
  title: { ...TYPOGRAPHY.h2, color: COLORS.neutral[800], marginBottom: SPACING.sm },
  actionsRow: { flexDirection: "row", gap: SPACING.sm },
  preview: { width: "100%", height: 180, borderRadius: 12 },
  locationText: { ...TYPOGRAPHY.bodyRegular, color: COLORS.neutral[600] },
  progressWrap: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  progressText: { ...TYPOGRAPHY.bodyRegular, color: COLORS.neutral[700] },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary[600],
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  submitLabel: { color: "#fff", fontWeight: "700" },
});
