import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  User,
  Wallet,
  UserCheck,
  UserPlus,
  Users,
  LogOut,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useAuction } from '@/contexts/AuctionContext';

export default function ManagerDashboard() {
  const router = useRouter();
  const { managers, players, session, logout } = useAuction();

  const manager = session?.role === 'manager'
    ? managers.find((item) => item.id === session.managerId)
    : null;

  if (!manager) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.center}>
          <Text style={styles.errorTitle}>Manager not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              logout();
              router.replace('/');
            }}
          >
            <Text style={styles.backButtonText}>Return to Login</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const playersRemaining = players.filter(
    (player) => player.status === 'available'
  ).length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View
            style={[
              styles.managerIcon,
              { backgroundColor: manager.color + '30' },
            ]}
          >
            <User size={28} color={manager.color} />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.welcome}>Welcome</Text>
            <Text style={styles.managerName}>{manager.name}</Text>
            <Text style={styles.teamName}>
              {manager.teamName || manager.name}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace('/');
            }}
          >
            <LogOut size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* YOUR BUDGET */}
          <View style={styles.budgetCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Wallet size={24} color={Colors.money} />
              </View>

              <View>
                <Text style={styles.cardLabel}>REMAINING BUDGET</Text>
                <Text style={styles.budgetAmount}>${manager.budget}</Text>
              </View>
            </View>

            <View style={styles.budgetBarBackground}>
              <View
                style={[
                  styles.budgetBar,
                  {
                    width: `${
                      manager.initialBudget > 0
                        ? Math.max(
                            0,
                            Math.min(
                              100,
                              (manager.budget / manager.initialBudget) * 100
                            )
                          )
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.budgetSubtext}>
              Started with ${manager.initialBudget}
            </Text>
          </View>

          {/* YOUR QUICK STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <UserCheck size={24} color={Colors.gold} />
              <Text style={styles.statNumber}>{manager.players.length}</Text>
              <Text style={styles.statLabel}>Players Bought</Text>
            </View>

            <View style={styles.statCard}>
              <UserPlus size={24} color={Colors.gold} />
              <Text style={styles.statNumber}>{playersRemaining}</Text>
              <Text style={styles.statLabel}>Players To Be Bought</Text>
            </View>
          </View>

          {/* YOUR PLAYERS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Players</Text>

            {manager.players.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No players purchased yet</Text>
                <Text style={styles.emptyText}>
                  Your purchased players will appear here.
                </Text>
              </View>
            ) : (
              manager.players.map((player, index) => (
                <View
                  key={`${player.id}-${index}`}
                  style={styles.playerCard}
                >
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerRole}>{player.role}</Text>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>BOUGHT FOR</Text>
                    <Text style={styles.price}>${player.soldPrice ?? 0}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* ALL TEAMS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>All Teams</Text>
                <Text style={styles.sectionSubtitle}>
                  Live budgets and squad progress for every team
                </Text>
              </View>
              <Users size={24} color={Colors.gold} />
            </View>

            {managers.map((team) => {
              const isCurrentTeam = team.id === manager.id;

              return (
                <View
                  key={team.id}
                  style={[
                    styles.teamCard,
                    isCurrentTeam && styles.teamCardCurrent,
                  ]}
                >
                  <View style={styles.teamHeader}>
                    <View
                      style={[
                        styles.teamIcon,
                        { backgroundColor: team.color + '30' },
                      ]}
                    >
                      <User size={22} color={team.color} />
                    </View>

                    <View style={styles.teamInfo}>
                      <Text style={styles.teamTitle}>
                        {team.teamName || team.name}
                      </Text>
                      <Text style={styles.teamManagerName}>
                        {team.name}
                        {isCurrentTeam ? ' • You' : ''}
                      </Text>
                    </View>

                    <View style={styles.teamBudget}>
                      <Text style={styles.teamBudgetLabel}>BUDGET</Text>
                      <Text style={styles.teamBudgetValue}>
                        ${team.budget}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.teamStatsRow}>
                    <View style={styles.teamStat}>
                      <View style={styles.teamStatIcon}>
                        <UserCheck size={18} color={Colors.money} />
                      </View>
                      <View>
                        <Text style={styles.teamStatValue}>
                          {team.players.length}
                        </Text>
                        <Text style={styles.teamStatLabel}>Bought</Text>
                      </View>
                    </View>

                    <View style={styles.teamStat}>
                      <View style={styles.teamStatIcon}>
                        <UserPlus size={18} color={Colors.gold} />
                      </View>
                      <View>
                        <Text style={styles.teamStatValue}>
                          {playersRemaining}
                        </Text>
                        <Text style={styles.teamStatLabel}>To Be Bought</Text>
                      </View>
                    </View>
                  </View>

                  {team.players.length > 0 && (
                    <View style={styles.teamRoster}>
                      <Text style={styles.rosterLabel}>BOUGHT PLAYERS</Text>
                      <Text style={styles.rosterNames} numberOfLines={3}>
                        {team.players.map((player) => player.name).join('  •  ')}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <Text style={styles.privateNotice}>
            Other managers can see this shared team overview, while manager PINs remain private.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  safeArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
  },
  backButtonText: {
    color: Colors.primary,
    fontWeight: '800' as const,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  managerIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerInfo: {
    flex: 1,
  },
  welcome: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  managerName: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800' as const,
    marginTop: 2,
  },
  teamName: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    padding: 24,
    paddingBottom: 50,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  budgetCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.money + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  budgetAmount: {
    color: Colors.money,
    fontSize: 32,
    fontWeight: '900' as const,
    marginTop: 2,
  },
  budgetBarBackground: {
    height: 8,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    marginTop: 20,
    overflow: 'hidden',
  },
  budgetBar: {
    height: '100%',
    backgroundColor: Colors.money,
    borderRadius: 4,
  },
  budgetSubtext: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '900' as const,
    marginTop: 8,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
    textAlign: 'center',
  },
  section: {
    marginTop: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  playerRole: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
  },
  price: {
    color: Colors.money,
    fontSize: 18,
    fontWeight: '800' as const,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },
  teamCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teamCardCurrent: {
    borderColor: Colors.gold + '70',
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800' as const,
  },
  teamManagerName: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  teamBudget: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  teamBudgetLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800' as const,
  },
  teamBudgetValue: {
    color: Colors.money,
    fontSize: 19,
    fontWeight: '900' as const,
    marginTop: 2,
  },
  teamStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  teamStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 11,
  },
  teamStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  teamStatValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900' as const,
  },
  teamStatLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  teamRoster: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rosterLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800' as const,
    marginBottom: 5,
  },
  rosterNames: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  privateNotice: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 28,
  },
});
