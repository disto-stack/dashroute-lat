import React from 'react';
import { View, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import type { Preview } from '@storybook/react-native';

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    padding: tokens.spacing.space5,
    backgroundColor: tokens.colors.paper,
  },
});

const preview: Preview = {
  parameters: {},
  decorators: [(Story) => <View style={styles.canvas}>{Story()}</View>],
};

export default preview;
