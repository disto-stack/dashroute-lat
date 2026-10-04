import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { tokens } from '@dashroute/ui-tokens';
import { PinLabel } from './PinLabel';
import { useRadarPulse } from './useRadarPulse';

const AnimatedG = Animated.createAnimatedComponent(G);

export type LocationPuckMode = 'searching' | 'tracking' | 'inactive';

const RING_SETS: Record<LocationPuckMode, Array<[radius: number, opacity: number]>> = {
  searching: [
    [44, 0.08],
    [32, 0.13],
    [20, 0.22],
  ],
  tracking: [[20, 0.18]],
  // Out of service: nothing is being searched for, so no rings and no pulse.
  inactive: [],
};

type LocationPuckProps = {
  mode?: LocationPuckMode;
  label?: string;
};

export function LocationPuck({ mode = 'searching', label }: LocationPuckProps) {
  const pulse = useRadarPulse();
  const animatedProps = useAnimatedProps(() => ({ opacity: pulse.value }));
  const rings = RING_SETS[mode];
  const dotColor = mode === 'inactive' ? tokens.colors.muted : tokens.colors.blue;

  return (
    <View testID="location-puck" style={{ width: 64, height: 64 }}>
      {mode === 'tracking' && label ? <PinLabel>{label}</PinLabel> : null}
      <Svg width={64} height={64} viewBox="0 0 96 96">
        {rings.length > 0 ? (
          <AnimatedG animatedProps={animatedProps}>
            {rings.map(([r, opacity], i) => (
              <Circle key={i} testID="puck-ring" cx={48} cy={48} r={r} fill={tokens.colors.blue} fillOpacity={opacity} />
            ))}
          </AnimatedG>
        ) : null}
        <Circle testID="puck-dot" cx={48} cy={48} r={9} fill={dotColor} stroke={tokens.colors.card} strokeWidth={5} />
      </Svg>
    </View>
  );
}
