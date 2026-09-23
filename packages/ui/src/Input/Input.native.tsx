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
    fontWeight: '600',
    fontSize: 14,
    color: tokens.colors.ink,
  },
  compactLabel: {
    fontSize: 13,
  },
  input: {
    width: '100%',
    height: tokens.size.control,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: tokens.colors.borderStrong,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.paper,
    color: tokens.colors.ink,
    fontSize: 17,
  },
  compactInput: {
    height: tokens.size.controlCompact,
    borderRadius: tokens.radius.xs,
    fontSize: 14,
    paddingHorizontal: 12,
    backgroundColor: tokens.colors.card,
  },
  inputError: {
    borderColor: tokens.colors.danger,
  },
  error: {
    fontWeight: '600',
    fontSize: 13,
    color: tokens.colors.danger,
  },
});
