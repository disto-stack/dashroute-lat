import { useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';


export function useRadarPulse() {
  const pulse = useSharedValue(1);
  pulse.value = withRepeat(withSequence(withTiming(0.55, { duration: 900 }), withTiming(1, { duration: 900 })), -1, true);
  return pulse;
}
