import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { tokens } from '@dashroute/ui-tokens';
import { LogoProps } from './Logo.types';

export const Logo = ({ variant = 'mark', tone = 'default', size = 36 }: LogoProps) => {
  const inverse = tone === 'inverse';
  const c = inverse
    ? { tile: tokens.colors.card, line: tokens.colors.blue, dash: tokens.colors.handle, dashOp: 1, hole: tokens.colors.card }
    : { tile: tokens.colors.blue, line: tokens.colors.onBlue, dash: tokens.colors.onBlue, dashOp: 0.2, hole: tokens.colors.blue };

  const mark = (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Rect width={96} height={96} rx={28} fill={c.tile} />
      <Path d="M46 66H70M56 78H70" fill="none" stroke={c.dash} strokeOpacity={c.dashOp} strokeWidth={5} strokeLinecap="round" />
      <Path
        d="M26 68V60Q26 46 40 46H56Q70 46 70 32V30"
        fill="none"
        stroke={c.line}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={26} cy={70} r={8} fill={c.hole} stroke={c.line} strokeWidth={5} />
      <Circle cx={70} cy={26} r={11} fill={inverse ? tokens.colors.blue : tokens.colors.card} />
      <Circle cx={70} cy={26} r={4.5} fill={inverse ? tokens.colors.card : tokens.colors.ink} />
    </Svg>
  );

  if (variant !== 'lockup') return mark;

  const fs = size / 1.47;
  const wordColor = inverse ? tokens.colors.onBlue : tokens.colors.ink;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: fs * 0.37 }}>
      {mark}
      <Text style={{ fontSize: fs, color: wordColor }}>
        <Text style={{ fontWeight: '600' }}>Dash</Text>
        <Text style={{ fontWeight: '800', color: inverse ? tokens.colors.onBlue : tokens.colors.blue }}>Route</Text>
      </Text>
    </View>
  );
};
