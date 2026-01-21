import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, HotSeatColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useGame } from '@/context/GameContext';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { resetSetup } = useGame();

  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadows = Shadows[isDark ? 'dark' : 'light'];

  const handleStartGame = () => {
    resetSetup();
    router.push('/setup');
  };

  const handlePastGames = () => {
    router.push('/history');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo/Icon Area */}
        <View style={styles.logoContainer}>
          <View style={[styles.iconCircle, { backgroundColor: HotSeatColors.primary }]}>
            <Ionicons name="flame" size={80} color="#FFFFFF" />
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>HotSeat</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          One phone. Everyone in the hot seat.
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Pass the phone around, answer prompts, and rate each other's answers.
          The best talker wins!
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, shadows.medium]}
            onPress={handleStartGame}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Start Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { borderColor: colors.border, backgroundColor: colors.card },
              shadows.small,
            ]}
            onPress={handlePastGames}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={24} color={HotSeatColors.primary} />
            <Text style={[styles.secondaryButtonText, { color: HotSeatColors.primary }]}>
              Past Games
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="people" size={20} color={HotSeatColors.categories.Friends} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              2-8 Players
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="albums" size={20} color={HotSeatColors.categories.Deep} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              5 Categories
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="trophy" size={20} color={HotSeatColors.gold} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Score & Win
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 16,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  primaryButton: {
    backgroundColor: HotSeatColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  featureText: {
    fontSize: 14,
  },
});
