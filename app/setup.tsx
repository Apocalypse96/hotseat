import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, HotSeatColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { CATEGORIES, ROUND_OPTIONS, Category } from '@/types/game';
import { api } from '@/services/api';

export default function SetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const {
    state,
    setCategory,
    setRounds,
    addPlayer,
    removePlayer,
    updatePlayer,
    setGame,
    setLoading,
    setError,
  } = useGame();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadows = Shadows[isDark ? 'dark' : 'light'];

  const { setupData } = state;

  const handleCategorySelect = (category: Category) => {
    setCategory(category);
  };

  const handleRoundsSelect = (rounds: number) => {
    setRounds(rounds);
  };

  const handleAddPlayer = () => {
    if (setupData.players.length < 8) {
      addPlayer();
    }
  };

  const handleRemovePlayer = (index: number) => {
    if (setupData.players.length > 2) {
      removePlayer(index);
    }
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    updatePlayer(index, name);
  };

  const validateSetup = (): boolean => {
    // Check if all players have names
    const validPlayers = setupData.players.filter((name) => name.trim().length > 0);

    if (validPlayers.length < 2) {
      Alert.alert('Not Enough Players', 'Please enter at least 2 player names to start the game.');
      return false;
    }

    // Check for duplicate names
    const uniqueNames = new Set(validPlayers.map((name) => name.trim().toLowerCase()));
    if (uniqueNames.size !== validPlayers.length) {
      Alert.alert('Duplicate Names', 'Each player must have a unique name.');
      return false;
    }

    return true;
  };

  const handleBeginGame = async () => {
    if (!validateSetup()) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      // Filter out empty player names
      const validPlayers = setupData.players
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      const response = await api.createGame({
        category: setupData.category,
        totalRounds: setupData.totalRounds,
        players: validPlayers,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create game');
      }

      setGame(response.data);
      router.replace('/game/round');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start game';
      Alert.alert('Error', message + '\n\nMake sure the backend server is running.');
      setError(message);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'people':
        return 'people';
      case 'heart':
        return 'heart';
      case 'home':
        return 'home';
      case 'compass':
        return 'compass';
      case 'happy':
        return 'happy';
      default:
        return 'help';
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = setupData.category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? cat.color : colors.card,
                      borderColor: isSelected ? cat.color : colors.border,
                    },
                    shadows.small,
                  ]}
                  onPress={() => handleCategorySelect(cat.name)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={getCategoryIcon(cat.icon) as any}
                    size={20}
                    color={isSelected ? '#FFFFFF' : cat.color}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Rounds Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Number of Rounds</Text>
          <View style={styles.roundsContainer}>
            {ROUND_OPTIONS.map((rounds) => {
              const isSelected = setupData.totalRounds === rounds;
              return (
                <TouchableOpacity
                  key={rounds}
                  style={[
                    styles.roundChip,
                    {
                      backgroundColor: isSelected ? HotSeatColors.primary : colors.card,
                      borderColor: isSelected ? HotSeatColors.primary : colors.border,
                    },
                    shadows.small,
                  ]}
                  onPress={() => handleRoundsSelect(rounds)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.roundText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {rounds} Rounds
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Players Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Players ({setupData.players.filter((p) => p.trim()).length})
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              2-8 players
            </Text>
          </View>

          {setupData.players.map((player, index) => (
            <View
              key={index}
              style={[
                styles.playerRow,
                { backgroundColor: colors.card, borderColor: colors.border },
                shadows.small,
              ]}
            >
              <View style={styles.playerNumberBadge}>
                <Text style={styles.playerNumber}>{index + 1}</Text>
              </View>
              <TextInput
                style={[styles.playerInput, { color: colors.text }]}
                placeholder={`Player ${index + 1} name`}
                placeholderTextColor={colors.textSecondary}
                value={player}
                onChangeText={(text) => handlePlayerNameChange(index, text)}
                maxLength={20}
              />
              {setupData.players.length > 2 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemovePlayer(index)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {setupData.players.length < 8 && (
            <TouchableOpacity
              style={[
                styles.addPlayerButton,
                { borderColor: HotSeatColors.primary },
              ]}
              onPress={handleAddPlayer}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={24} color={HotSeatColors.primary} />
              <Text style={[styles.addPlayerText, { color: HotSeatColors.primary }]}>
                Add Player
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Begin Game Button */}
        <TouchableOpacity
          style={[
            styles.beginButton,
            shadows.medium,
            isSubmitting && styles.beginButtonDisabled,
          ]}
          onPress={handleBeginGame}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="flame" size={24} color="#FFFFFF" />
              <Text style={styles.beginButtonText}>Begin Game</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    gap: Spacing.xs,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  roundsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roundChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  roundText: {
    fontSize: 16,
    fontWeight: '600',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  playerNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: HotSeatColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  playerNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  playerInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: Spacing.xs,
  },
  addPlayerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  beginButton: {
    backgroundColor: HotSeatColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  beginButtonDisabled: {
    opacity: 0.7,
  },
  beginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
