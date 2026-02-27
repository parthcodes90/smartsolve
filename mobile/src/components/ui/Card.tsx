import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    elevation?: 0 | 1 | 2 | 3 | 4 | 5;
    padding?: keyof typeof SPACING;
}

export default function Card({
    children,
    style,
    elevation = 2,
    padding = 'lg'
}: CardProps) {
    const getElevation = () => {
        switch (elevation) {
            case 0: return {};
            case 1: return SHADOWS.elevation1;
            case 2: return SHADOWS.elevation2;
            case 3: return SHADOWS.elevation3;
            case 4: return SHADOWS.elevation4;
            default: return SHADOWS.elevation2;
        }
    };

    return (
        <View style={[
            styles.card,
            getElevation(),
            { padding: SPACING[padding] },
            style
        ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.neutral.white,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
    },
});
