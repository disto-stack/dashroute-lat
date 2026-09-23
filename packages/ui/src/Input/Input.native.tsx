import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { Icon } from '../Icon';
import { InputProps } from './Input.types';

export const Input = ({
  label,
  size = 'default',
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  error,
}: InputProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  // Tracks typed text when the field is uncontrolled (no `value` prop), so the
  // toggle can still appear as the user types; controlled usage (the common
  // case) just reads `value` directly instead.
  const [text, setText] = useState(value ?? defaultValue ?? '');
  const currentValue = value !== undefined ? value : text;
  const compact = size === 'compact';
  const isPassword = type === 'password';
  const showToggle = isPassword && currentValue.length > 0;
  return (
    <View style={styles.field}>
      <Text style={[styles.label, compact && styles.compactLabel]}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            compact && styles.compactInput,
            showToggle && (compact ? styles.compactInputWithToggle : styles.inputWithToggle),
            error && styles.inputError,
          ]}
          placeholder={placeholder}
          placeholderTextColor={tokens.colors.muted}
          value={value}
          defaultValue={defaultValue}
          secureTextEntry={isPassword && !passwordVisible}
          keyboardType={type === 'email' ? 'email-address' : 'default'}
          autoCapitalize="none"
          onChangeText={(t: string) => {
            setText(t);
            (onChange as unknown as ((text: string) => void) | undefined)?.(t);
          }}
          onBlur={() => {
            (onBlur as unknown as (() => void) | undefined)?.();
          }}
        />
        {showToggle ? (
          <Pressable
            style={[styles.toggle, compact && styles.compactToggle]}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setPasswordVisible((v) => !v)}
          >
            <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={18} color={tokens.colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    gap: tokens.spacing.space2,
  },
  label: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.label.fontSize,
    color: tokens.colors.ink,
  },
  compactLabel: {
    fontSize: tokens.type.textStyles.caption.fontSize,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  toggle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactToggle: {
    width: 36,
  },
  inputWithToggle: {
    paddingRight: 44,
  },
  compactInputWithToggle: {
    paddingRight: 36,
  },
  input: {
    width: '100%',
    height: tokens.size.control,
    paddingHorizontal: tokens.spacing.space4,
    borderWidth: 1.5,
    borderColor: tokens.colors.borderStrong,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.paper,
    color: tokens.colors.ink,
    fontFamily: tokens.type.native.bodyRegular,
    fontSize: tokens.type.textStyles.body.fontSize,
  },
  compactInput: {
    height: tokens.size.controlCompact,
    borderRadius: tokens.radius.xs,
    fontSize: tokens.type.textStyles.caption.fontSize,
    paddingHorizontal: tokens.spacing.space3,
    backgroundColor: tokens.colors.card,
  },
  inputError: {
    borderColor: tokens.colors.danger,
  },
  error: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.caption.fontSize,
    color: tokens.colors.danger,
  },
});
