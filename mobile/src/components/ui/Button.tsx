import React from 'react';
import {
    View,
    Pressable,
    Text,
    StyleSheet,
    ActivityIndicator,
    StyleProp,
    ViewStyle,
    TextStyle,
    Animated
} from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
    size?: 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export default function Button({
    label,
    onPress,
    variant = 'primary',
    size = 'lg',
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle
}: ButtonProps) {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    button: { backgroundColor: COLORS.primary[600] },
                    text: { color: COLORS.neutral.white },
                };
            case 'secondary':
                return {
                    button: {
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: COLORS.neutral[300]
                    },
                    text: { color: COLORS.primary[600] },
                };
            case 'success':
                return {
                    button: { backgroundColor: COLORS.success[600] },
                    text: { color: COLORS.neutral.white },
                };
            case 'danger':
                return {
                    button: { backgroundColor: COLORS.error[600] },
                    text: { color: COLORS.neutral.white },
                };
            case 'ghost':
                return {
                    button: { backgroundColor: 'transparent' },
                    text: { color: COLORS.neutral[500] },
                };
            default:
                return {
                    button: { backgroundColor: COLORS.primary[600] },
                    text: { color: COLORS.neutral.white },
                };
        }
    };

    const variantStyles = getVariantStyles();
    const height = size === 'lg' ? 56 : 48;

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                style={[
                    styles.base,
                    { height },
                    variantStyles.button,
                    variant === 'primary' && SHADOWS.elevation2,
                    (disabled || loading) && styles.disabled,
                    style,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={variantStyles.text.color} />
                ) : (
                    <>
                        {icon && <View style={styles.iconContainer}>{icon}</View>}
                        <Text style={[styles.text, variantStyles.text, size === 'lg' ? TYPOGRAPHY.h3 : TYPOGRAPHY.bodyLarge, textStyle]}>
                            {label}
                        </Text>
                    </>
                )}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.sm,
        paddingHorizontal: SPACING.lg,
    },
    text: {
        fontWeight: '600',
    },
    disabled: {
        opacity: 0.5,
    },
    iconContainer: {
        marginRight: SPACING.sm,
    },
});
