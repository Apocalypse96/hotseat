import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Use edges to exclude top since Stack header handles it
const SAFE_AREA_EDGES: ('bottom' | 'left' | 'right')[] = ['bottom', 'left', 'right'];
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, HotSeatColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { Player } from '@/types/game';

export default function ScoreboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { state, resetGame, resetSetup } = useGame();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [playerAnims] = useState<Animated.Value[]>([]);

  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadows = Shadows[isDark ? 'dark' : 'light'];

  const { currentGame } = state;

  // Sort players by score
  const sortedPlayers: Player[] = currentGame
    ? [...currentGame.players].sort((a, b) => b.score - a.score)
    : [];

  // Initialize animation values for each player
  useEffect(() => {
    if (sortedPlayers.length > 0 && playerAnims.length === 0) {
      sortedPlayers.forEach(() => {
        playerAnims.push(new Animated.Value(0));
      });
    }
  }, [sortedPlayers.length]);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Stagger player animations
    if (playerAnims.length > 0) {
      const staggerAnimations = playerAnims.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: 500 + index * 100,
          useNativeDriver: true,
        })
      );

      Animated.stagger(100, staggerAnimations).start();
    }
  }, [playerAnims.length]);

  if (!currentGame) {
    return (
      <SafeAreaView edges={SAFE_AREA_EDGES} style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          No game data found
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: HotSeatColors.primary }]}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const winner = sortedPlayers[0];
  const maxScore = winner?.score || 0;

  const handlePlayAgain = () => {
    resetGame();
    router.replace('/setup');
  };

  const handleGoHome = () => {
    resetSetup();
    router.replace('/');
  };

  const getMedalColor = (index: number): string => {
    switch (index) {
      case 0:
        return HotSeatColors.gold;
      case 1:
        return HotSeatColors.silver;
      case 2:
        return HotSeatColors.bronze;
      default:
        return colors.textSecondary;
    }
  };

  const getMedalIcon = (index: number): string => {
    switch (index) {
      case 0:
        return 'trophy';
      case 1:
        return 'medal';
      case 2:
        return 'ribbon';
      default:
        return 'person';
    }
  };

  return (
    <SafeAreaView edges={SAFE_AREA_EDGES} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Winner Section */}
        <Animated.View
          style={[
            styles.winnerSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.trophyCircle, { backgroundColor: HotSeatColors.gold }]}>
            <Ionicons name="trophy" size={60} color="#FFFFFF" />
          </View>
          <Text style={[styles.mvpLabel, { color: colors.textSecondary }]}>
            MVP Talker
          </Text>
          <Text style={[styles.winnerName, { color: HotSeatColors.gold }]}>
            {winner?.name || 'Winner'}
          </Text>
          <Text style={[styles.winnerScore, { color: colors.text }]}>
            {winner?.score || 0} points
          </Text>
        </Animated.View>

        {/* Scoreboard */}
        <View style={styles.scoreboardSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Final Scores
          </Text>

          {sortedPlayers.map((player, index) => {
            const scorePercentage = maxScore > 0 ? (player.score / maxScore) * 100 : 0;
            const animValue = playerAnims[index] || new Animated.Value(1);

            return (
              <Animated.View
                key={player._id}
                style={[
                  styles.playerRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  shadows.small,
                  index === 0 && styles.winnerRow,
                  {
                    opacity: animValue,
                    transform: [
                      {
                        translateX: animValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {/* Rank */}
                <View style={styles.rankContainer}>
                  <Ionicons
                    name={getMedalIcon(index) as any}
                    size={24}
                    color={getMedalColor(index)}
                  />
                  <Text style={[styles.rankText, { color: getMedalColor(index) }]}>
                    #{index + 1}
                  </Text>
                </View>

                {/* Player Info */}
                <View style={styles.playerInfo}>
                  <Text
                    style={[
                      styles.playerName,
                      { color: colors.text },
                      index === 0 && styles.winnerPlayerName,
                    ]}
                    numberOfLines={1}
                  >
                    {player.name}
                  </Text>

                  {/* Score Bar */}
                  <View style={[styles.scoreBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.scoreBarFill,
                        {
                          width: `${scorePercentage}%`,
                          backgroundColor: getMedalColor(index),
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Score */}
                <Text
                  style={[
                    styles.playerScore,
                    { color: getMedalColor(index) },
                  ]}
                >
                  {player.score}
                </Text>
              </Animated.View>
            );
          })}
        </View>

        {/* Game Info */}
        <View style={[styles.gameInfo, { borderColor: colors.border }]}>
          <View style={styles.gameInfoItem}>
            <Ionicons name="albums" size={16} color={colors.textSecondary} />
            <Text style={[styles.gameInfoText, { color: colors.textSecondary }]}>
              {currentGame.category}
            </Text>
          </View>
          <View style={styles.gameInfoItem}>
            <Ionicons name="refresh" size={16} color={colors.textSecondary} />
            <Text style={[styles.gameInfoText, { color: colors.textSecondary }]}>
              {currentGame.totalRounds} rounds
            </Text>
          </View>
          <View style={styles.gameInfoItem}>
            <Ionicons name="people" size={16} color={colors.textSecondary} />
            <Text style={[styles.gameInfoText, { color: colors.textSecondary }]}>
              {currentGame.players.length} players
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, shadows.medium]}
            onPress={handlePlayAgain}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { borderColor: colors.border, backgroundColor: colors.card },
              shadows.small,
            ]}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Ionicons name="home" size={24} color={HotSeatColors.primary} />
            <Text style={[styles.secondaryButtonText, { color: HotSeatColors.primary }]}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  errorText: {
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  winnerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  trophyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mvpLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  winnerName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  winnerScore: {
    fontSize: 18,
    marginTop: Spacing.xs,
  },
  scoreboardSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  winnerRow: {
    borderColor: HotSeatColors.gold,
    borderWidth: 2,
  },
  rankContainer: {
    alignItems: 'center',
    width: 50,
    marginRight: Spacing.sm,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  playerInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  winnerPlayerName: {
    fontWeight: '700',
    color: HotSeatColors.gold,
  },
  scoreBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  playerScore: {
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: Spacing.xl,
  },
  gameInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  gameInfoText: {
    fontSize: 14,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  button: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
});
