import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    Animated,
    StyleProp,
    ViewStyle
} from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
}

export default function Input({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    style,
    containerStyle,
    onFocus,
    onBlur,
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const borderAnim = React.useRef(new Animated.Value(0)).current;

    const handleFocus = (e: any) => {
        setIsFocused(true);
        Animated.timing(borderAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        Animated.timing(borderAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        if (onBlur) onBlur(e);
    };

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [error ? COLORS.error[600] : COLORS.neutral[300], COLORS.primary[500]],
    });

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <Animated.View style={[
                styles.inputContainer,
                { borderColor },
                isFocused && SHADOWS.elevation1,
            ]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={COLORS.neutral[400]}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />
                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </Animated.View>

            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : helperText ? (
                <Text style={styles.helperText}>{helperText}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
        width: '100%',
    },
    label: {
        ...TYPOGRAPHY.bodyRegular,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: SPACING.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.neutral.white,
        height: 48,
        paddingHorizontal: SPACING.md,
    },
    input: {
        flex: 1,
        ...TYPOGRAPHY.bodyLarge,
        color: COLORS.neutral[800],
        height: '100%',
    },
    leftIcon: {
        marginRight: SPACING.sm,
    },
    rightIcon: {
        marginLeft: SPACING.sm,
    },
    errorText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.error[600],
        marginTop: SPACING.xs,
        fontWeight: '400',
    },
    helperText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.neutral[500],
        marginTop: SPACING.xs,
        fontWeight: '400',
    },
});
