import Animated, { useAnimatedProps, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { tokens } from '@dashroute/ui-tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 48;
const CENTER = SIZE / 2;

export function LocationDot() {
  const pulse = useSharedValue(0);

  pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }), -1, false);

  const animatedProps = useAnimatedProps(() => ({
    r: 10 + pulse.value * 14,
    opacity: 0.35 * (1 - pulse.value),
  }));

  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <AnimatedCircle cx={CENTER} cy={CENTER} fill={tokens.colors.blue} animatedProps={animatedProps} />
      <Circle cx={CENTER} cy={CENTER} r={10} fill={tokens.colors.blue} stroke="#ffffff" strokeWidth={4} />
    </Svg>
  );
}
