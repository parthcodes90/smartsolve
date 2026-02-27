import {
    Text,
    Pressable,
    ScrollView,
    Image,
    Alert,
    View,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useAuth } from "@/context/AuthContext";
import { API_CONFIG } from "@/config/api";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";

export default function SubmitComplaint() {
    const { getToken, user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("ROAD");
    const [priority, setPriority] = useState(3);
    const [image, setImage] = useState<string | null>(null);
    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "Gallery access is needed");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "Camera access is needed");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const getLocation = async () => {
        setLocating(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission required", "Location access is needed");
            setLocating(false);
            return;
        }
        const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });
        setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
        });
        setLocating(false);
    };

    const handleSubmit = async () => {
        try {
            if (!title || !description) {
                Alert.alert("Error", "Title and description are required");
                return;
            }

            const token = await getToken();
            if (!token || !user) {
                Alert.alert("Error", "Not authenticated");
                return;
            }

            setLoading(true);

            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("category", category.toUpperCase().replace("ROADS", "ROAD"));
            formData.append("priority", String(priority));
            formData.append("latitude", location?.latitude?.toString() || "0");
            formData.append("longitude", location?.longitude?.toString() || "0");
            formData.append("address", "Captured from Mobile Device");

            if (image) {
                const fileName = image.split("/").pop() || `complaint-${Date.now()}.jpg`;
                const match = /\.([a-zA-Z0-9]+)$/.exec(fileName);
                const extension = match?.[1]?.toLowerCase() || "jpg";
                const mimeType = extension === "png" ? "image/png" : extension === "webp" ? "image/webp" : "image/jpeg";

                formData.append("image", {
                    uri: image,
                    name: fileName,
                    type: mimeType,
                } as any);
            }

            const res = await fetch(API_CONFIG.ENDPOINTS.COMPLAINTS, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}` ,
                },
                body: formData,
            });

            if (!res.ok) {
                const result = await res.json().catch(() => ({}));

                // Handle field-level validation errors from backend
                if (result.details) {
                    const firstField = Object.keys(result.details)[0];
                    const firstError = result.details[firstField][0];
                    throw new Error(`${firstField}: ${firstError}`);
                }

                throw new Error(result.error || `Server error (${res.status})`);
            }

            Alert.alert("Success 🎉", "Your complaint has been submitted successfully!", [
                { text: "Finish", onPress: () => router.back() },
            ]);
        } catch (err: any) {
            console.error("Submission error:", err);
            Alert.alert("Submission Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.neutral[800]} />
                    </Pressable>
                    <Text style={styles.headerTitle}>New Complaint</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ─── Progress Steps ─── */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.stepDot, styles.activeStep]} />
                        <View style={styles.stepLine} />
                        <View style={styles.stepDot} />
                        <View style={styles.stepLine} />
                        <View style={styles.stepDot} />
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Complaint Details</Text>
                    </View>

                    <Input
                        label="Complaint Title"
                        placeholder="e.g., Pothole on Main Street"
                        value={title}
                        onChangeText={setTitle}
                        helperText="Brief, descriptive title"
                    />

                    <Text style={styles.label}>Issue Category</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={category}
                            onValueChange={(value) => setCategory(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Roads & Footpaths" value="ROAD" />
                            <Picker.Item label="Water Supply" value="WATER" />
                            <Picker.Item label="Garbage & Waste" value="GARBAGE" />
                            <Picker.Item label="Street Lighting" value="STREETLIGHT" />
                            <Picker.Item label="Sanitation" value="SANITATION" />
                            <Picker.Item label="Other" value="OTHER" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Urgency Level</Text>
                    <View style={styles.priorityRow}>
                        {[1, 2, 3, 4, 5].map((p) => (
                            <Pressable
                                key={p}
                                onPress={() => setPriority(p)}
                                style={[
                                    styles.priorityItem,
                                    priority === p && styles.priorityItemSelected
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.priorityText,
                                        priority === p && styles.priorityTextSelected
                                    ]}
                                >
                                    {p}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                    <Text style={styles.helperText}>1 = Low, 5 = Critical</Text>

                    <Input
                        label="Detailed Description"
                        placeholder="Describe the issue in detail..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        style={{ height: 120, textAlignVertical: 'top' }}
                        helperText="Add as much detail as possible"
                    />

                    <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
                        <Text style={styles.sectionTitle}>Location</Text>
                    </View>

                    <Card style={styles.locationCard} elevation={1} padding="md">
                        <View style={styles.locationHeader}>
                            <Ionicons name="location" size={20} color={COLORS.primary[600]} />
                            <Text style={styles.locationLabel}>Captured Position</Text>
                        </View>
                        <Text style={styles.coordinates}>
                            {location ? `${location.latitude.toFixed(5)}° N, ${location.longitude.toFixed(5)}° E` : "Not captured yet"}
                        </Text>
                        <Button
                            label={locating ? "Locating..." : "Use Current Location"}
                            onPress={getLocation}
                            variant="secondary"
                            size="md"
                            icon={locating ? <ActivityIndicator size="small" color={COLORS.primary[500]} /> : <Ionicons name="locate" size={18} color={COLORS.primary[500]} />}
                            style={{ marginTop: SPACING.md }}
                        />
                    </Card>

                    <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
                        <Text style={styles.sectionTitle}>Attachments</Text>
                    </View>

                    <View style={styles.attachmentButtons}>
                        <Pressable onPress={takePhoto} style={styles.attachBtn}>
                            <Ionicons name="camera" size={24} color={COLORS.primary[600]} />
                            <Text style={styles.attachBtnText}>Camera</Text>
                        </Pressable>
                        <Pressable onPress={pickImage} style={styles.attachBtn}>
                            <Ionicons name="images" size={24} color={COLORS.primary[600]} />
                            <Text style={styles.attachBtnText}>Gallery</Text>
                        </Pressable>
                    </View>

                    {image && (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: image }} style={styles.imagePreview} />
                            <Pressable onPress={() => setImage(null)} style={styles.removeImg}>
                                <Ionicons name="close-circle" size={24} color={COLORS.error[600]} />
                            </Pressable>
                        </View>
                    )}

                    <View style={styles.footer}>
                        <Button
                            label="Submit Complaint"
                            onPress={handleSubmit}
                            loading={loading}
                            variant="success"
                            size="lg"
                            icon={<Ionicons name="send" size={20} color="#fff" />}
                        />
                        <Button
                            label="Cancel"
                            onPress={() => router.back()}
                            variant="ghost"
                            size="md"
                            style={{ marginTop: SPACING.sm }}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.neutral[800],
    },
    scrollContent: {
        padding: SPACING.xl,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING["2xl"],
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.neutral[200],
    },
    activeStep: {
        backgroundColor: COLORS.primary[600],
        transform: [{ scale: 1.2 }],
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: COLORS.neutral[100],
        marginHorizontal: 4,
    },
    sectionHeader: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.neutral[800],
    },
    label: {
        ...TYPOGRAPHY.bodyRegular,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: SPACING.xs,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: COLORS.neutral[300],
        borderRadius: RADIUS.sm,
        marginBottom: SPACING.md,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    priorityRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.xs,
    },
    priorityItem: {
        flex: 1,
        height: 48,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.neutral[50],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    priorityItemSelected: {
        backgroundColor: COLORS.primary[600],
        borderColor: COLORS.primary[600],
        ...SHADOWS.elevation2,
    },
    priorityText: {
        ...TYPOGRAPHY.bodyLarge,
        fontWeight: '700',
        color: COLORS.neutral[600],
    },
    priorityTextSelected: {
        color: COLORS.neutral.white,
    },
    helperText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.neutral[500],
        marginBottom: SPACING.md,
    },
    locationCard: {
        backgroundColor: COLORS.primary[100],
        borderColor: 'transparent',
        marginBottom: SPACING.md,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SPACING.xs,
    },
    locationLabel: {
        ...TYPOGRAPHY.bodyRegular,
        fontWeight: '700',
        color: COLORS.primary[600],
    },
    coordinates: {
        ...TYPOGRAPHY.bodyLarge,
        fontWeight: '800',
        color: COLORS.neutral[800],
        marginVertical: 4,
    },
    attachmentButtons: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    attachBtn: {
        flex: 1,
        height: 80,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.neutral[50],
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: COLORS.neutral[300],
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    attachBtnText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.neutral[500],
        fontWeight: '700',
    },
    previewContainer: {
        position: 'relative',
        marginBottom: SPACING.xl,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: RADIUS.md,
    },
    removeImg: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: COLORS.neutral.white,
        borderRadius: 12,
    },
    footer: {
        marginTop: SPACING.xl,
        paddingBottom: SPACING["3xl"],
    },
});
