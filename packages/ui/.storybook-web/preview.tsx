import '@dashroute/ui-tokens/tokens.css';
import { tokens } from '@dashroute/ui-tokens';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        paper: { name: 'paper', value: tokens.colors.paper },
        card: { name: 'card', value: tokens.colors.card },
        blue: { name: 'blue', value: tokens.colors.blue },
      },
    },

    initialGlobals: {
      backgrounds: { value: 'paper' },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
