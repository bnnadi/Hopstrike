/**
 * App Navigator
 * Main navigation container for Hopstrike
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import {
  MainMenuScreen,
  FighterSelectScreen,
  FightScreen,
} from '@/screens';
import { COLORS } from '@/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
          gestureEnabled: false, // Disable swipe back during gameplay
        }}
      >
        <Stack.Screen
          name="MainMenu"
          component={MainMenuScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="FighterSelect"
          component={FighterSelectScreen}
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="Fight"
          component={FightScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false, // Can't swipe back during fight
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
