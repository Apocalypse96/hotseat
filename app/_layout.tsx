import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GameProvider } from '@/context/GameContext';
import { HotSeatColors } from '@/constants/theme';

// Customize themes with HotSeat colors
const HotSeatLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: HotSeatColors.primary,
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#11181C',
    border: '#E0E0E0',
  },
};

const HotSeatDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: HotSeatColors.primary,
    background: '#151718',
    card: '#1E2022',
    text: '#ECEDEE',
    border: '#2C2F33',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GameProvider>
      <ThemeProvider value={colorScheme === 'dark' ? HotSeatDarkTheme : HotSeatLightTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: HotSeatColors.primary,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="setup"
            options={{
              title: 'Game Setup',
              headerBackTitle: 'Home',
            }}
          />
          <Stack.Screen
            name="game/round"
            options={{
              title: 'Hot Seat',
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="game/scoreboard"
            options={{
              title: 'Final Scores',
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="history/index"
            options={{
              title: 'Past Games',
              headerBackTitle: 'Home',
            }}
          />
          <Stack.Screen
            name="history/[id]"
            options={{
              title: 'Game Details',
              headerBackTitle: 'History',
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GameProvider>
  );
}
