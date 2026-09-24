import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { View } from 'react-native';
import Svg, { Circle, G, Rect } from 'react-native-svg';
import { tokens } from '@dashroute/ui-tokens';
import { PinLabel } from './PinLabel';
import { useRadarPulse } from './useRadarPulse';

const AnimatedG = Animated.createAnimatedComponent(G);

type DestinationPinProps = {
  type?: 'pickup' | 'delivery';
  arrived?: boolean;
  label?: string;
};

export function DestinationPin({ type = 'pickup', arrived = false, label }: DestinationPinProps) {
  const pulse = useRadarPulse();
  const animatedProps = useAnimatedProps(() => ({ opacity: pulse.value }));

  return (
    <View testID="destination-pin" style={{ width: 64, height: 64 }}>
      {!arrived && label ? <PinLabel>{label}</PinLabel> : null}
      <Svg width={64} height={64} viewBox="0 0 96 96">
        {arrived && (
          <AnimatedG animatedProps={animatedProps}>
            <Circle cx={48} cy={48} r={44} fill={tokens.colors.blue} fillOpacity={0.1} />
            <Circle cx={48} cy={48} r={30} fill={tokens.colors.blue} fillOpacity={0.16} />
          </AnimatedG>
        )}
        {type === 'delivery' ? (
          <>
            <Circle cx={48} cy={48} r={17} fill={tokens.colors.blue} stroke={tokens.colors.card} strokeWidth={4} />
            <Rect x={41} y={41} width={14} height={14} rx={3} fill={tokens.colors.card} />
          </>
        ) : (
          <>
            <Circle cx={48} cy={48} r={16} fill={tokens.colors.ink} />
            <Circle cx={48} cy={48} r={6} fill={tokens.colors.card} />
          </>
        )}
      </Svg>
    </View>
  );
}
