/**
 * Navigation Types
 * Type-safe navigation parameters for all screens
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FighterId, AIDifficulty } from '@/types';

/**
 * Root stack parameter list
 * Defines all screens and their expected parameters
 */
export type RootStackParamList = {
  MainMenu: undefined;
  FighterSelect: undefined;
  Fight: {
    player1FighterId: FighterId;
    player2FighterId: FighterId;
    vsAI: boolean;
    aiDifficulty: AIDifficulty;
  };
};

/**
 * Screen props types for each screen
 */
export type MainMenuScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MainMenu'
>;

export type FighterSelectScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'FighterSelect'
>;

export type FightScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Fight'
>;

/**
 * Navigation prop type for use with useNavigation hook
 */
export type { NavigationProp } from '@react-navigation/native';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
