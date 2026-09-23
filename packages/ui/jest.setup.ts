import '@testing-library/react-native/matchers';
import { setProjectAnnotations } from '@storybook/react';
import * as previewAnnotations from './.storybook-native/preview';

setProjectAnnotations([previewAnnotations]);
