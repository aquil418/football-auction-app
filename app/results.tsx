import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  Trophy,
  User,
  DollarSign,
  Users,
  TrendingUp,
  Award,
} from 'lucide-react-native';
import { useAuction } from '@/contexts/AuctionContext';
import Colors from '@/constants/colors';

export default function ResultsScreen() {
  const router = useRouter();
  const { managers, players, getSoldPlayers, getUnsoldPlayers, getAvailablePlayers, session } = useAuction();

  if (session?.role !== 'admin') {
    return (
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedTitle}>Admin Access Required</Text>
          <Text style={styles.accessDeniedText}>
            The full auction summary and manager results are available only to the administrator.
          </Text>
          <TouchableOpacity
            style={styles.accessDeniedButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.accessDeniedButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const soldPlayers = getSoldPlayers();
  const unsoldPlayers = getUnsoldPlayers();
  const availablePlayers = getAvailablePlayers();

  const totalSpent = soldPlayers.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
  const highestBid = soldPlayers.length > 0 
    ? Math.max(...soldPlayers.map(p => p.soldPrice || 0)) 
    : 0;
  const mostExpensivePlayer = soldPlayers.find(p => p.soldPrice === highestBid);

  const managerStats = managers.map(manager => ({
    ...manager,
    totalSpent: manager.initialBudget - manager.budget,
    playerCount: manager.players.length,
  })).sort((a, b) => b.playerCount - a.playerCount);

  const topBuyer = managerStats[0];

  return (
    <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Auction Results',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.text,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Trophy size={48} color={Colors.gold} />
          <Text style={styles.title}>Auction Summary</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Users size={24} color={Colors.accent} />
            <Text style={styles.statValue}>{soldPlayers.length}</Text>
            <Text style={styles.statLabel}>Sold</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={24} color={Colors.money} />
            <Text style={styles.statValue}>${totalSpent}</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color={Colors.gold} />
            <Text style={styles.statValue}>${highestBid}</Text>
            <Text style={styles.statLabel}>Highest Bid</Text>
          </View>
        </View>

        {mostExpensivePlayer && (
          <View style={styles.highlightCard}>
            <View style={styles.highlightHeader}>
              <Award size={24} color={Colors.gold} />
              <Text style={styles.highlightTitle}>Most Expensive Player</Text>
            </View>
            <View style={styles.highlightContent}>
              {mostExpensivePlayer.photo ? (
                <Image source={{ uri: mostExpensivePlayer.photo }} style={styles.highlightPhoto} />
              ) : (
                <View style={styles.highlightPhotoPlaceholder}>
                  <User size={32} color={Colors.textMuted} />
                </View>
              )}
              <View style={styles.highlightInfo}>
                <Text style={styles.highlightName}>{mostExpensivePlayer.name}</Text>
                <Text style={styles.highlightRole}>{mostExpensivePlayer.role}</Text>
              </View>
              <View style={styles.highlightPrice}>
                <Text style={styles.highlightPriceValue}>${mostExpensivePlayer.soldPrice}</Text>
              </View>
            </View>
          </View>
        )}

        {topBuyer && topBuyer.playerCount > 0 && (
          <View style={styles.highlightCard}>
            <View style={styles.highlightHeader}>
              <Trophy size={24} color={Colors.accent} />
              <Text style={styles.highlightTitle}>Top Buyer</Text>
            </View>
            <View style={styles.highlightContent}>
              <View style={[styles.topBuyerAvatar, { backgroundColor: topBuyer.color }]}>
                <Text style={styles.topBuyerAvatarText}>
                  {topBuyer.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.highlightInfo}>
                <Text style={styles.highlightName}>{topBuyer.name}</Text>
                <Text style={styles.highlightRole}>{topBuyer.playerCount} players</Text>
              </View>
              <View style={styles.highlightPrice}>
                <Text style={styles.highlightPriceValue}>${topBuyer.totalSpent}</Text>
                <Text style={styles.highlightPriceLabel}>spent</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Manager Results</Text>
        {managerStats.map((manager) => (
          <View key={manager.id} style={styles.managerResultCard}>
            <View style={styles.managerResultHeader}>
              <View style={[styles.managerAvatar, { backgroundColor: manager.color }]}>
                <Text style={styles.managerAvatarText}>
                  {manager.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.managerResultInfo}>
                <Text style={styles.managerResultName}>{manager.name}</Text>
                <Text style={styles.managerResultStats}>
                  {manager.playerCount} players • ${manager.totalSpent} spent
                </Text>
              </View>
              <View style={styles.managerResultBudget}>
                <Text style={styles.budgetRemaining}>${manager.budget}</Text>
                <Text style={styles.budgetLabel}>remaining</Text>
              </View>
            </View>

            {manager.players.length > 0 && (
              <View style={styles.managerPlayers}>
                {manager.players.map((player) => (
                  <View key={player.id} style={styles.smallPlayerCard}>
                    {player.photo ? (
                      <Image source={{ uri: player.photo }} style={styles.smallPlayerPhoto} contentFit="contain" />
                    ) : (
                      <View style={styles.smallPlayerPhotoPlaceholder}>
                        <User size={14} color={Colors.textMuted} />
                      </View>
                    )}
                    <Text style={styles.smallPlayerName} numberOfLines={1}>
                      {player.name}
                    </Text>
                    <Text style={styles.smallPlayerPrice}>${player.soldPrice}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {unsoldPlayers.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Unsold Players ({unsoldPlayers.length})</Text>
            <View style={styles.unsoldGrid}>
              {unsoldPlayers.map((player) => (
                <View key={player.id} style={styles.unsoldCard}>
                  {player.photo ? (
                    <Image source={{ uri: player.photo }} style={styles.unsoldPhoto} contentFit="contain" />
                  ) : (
                    <View style={styles.unsoldPhotoPlaceholder}>
                      <User size={20} color={Colors.textMuted} />
                    </View>
                  )}
                  <Text style={styles.unsoldName} numberOfLines={1}>{player.name}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {availablePlayers.length > 0 && (
          <View style={styles.remainingBanner}>
            <Text style={styles.remainingText}>
              {availablePlayers.length} players still available for auction
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push('/auction')}
            >
              <Text style={styles.continueButtonText}>Continue Auction</Text>
            </TouchableOpacity>
          </View>
        )}

        {soldPlayers.length === 0 && unsoldPlayers.length === 0 && (
          <View style={styles.emptyState}>
            <Trophy size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Results Yet</Text>
            <Text style={styles.emptyText}>Start the auction to see results</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push('/auction')}
            >
              <Text style={styles.startButtonText}>Start Auction</Text>
            </TouchableOpacity>
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
  accessDeniedButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  accessDeniedButtonText: {
    color: Colors.primary,
    fontWeight: '800' as const,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  highlightCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.gold,
    marginLeft: 8,
  },
  highlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  highlightPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightInfo: {
    flex: 1,
    marginLeft: 16,
  },
  highlightName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  highlightRole: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  highlightPrice: {
    alignItems: 'flex-end',
  },
  highlightPriceValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.money,
  },
  highlightPriceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  topBuyerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBuyerAvatarText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
    marginBottom: 16,
  },
  managerResultCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  managerResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  managerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  managerAvatarText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  managerResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  managerResultName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  managerResultStats: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  managerResultBudget: {
    alignItems: 'flex-end',
  },
  budgetRemaining: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.money,
  },
  budgetLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  managerPlayers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  smallPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 8,
    paddingRight: 12,
  },
  smallPlayerPhoto: {
    width: 28,
    aspectRatio: 1011 / 1536,
    borderRadius: 5,
  },
  smallPlayerPhotoPlaceholder: {
    width: 28,
    aspectRatio: 1011 / 1536,
    borderRadius: 5,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallPlayerName: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text,
    marginLeft: 8,
    maxWidth: 80,
  },
  smallPlayerPrice: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.money,
    marginLeft: 8,
  },
  unsoldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unsoldCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    opacity: 0.7,
  },
  unsoldPhoto: {
    width: 40,
    aspectRatio: 1011 / 1536,
    borderRadius: 6,
  },
  unsoldPhotoPlaceholder: {
    width: 40,
    aspectRatio: 1011 / 1536,
    borderRadius: 6,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsoldName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  remainingBanner: {
    backgroundColor: Colors.gold + '20',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  remainingText: {
    fontSize: 16,
    color: Colors.gold,
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});
