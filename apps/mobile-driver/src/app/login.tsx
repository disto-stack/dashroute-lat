import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { tokens } from '@dashroute/ui-tokens';
import { Logo } from '@dashroute/ui';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { setSession } = useAuth();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Logo variant="lockup" size={44} />

      <Text style={styles.headline}>Tu ruta{'\n'}empieza{'\n'}aquí.</Text>

      <Svg viewBox="0 0 342 90" width="100%" height={90} style={styles.routeLine} aria-hidden>
        <Path
          d="M6 72 C 60 8, 104 96, 164 46 S 262 -2, 330 40"
          stroke={tokens.colors.ink}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="1 9"
          fill="none"
        />
        <Circle cx={6} cy={72} r={6} stroke={tokens.colors.ink} strokeWidth={3} fill="none" />
        <Circle cx={330} cy={40} r={9} fill={tokens.colors.blue} />
      </Svg>

      <View style={styles.spacer} />

      <LoginForm
        onSuccess={(response) => {
          setSession(response);
          router.replace('/(app)/home');
        }}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.paper,
  },
  content: {
    flexGrow: 1,
    padding: tokens.spacing.space6,
  },
  headline: {
    marginTop: tokens.spacing.space8,
    fontFamily: tokens.type.native.displayExtraBold,
    fontSize: tokens.type.textStyles.displayHero.fontSize,
    lineHeight: tokens.type.textStyles.displayHero.fontSize * tokens.type.textStyles.displayHero.lineHeight,
    letterSpacing: tokens.type.textStyles.displayHero.fontSize * -0.025,
    color: tokens.colors.ink,
  },
  routeLine: {
    marginTop: tokens.spacing.space2,
  },
  spacer: {
    flexGrow: 1,
    minHeight: tokens.spacing.space8,
  }
});
