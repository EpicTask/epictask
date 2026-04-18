import * as React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../ThemedText';

// Mock useColorScheme to prevent async state updates during tests
jest.mock('../../hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

describe('ThemedText', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<ThemedText>Snapshot test!</ThemedText>);
    expect(toJSON()).toMatchSnapshot();
  });
});
