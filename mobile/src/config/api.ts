/**
 * API Configuration
 * Centralized API endpoint management.
 */
import { Platform } from "react-native";
import Constants from "expo-constants";

const LOCAL_BACKEND_PORT = "3000";

const getDevHostFromExpo = (): string | null => {
    const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoConfig?.extra?.expoGo?.debuggerHost;
    if (!hostUri) return null;

    // hostUri can be values like "192.168.1.10:8081", "localhost:8081", or "[::1]:8081"
    const normalizedHostUri = hostUri.trim();

    if (normalizedHostUri.startsWith("[")) {
        const closingBracketIndex = normalizedHostUri.indexOf("]");
        if (closingBracketIndex > 1) {
            return normalizedHostUri.slice(1, closingBracketIndex);
        }
    }

    const colonCount = (normalizedHostUri.match(/:/g) || []).length;
    const hasPort = colonCount === 1;
    const host = hasPort ? normalizedHostUri.split(":")[0] : normalizedHostUri;

    return host || null;
};


const formatHostForUrl = (host: string) => {
    return host.includes(":") ? `[${host}]` : host;
};

const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    const devHost = getDevHostFromExpo();

    if (devHost && devHost !== "localhost" && devHost !== "127.0.0.1") {
        return `http://${formatHostForUrl(devHost)}:${LOCAL_BACKEND_PORT}`;
    }

    // Fallback for emulator/simulator local development
    if (Platform.OS === "android") {
        // Android emulator host machine loopback
        return `http://10.0.2.2:${LOCAL_BACKEND_PORT}`;
    }

    // iOS simulator host machine loopback
    return `http://localhost:${LOCAL_BACKEND_PORT}`;
};

const API_BASE_URL = getBaseUrl();
console.log(`[API_CONFIG] Base URL: ${API_BASE_URL}`);

export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    ENDPOINTS: {
        // Auth
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        ME: `${API_BASE_URL}/api/auth/me`,
        PROFILE: `${API_BASE_URL}/api/auth/me`, // Same as ME now
        LOGOUT: `${API_BASE_URL}/api/auth/logout`,

        // Complaints
        COMPLAINTS: `${API_BASE_URL}/api/complaints`,
        MY_COMPLAINTS: `${API_BASE_URL}/api/complaints/my`,
        VALIDATE_COMPLAINT: (id: string) => `${API_BASE_URL}/api/complaints/${id}/validate`,

        // Others
        HEALTH: `${API_BASE_URL}/health`,
    },
};
