export const COLORS = {
    // Primary Brand Colors
    primary: {
        600: "#4f46e5", // Indigo-600
        500: "#6366f1", // Indigo-500
        400: "#818cf8", // Indigo-400
        100: "#e0e7ff", // Indigo-100
    },
    // Status & Sentiment
    success: {
        700: "#047857", // Emerald-700
        600: "#059669", // Emerald-600
        500: "#10b981", // Emerald-500
        100: "#d1fae5", // Emerald-100
    },
    warning: {
        500: "#f59e0b", // Amber-500
        100: "#fef3c7", // Amber-100
        700: "#b45309",
        200: "#fde68a",
    },
    error: {
        600: "#dc2626", // Red-600
        100: "#fee2e2", // Red-100
    },
    neutral: {
        50: "#f8fafc",  // Slate-50
        100: "#f1f5f9", // Slate-100
        200: "#e2e8f0", // Slate-200
        300: "#cbd5e1", // Slate-300
        400: "#94a3b8", // Slate-400
        500: "#64748b", // Slate-500
        600: "#475569", // Slate-600
        700: "#334155", // Slate-700
        800: "#1e293b", // Slate-800
        900: "#0f172a", // Slate-950
        white: "#ffffff",
    }
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
    "3xl": 48,
};

export const RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
};

export const SHADOWS = {
    elevation1: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    elevation2: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    elevation3: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
    },
    elevation4: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 4,
    },
};

export const TYPOGRAPHY = {
    h0: {
        fontSize: 32,
        fontWeight: "700" as const,
        letterSpacing: -0.5,
        lineHeight: 38.4,
    },
    h1: {
        fontSize: 28,
        fontWeight: "700" as const,
        letterSpacing: -0.25,
        lineHeight: 33.6,
    },
    h2: {
        fontSize: 24,
        fontWeight: "700" as const,
        letterSpacing: 0,
        lineHeight: 28.8,
    },
    h3: {
        fontSize: 20,
        fontWeight: "600" as const,
        letterSpacing: 0,
        lineHeight: 24,
    },
    bodyLarge: {
        fontSize: 16,
        fontWeight: "400" as const,
        letterSpacing: 0.15,
        lineHeight: 24,
    },
    bodyRegular: {
        fontSize: 14,
        fontWeight: "400" as const,
        letterSpacing: 0.15,
        lineHeight: 21,
    },
    caption: {
        fontSize: 12,
        fontWeight: "600" as const,
        letterSpacing: 0.4,
        lineHeight: 16.8,
    },
};
