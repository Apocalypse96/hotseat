import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Use edges to exclude top since Stack header handles it
const SAFE_AREA_EDGES: ('bottom' | 'left' | 'right')[] = ['bottom', 'left', 'right'];
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, HotSeatColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Category, Player, Round } from '@/types/game';
import { api } from '@/services/api';

interface GameDetails {
  game: {
    id: string;
    category: Category;
    totalRounds: number;
    status: string;
    winner: string;
    players: Player[];
    createdAt: string;
  };
  rounds: Round[];
}

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();

  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadows = Shadows[isDark ? 'dark' : 'light'];

  useEffect(() => {
    loadGameDetails();
  }, [id]);

  const loadGameDetails = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getGameDetails(id);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load game details');
      }

      setGameDetails(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load game details';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: Category): string => {
    return HotSeatColors.categories[category] || HotSeatColors.primary;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getPointsColor = (points: number): string => {
    switch (points) {
      case 3:
        return HotSeatColors.amazing;
      case 2:
        return HotSeatColors.good;
      case 1:
        return HotSeatColors.ok;
      default:
        return colors.textSecondary;
    }
  };

  const getPointsEmoji = (points: number): string => {
    switch (points) {
      case 3:
        return '\uD83D\uDD25';
      case 2:
        return '\uD83D\uDE0A';
      case 1:
        return '\uD83D\uDE42';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={SAFE_AREA_EDGES} style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={HotSeatColors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading game details...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !gameDetails) {
    return (
      <SafeAreaView edges={SAFE_AREA_EDGES} style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Unable to Load
        </Text>
        <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
          {error || 'Game not found'}
        </Text>
      </SafeAreaView>
    );
  }

  const { game, rounds } = gameDetails;
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

  return (
    <SafeAreaView edges={SAFE_AREA_EDGES} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Game Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(game.category) },
            ]}
          >
            <Text style={styles.categoryText}>{game.category}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(game.createdAt)}
          </Text>
        </View>

        {/* Winner Section */}
        <View style={[styles.winnerCard, { backgroundColor: colors.card }, shadows.medium]}>
          <Ionicons name="trophy" size={40} color={HotSeatColors.gold} />
          <Text style={[styles.winnerLabel, { color: colors.textSecondary }]}>
            Winner
          </Text>
          <Text style={[styles.winnerName, { color: HotSeatColors.gold }]}>
            {game.winner}
          </Text>
        </View>

        {/* Final Scores */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Final Scores
          </Text>

          {sortedPlayers.map((player, index) => (
            <View
              key={player._id}
              style={[
                styles.playerRow,
                { backgroundColor: colors.card, borderColor: colors.border },
                shadows.small,
              ]}
            >
              <View style={styles.rankBadge}>
                <Text style={[styles.rankText, { color: getMedalColor(index) }]}>
                  #{index + 1}
                </Text>
              </View>
              <Text
                style={[styles.playerName, { color: colors.text }]}
                numberOfLines={1}
              >
                {player.name}
              </Text>
              <Text style={[styles.playerScore, { color: getMedalColor(index) }]}>
                {player.score} pts
              </Text>
            </View>
          ))}
        </View>

        {/* Round History */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Round History
          </Text>

          {rounds.map((round) => (
            <View
              key={round._id}
              style={[
                styles.roundCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                shadows.small,
              ]}
            >
              <View style={styles.roundHeader}>
                <Text style={[styles.roundNumber, { color: colors.textSecondary }]}>
                  Round {round.roundNumber}
                </Text>
                <View style={styles.roundPoints}>
                  <Text style={styles.pointsEmoji}>{getPointsEmoji(round.points)}</Text>
                  <Text style={[styles.pointsText, { color: getPointsColor(round.points) }]}>
                    +{round.points}
                  </Text>
                </View>
              </View>

              <View style={styles.roundPlayer}>
                <Ionicons name="flame" size={16} color={HotSeatColors.primary} />
                <Text style={[styles.roundPlayerName, { color: HotSeatColors.primary }]}>
                  {round.playerName}
                </Text>
              </View>

              <Text style={[styles.roundQuestion, { color: colors.text }]}>
                "{round.questionText}"
              </Text>
            </View>
          ))}
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
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: Spacing.lg,
  },
  errorSubtitle: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  categoryBadge: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
  },
  winnerCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  winnerLabel: {
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  winnerName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  section: {
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
  rankBadge: {
    width: 40,
    marginRight: Spacing.sm,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  playerScore: {
    fontSize: 16,
    fontWeight: '600',
  },
  roundCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  roundNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  roundPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pointsEmoji: {
    fontSize: 16,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  roundPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  roundPlayerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  roundQuestion: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
