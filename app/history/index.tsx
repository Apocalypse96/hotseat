import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Use edges to exclude top since Stack header handles it
const SAFE_AREA_EDGES: ('bottom' | 'left' | 'right')[] = ['bottom', 'left', 'right'];
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, HotSeatColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { GameHistoryItem, Category } from '@/types/game';
import { api } from '@/services/api';

export default function HistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadows = Shadows[isDark ? 'dark' : 'light'];

  const loadGames = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await api.getGameHistory(20, 0);

      if (!response.success) {
        throw new Error(response.error || 'Failed to load games');
      }

      setGames(response.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load game history';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const onRefresh = useCallback(() => {
    loadGames(true);
  }, []);

  const getCategoryColor = (category: Category): string => {
    return HotSeatColors.categories[category] || HotSeatColors.primary;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGamePress = (gameId: string) => {
    router.push(`/history/${gameId}`);
  };

  const renderGameItem = ({ item }: { item: GameHistoryItem }) => (
    <TouchableOpacity
      style={[
        styles.gameCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        shadows.small,
      ]}
      onPress={() => handleGamePress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.gameHeader}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(item.category) },
          ]}
        >
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {formatDate(item.date)}
        </Text>
      </View>

      <View style={styles.gameInfo}>
        <View style={styles.winnerSection}>
          <Ionicons name="trophy" size={20} color={HotSeatColors.gold} />
          <Text style={[styles.winnerText, { color: colors.text }]}>
            {item.winner}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {item.playerCount} players
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="refresh" size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {item.totalRounds} rounds
            </Text>
          </View>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textSecondary}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="game-controller-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Games Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Start a game and your history will appear here
      </Text>
      <TouchableOpacity
        style={[styles.startButton, shadows.medium]}
        onPress={() => router.push('/setup')}
        activeOpacity={0.8}
      >
        <Ionicons name="play" size={20} color="#FFFFFF" />
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cloud-offline-outline" size={64} color={colors.error} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Unable to Load
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {error}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { borderColor: HotSeatColors.primary }]}
        onPress={() => loadGames()}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={20} color={HotSeatColors.primary} />
        <Text style={[styles.retryButtonText, { color: HotSeatColors.primary }]}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView edges={SAFE_AREA_EDGES} style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={HotSeatColors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading game history...
        </Text>
      </SafeAreaView>
    );
  }

  if (error && games.length === 0) {
    return (
      <SafeAreaView edges={SAFE_AREA_EDGES} style={[styles.container, { backgroundColor: colors.background }]}>
        {renderError()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={SAFE_AREA_EDGES} style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={games}
        renderItem={renderGameItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          games.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={HotSeatColors.primary}
            colors={[HotSeatColors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    padding: Spacing.lg,
  },
  emptyList: {
    flex: 1,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  gameHeader: {
    marginRight: Spacing.md,
  },
  categoryBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
  },
  gameInfo: {
    flex: 1,
  },
  winnerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  winnerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  chevron: {
    marginLeft: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  startButton: {
    backgroundColor: HotSeatColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
