import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { DriverMap } from './DriverMap';

const mockEaseTo = jest.fn();

jest.mock('./LocationPuck', () => ({
  LocationPuck: () => null,
}));

jest.mock('@maplibre/maplibre-react-native', () => {
  const { View } = require('react-native');
  const React = require('react');

  return {
    Map: ({ children, ...props }: any) => <View testID="map" {...props}>{children}</View>,
    Camera: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({ easeTo: mockEaseTo }));
      return <View testID="camera" {...props} />;
    }),
    Marker: ({ children, ...props }: any) => <View testID="marker" {...props}>{children}</View>,
  };
});

beforeEach(() => {
  mockEaseTo.mockClear();
});

test('renders no marker while there is no location fix yet', async () => {
  await render(<DriverMap coords={null} />);
  expect(screen.queryByTestId('marker')).toBeNull();
});

test('renders exactly one marker at the driver coordinates once available', async () => {
  await render(<DriverMap coords={{ latitude: 4.71, longitude: -74.07 }} />);
  const marker = screen.getByTestId('marker');
  expect(marker.props.id).toBe('driver-location');
  expect(marker.props.lngLat).toEqual([-74.07, 4.71]);
});

test('shows a recenter button once the user pans away, and re-centers on press', async () => {
  await render(<DriverMap coords={{ latitude: 4.71, longitude: -74.07 }} />);

  expect(screen.queryByLabelText('Volver a centrar el mapa en mi ubicación')).toBeNull();

  await fireEvent(screen.getByTestId('map'), 'regionIsChanging', {
    nativeEvent: { userInteraction: true },
  });

  const recenterButton = await screen.findByLabelText('Volver a centrar el mapa en mi ubicación');
  fireEvent.press(recenterButton);

  expect(mockEaseTo).toHaveBeenCalledWith(
    expect.objectContaining({ center: [-74.07, 4.71] })
  );
});
