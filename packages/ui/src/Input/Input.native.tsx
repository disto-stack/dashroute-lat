import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
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
  const compact = size === 'compact';
  return (
    <View style={styles.field}>
      <Text style={[styles.label, compact && styles.compactLabel]}>{label}</Text>
      <TextInput
        style={[styles.input, compact && styles.compactInput, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={tokens.colors.muted}
        value={value}
        defaultValue={defaultValue}
        secureTextEntry={type === 'password'}
        keyboardType={type === 'email' ? 'email-address' : 'default'}
        autoCapitalize="none"
        onChangeText={(text: string) => {
          (onChange as unknown as ((text: string) => void) | undefined)?.(text);
        }}
        onBlur={() => {
          (onBlur as unknown as (() => void) | undefined)?.();
        }}
      />
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
