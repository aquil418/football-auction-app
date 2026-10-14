import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { DollarSign, User, Users } from 'lucide-react-native';
import { useAuction } from '@/contexts/AuctionContext';
import Colors from '@/constants/colors';

export default function ManagersScreen() {
  const { managers, session } = useAuction();

  if (session?.role !== 'admin') {
    return (
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedTitle}>Admin Access Required</Text>
          <Text style={styles.accessDeniedText}>
            Manager budgets and all squads are private to the administrator.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Manager Dashboard</Text>
        <Text style={styles.pageSubtitle}>View all budgets and purchased players</Text>

        {managers.map((manager) => (
          <View key={manager.id} style={styles.managerCard}>
            <View style={styles.managerHeader}>
              <View style={[styles.avatar, { backgroundColor: manager.color }]}>
                <Text style={styles.avatarText}>{manager.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.managerInfo}>
                <Text style={styles.managerName}>{manager.name}</Text>
                <Text style={styles.teamName}>{manager.teamName || manager.name}</Text>
                <View style={styles.budgetRow}>
                  <DollarSign size={16} color={Colors.money} />
                  <Text style={styles.budgetText}>{manager.budget}</Text>
                  <Text style={styles.budgetLabel}>/ {manager.initialBudget}</Text>
                </View>
              </View>
              <View style={styles.spentContainer}>
                <Text style={styles.spentLabel}>Spent</Text>
                <Text style={styles.spentAmount}>
                  ${manager.initialBudget - manager.budget}
                </Text>
              </View>
            </View>

            <View style={styles.budgetBar}>
              <View
                style={[
                  styles.budgetBarFill,
                  {
                    width: `${(manager.budget / manager.initialBudget) * 100}%`,
                    backgroundColor: manager.color,
                  },
                ]}
              />
            </View>

            <View style={styles.playersSection}>
              <View style={styles.playersSectionHeader}>
                <Users size={16} color={Colors.textSecondary} />
                <Text style={styles.playersSectionTitle}>
                  Squad ({manager.players.length} players)
                </Text>
              </View>

              {manager.players.length === 0 ? (
                <View style={styles.emptyPlayers}>
                  <Text style={styles.emptyPlayersText}>No players purchased yet</Text>
                </View>
              ) : (
                <View style={styles.playersList}>
                  {manager.players.map((player) => (
                    <View key={player.id} style={styles.playerItem}>
                      {player.photo ? (
                        <Image source={{ uri: player.photo }} style={styles.playerPhoto} contentFit="contain" />
                      ) : (
                        <View style={styles.playerPhotoPlaceholder}>
                          <User size={20} color={Colors.textMuted} />
                        </View>
                      )}
                      <View style={styles.playerDetails}>
                        <Text style={styles.playerName}>{player.name}</Text>
                        <Text style={styles.playerRole}>{player.role}</Text>
                      </View>
                      <View style={styles.playerPrice}>
                        <Text style={styles.playerPriceText}>${player.soldPrice}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        {managers.length === 0 && (
          <View style={styles.emptyState}>
            <Users size={64} color={Colors.textMuted} />
            <Text style={styles.emptyStateTitle}>No Managers</Text>
            <Text style={styles.emptyStateText}>Set up managers from the home screen</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  accessDeniedTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 8,
  },
  accessDeniedText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  managerCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  managerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  managerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  managerName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },

  teamName: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '600' as const,
    marginTop: 2,
    marginBottom: 2,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  budgetText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.money,
    marginLeft: 4,
  },
  budgetLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  spentContainer: {
    alignItems: 'flex-end',
  },
  spentLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  spentAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  budgetBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  budgetBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  playersSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  playersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playersSectionTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  emptyPlayers: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyPlayersText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  playersList: {
    gap: 8,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 12,
  },
  playerPhoto: {
    width: 44,
    aspectRatio: 1011 / 1536,
    borderRadius: 7,
  },
  playerPhotoPlaceholder: {
    width: 44,
    aspectRatio: 1011 / 1536,
    borderRadius: 7,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  playerRole: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  playerPrice: {
    backgroundColor: Colors.money + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  playerPriceText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.money,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  },
});
