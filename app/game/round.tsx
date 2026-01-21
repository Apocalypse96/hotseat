import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Use edges to exclude top since Stack header handles it
const SAFE_AREA_EDGES: ('bottom' | 'left' | 'right')[] = ['bottom', 'left', 'right'];
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, HotSeatColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { RATING_OPTIONS, RoundData } from '@/types/game';
import { api } from '@/services/api';

export default function RoundScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { state, setRound, setGame, setLoading, setError, resetGame } = useGame();

  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [isLoadingRound, setIsLoadingRound] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardScale] = useState(new Animated.Value(0.9));
  const [cardOpacity] = useState(new Animated.Value(0));

  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadows = Shadows[isDark ? 'dark' : 'light'];

  const { currentGame } = state;

  useEffect(() => {
    if (!currentGame) {
      // No game in progress, go back to home
      router.replace('/');
      return;
    }

    loadNextRound();
  }, []);

  const animateCardIn = () => {
    cardScale.setValue(0.9);
    cardOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadNextRound = async () => {
    if (!currentGame) return;

    setIsLoadingRound(true);

    try {
      const response = await api.getNextRound(currentGame._id);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load next round');
      }

      setRoundData(response.data);
      setRound(response.data);
      animateCardIn();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load round';
      Alert.alert('Error', message, [
        { text: 'Go Home', onPress: () => router.replace('/') },
      ]);
      setError(message);
    } finally {
      setIsLoadingRound(false);
    }
  };

  const handleRating = async (points: 1 | 2 | 3) => {
    if (!currentGame || !roundData || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await api.submitRound(currentGame._id, {
        playerId: roundData.hotSeatPlayer.id,
        questionId: roundData.question.id,
        points,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to submit round');
      }

      // Update game state with new data
      setGame(response.data.game);

      // Check if game is completed
      if (response.data.game.status === 'completed') {
        router.replace('/game/scoreboard');
      } else {
        // Load next round
        await loadNextRound();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit rating';
      Alert.alert('Error', message);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingColor = (type: string): string => {
    switch (type) {
      case 'amazing':
        return HotSeatColors.amazing;
      case 'good':
        return HotSeatColors.good;
      case 'ok':
        return HotSeatColors.ok;
      default:
        return HotSeatColors.primary;
    }
  };

  const handleExitGame = () => {
    Alert.alert(
      'Exit Game?',
      'Are you sure you want to quit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            resetGame();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (isLoadingRound || !roundData) {
    return (
      <SafeAreaView edges={SAFE_AREA_EDGES} style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={HotSeatColors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Preparing the hot seat...
        </Text>
      </SafeAreaView>
    );
  }

  const progress = roundData.roundNumber / roundData.totalRounds;

  return (
    <SafeAreaView edges={SAFE_AREA_EDGES} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Progress Section with Exit Button */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.progressHeaderSpacer} />
            <Text style={[styles.roundText, { color: colors.text }]}>
              Round {roundData.roundNumber} of {roundData.totalRounds}
            </Text>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={handleExitGame}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: HotSeatColors.primary },
              ]}
            />
          </View>
        </View>

        {/* Hot Seat Player */}
        <View style={styles.hotSeatSection}>
          <Ionicons name="flame" size={32} color={HotSeatColors.primary} />
          <Text style={[styles.hotSeatLabel, { color: colors.textSecondary }]}>
            Hot Seat
          </Text>
          <Text style={[styles.hotSeatName, { color: HotSeatColors.primary }]}>
            {roundData.hotSeatPlayer.name}
          </Text>
        </View>

        {/* Question Card */}
        <Animated.View
          style={[
            styles.questionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            shadows.large,
            {
              transform: [{ scale: cardScale }],
              opacity: cardOpacity,
            },
          ]}
        >
          <Text style={[styles.questionText, { color: colors.text }]}>
            {roundData.question.text}
          </Text>
        </Animated.View>

        {/* Rating Instructions */}
        <Text style={[styles.ratingInstruction, { color: colors.textSecondary }]}>
          After {roundData.hotSeatPlayer.name} answers, rate their response:
        </Text>

        {/* Rating Buttons */}
        <View style={styles.ratingContainer}>
          {RATING_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.ratingButton,
                { backgroundColor: getRatingColor(option.type) },
                shadows.medium,
                isSubmitting && styles.ratingButtonDisabled,
              ]}
              onPress={() => handleRating(option.points)}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.ratingEmoji}>{option.emoji}</Text>
                  <Text style={styles.ratingLabel}>{option.label}</Text>
                  <Text style={styles.ratingPoints}>+{option.points}</Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Scores Preview */}
        <View style={styles.scoresPreview}>
          <Text style={[styles.scoresTitle, { color: colors.textSecondary }]}>
            Current Scores
          </Text>
          <View style={styles.scoresRow}>
            {roundData.players
              .slice()
              .sort((a, b) => b.score - a.score)
              .slice(0, 4)
              .map((player, index) => (
                <View key={player._id} style={styles.scoreItem}>
                  <Text
                    style={[
                      styles.scoreName,
                      { color: colors.text },
                      player._id === roundData.hotSeatPlayer.id && styles.scoreNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {player.name}
                  </Text>
                  <Text style={[styles.scoreValue, { color: HotSeatColors.primary }]}>
                    {player.score}
                  </Text>
                </View>
              ))}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  progressSection: {
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressHeaderSpacer: {
    width: 24,
  },
  exitButton: {
    padding: Spacing.xs,
  },
  roundText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  hotSeatSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  hotSeatLabel: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  hotSeatName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  questionCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 32,
  },
  ratingInstruction: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  ratingButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    minHeight: 80,
    justifyContent: 'center',
  },
  ratingButtonDisabled: {
    opacity: 0.7,
  },
  ratingEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  ratingLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  ratingPoints: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  scoresPreview: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  scoresTitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreName: {
    fontSize: 12,
    fontWeight: '500',
  },
  scoreNameActive: {
    color: HotSeatColors.primary,
    fontWeight: '700',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
