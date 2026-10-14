import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  Eye,
  Gavel,
  Users,
  Trophy,
  ArrowLeft,
  LogOut,
  Wallet,
  UsersRound,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuction } from '@/contexts/AuctionContext';

export default function ViewerDashboard() {
  const router = useRouter();

  const {
    players,
    managers,
    currentPlayer,
    currentBid,
    currentBidder,
    auctionStarted,
    auctionEnded,
    session,
    logout,
  } = useAuction();

  // One reusable card-reveal animation for every player.
  // 0° = front, 180° = gold back, 360° = front again.
  const cardRotation = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardGlow = useRef(new Animated.Value(0)).current;

  const playCardReveal = useCallback(() => {
    cardRotation.stopAnimation();
    cardScale.stopAnimation();
    cardGlow.stopAnimation();

    cardRotation.setValue(0);
    cardScale.setValue(1);
    cardGlow.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(cardRotation, {
          toValue: 180,
          duration: 520,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(cardRotation, {
          toValue: 360,
          duration: 520,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.timing(cardScale, {
          toValue: 1.035,
          duration: 520,
          useNativeDriver: false,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 520,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.timing(cardGlow, {
          toValue: 1,
          duration: 430,
          useNativeDriver: false,
        }),
        Animated.timing(cardGlow, {
          toValue: 0,
          duration: 610,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [cardRotation, cardScale, cardGlow]);

  useEffect(() => {
    if (currentPlayer?.id) {
      playCardReveal();
    } else {
      cardRotation.stopAnimation();
      cardRotation.setValue(0);
      cardScale.setValue(1);
      cardGlow.setValue(0);
    }
  }, [currentPlayer?.id, playCardReveal]);

  // React Native transform values need a CSS angle string for rotateY.
  // The previous build animated the numeric value directly, so the glow
  // worked but the browser ignored the 3D rotation.
  const cardRotateY = cardRotation.interpolate({
    inputRange: [0, 180, 360],
    outputRange: ['0deg', '180deg', '360deg'],
  });

  if (session?.role !== 'viewer') {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.center}>
          <Text style={styles.errorTitle}>Viewer Access Required</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.primaryButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const availablePlayers = players.filter(
    player => player.status === 'available'
  );

  const soldPlayers = players.filter(
    player => player.status === 'sold'
  );

  const unsoldPlayers = players.filter(
    player => player.status === 'unsold'
  );

  const totalPlayers = players.length;
  const completedPlayers = soldPlayers.length + unsoldPlayers.length;

  const progress =
    totalPlayers > 0
      ? Math.min(completedPlayers / totalPlayers, 1)
      : 0;

  const getManagerName = (managerId: string | null) => {
    if (!managerId) return 'Unknown Team';

    return (
      managers.find(manager => manager.id === managerId)?.name ||
      'Unknown Team'
    );
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const auctionStatus = auctionEnded
    ? 'Auction Ended'
    : !auctionStarted
      ? 'Auction yet to be started'
      : currentPlayer
        ? 'Auction Live'
        : 'Auction Live - waiting for next player';

  const statusIsLive = auctionStarted && !auctionEnded;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleLogout}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerIcon}>
            <Eye size={24} color={Colors.gold} />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.title}>Auction Viewer</Text>
            <Text style={styles.subtitle}>
              Live auction dashboard
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={19} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* STATUS */}
          <View
            style={[
              styles.statusCard,
              statusIsLive
                ? styles.statusLive
                : auctionEnded
                  ? styles.statusEnded
                  : styles.statusWaiting,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: statusIsLive
                    ? Colors.money
                    : auctionEnded
                      ? Colors.error
                      : Colors.textMuted,
                },
              ]}
            />

            <Text style={styles.statusText}>
              {auctionStatus}
            </Text>
          </View>

          {/* CURRENT PLAYER */}
          <View style={styles.currentCard}>
            <View style={styles.currentHeader}>
              <Gavel size={22} color={Colors.gold} />
              <Text style={styles.currentHeaderText}>
                CURRENT PLAYER
              </Text>
            </View>

            {currentPlayer ? (
              <View style={styles.playerBlock}>
                {currentPlayer.photo ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Play ${currentPlayer.name} card reveal animation`}
                    onPress={playCardReveal}
                    style={styles.playerCardPressable}
                  >
                    <View style={styles.playerCardScene}>
                      <Animated.View
                        style={[
                          styles.playerCardFlip,
                          {
                            transform: [
                              { perspective: 1200 },
                              { rotateY: cardRotateY },
                              { scale: cardScale },
                            ],
                          },
                        ]}
                      >
                        <View style={styles.playerCardFace}>
                          <Image
                            source={{ uri: currentPlayer.photo }}
                            style={styles.playerImage}
                            contentFit="contain"
                          />
                        </View>

                        <View
                          style={[
                            styles.playerCardFace,
                            styles.playerCardBack,
                          ]}
                        >
                          <Image
                            source={require('../assets/images/gold-card-back.png')}
                            style={styles.playerImage}
                            contentFit="contain"
                          />
                        </View>
                      </Animated.View>

                      <Animated.View
                        pointerEvents="none"
                        style={[
                          styles.playerCardGlow,
                          { opacity: cardGlow },
                        ]}
                      />
                    </View>
                  </Pressable>
                ) : (
                  <View style={styles.playerImagePlaceholder}>
                    <Users size={50} color={Colors.textMuted} />
                  </View>
                )}

                <Text style={styles.playerName}>
                  {currentPlayer.name}
                </Text>

                <Text style={styles.playerRole}>
                  {currentPlayer.role}
                </Text>

                <View style={styles.bidRow}>
                  <View>
                    <Text style={styles.bidLabel}>
                      CURRENT BID
                    </Text>

                    <Text style={styles.bidAmount}>
                      ₹{currentBid}
                    </Text>
                  </View>

                  <View style={styles.bidderBox}>
                    <Text style={styles.bidLabel}>
                      HIGHEST BIDDER
                    </Text>

                    <Text style={styles.bidderName}>
                      {currentBidder?.name || 'No bids yet'}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.waitingBox}>
                <Gavel size={40} color={Colors.textMuted} />

                <Text style={styles.waitingTitle}>
                  {auctionEnded
                    ? 'Auction has ended'
                    : auctionStarted
                      ? 'Waiting for next player'
                      : 'Auction has not started'}
                </Text>
              </View>
            )}
          </View>

          {/* SUMMARY */}
          <Text style={styles.sectionTitle}>
            Auction Progress
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Users size={22} color={Colors.gold} />

              <Text style={styles.statNumber}>
                {availablePlayers.length}
              </Text>

              <Text style={styles.statLabel}>
                Players Left
              </Text>
            </View>

            <View style={styles.statCard}>
              <Trophy size={22} color={Colors.money} />

              <Text style={styles.statNumber}>
                {soldPlayers.length}
              </Text>

              <Text style={styles.statLabel}>
                Sold
              </Text>
            </View>

            <View style={styles.statCard}>
              <Gavel size={22} color={Colors.accent} />

              <Text style={styles.statNumber}>
                {unsoldPlayers.length}
              </Text>

              <Text style={styles.statLabel}>
                Unsold
              </Text>
            </View>

            <View style={styles.statCard}>
              <Users
                size={22}
                color={Colors.textSecondary}
              />

              <Text style={styles.statNumber}>
                {totalPlayers}
              </Text>

              <Text style={styles.statLabel}>
                Total Players
              </Text>
            </View>
          </View>

          {/* PROGRESS BAR */}
          {totalPlayers > 0 && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>
                  Auction Progress
                </Text>

                <Text style={styles.progressPercentage}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress * 100}%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                {completedPlayers} of {totalPlayers} players processed
              </Text>
            </View>
          )}

          {/* TEAM STANDINGS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>
                  Teams
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Remaining balance and players bought
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {managers.length}
                </Text>
              </View>
            </View>

            {managers.length === 0 ? (
              <View style={styles.emptyListCard}>
                <UsersRound size={32} color={Colors.textMuted} />
                <Text style={styles.emptyListTitle}>
                  No teams configured
                </Text>
                <Text style={styles.emptyListText}>
                  Teams will appear here once the admin sets them up.
                </Text>
              </View>
            ) : (
              managers.map(manager => (
                <View
                  key={manager.id}
                  style={[
                    styles.teamCard,
                    { borderLeftColor: manager.color },
                  ]}
                >
                  <View style={styles.teamHeader}>
                    <View
                      style={[
                        styles.teamIcon,
                        { backgroundColor: manager.color + '20' },
                      ]}
                    >
                      <UsersRound size={22} color={manager.color} />
                    </View>

                    <View style={styles.teamTitleBlock}>
                      <Text style={styles.teamName}>
                        {manager.teamName || manager.name}
                      </Text>
                      <Text style={styles.teamManagerName}>
                        Manager: {manager.name}
                      </Text>
                    </View>

                    <View style={styles.teamBudgetBlock}>
                      <View style={styles.teamBudgetLabelRow}>
                        <Wallet size={14} color={Colors.money} />
                        <Text style={styles.teamBudgetLabel}>
                          BALANCE
                        </Text>
                      </View>
                      <Text style={styles.teamBudget}>
                        ₹{manager.budget}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.teamPlayersHeader}>
                    <Users size={16} color={Colors.gold} />
                    <Text style={styles.teamPlayersTitle}>
                      PLAYERS BOUGHT ({manager.players.length})
                    </Text>
                  </View>

                  {manager.players.length === 0 ? (
                    <Text style={styles.noTeamPlayers}>
                      No players bought yet
                    </Text>
                  ) : (
                    <View style={styles.teamPlayerList}>
                      {manager.players.map(player => (
                        <View key={player.id} style={styles.teamPlayerChip}>
                          <Text style={styles.teamPlayerChipName}>
                            {player.name}
                          </Text>
                          {player.soldPrice !== null && (
                            <Text style={styles.teamPlayerChipPrice}>
                              ₹{player.soldPrice}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>

          {/* SOLD PLAYERS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>
                  Sold Players
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Players already purchased by teams
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {soldPlayers.length}
                </Text>
              </View>
            </View>

            {soldPlayers.length === 0 ? (
              <View style={styles.emptyListCard}>
                <Trophy
                  size={32}
                  color={Colors.textMuted}
                />

                <Text style={styles.emptyListTitle}>
                  No players sold yet
                </Text>

                <Text style={styles.emptyListText}>
                  Sold players will appear here automatically.
                </Text>
              </View>
            ) : (
              soldPlayers.map(player => (
                <View
                  key={player.id}
                  style={[
                    styles.listCard,
                    styles.soldListCard,
                  ]}
                >
                  {player.photo ? (
                    <Image
                      source={{ uri: player.photo }}
                      style={styles.listPlayerImage}
                      contentFit="contain"
                    />
                  ) : (
                    <View style={styles.listPlayerPlaceholder}>
                      <Users
                        size={22}
                        color={Colors.textMuted}
                      />
                    </View>
                  )}

                  <View style={styles.listPlayerInfo}>
                    <Text style={styles.listPlayerName}>
                      {player.name}
                    </Text>

                    <Text style={styles.listPlayerRole}>
                      {player.role}
                    </Text>

                    <Text style={styles.boughtByText}>
                      Bought by{' '}
                      <Text style={styles.buyerName}>
                        {getManagerName(player.soldTo)}
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.soldPriceContainer}>
                    <Text style={styles.priceSmallLabel}>
                      SOLD FOR
                    </Text>

                    <Text style={styles.soldPrice}>
                      ₹{player.soldPrice ?? 0}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* REMAINING PLAYERS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>
                  Remaining Players
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Players still available for auction
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {availablePlayers.length}
                </Text>
              </View>
            </View>

            {availablePlayers.length === 0 ? (
              <View style={styles.emptyListCard}>
                <Users
                  size={32}
                  color={Colors.textMuted}
                />

                <Text style={styles.emptyListTitle}>
                  No players remaining
                </Text>

                <Text style={styles.emptyListText}>
                  All available players have been processed.
                </Text>
              </View>
            ) : (
              availablePlayers.map(player => (
                <View
                  key={player.id}
                  style={styles.listCard}
                >
                  {player.photo ? (
                    <Image
                      source={{ uri: player.photo }}
                      style={styles.listPlayerImage}
                      contentFit="contain"
                    />
                  ) : (
                    <View style={styles.listPlayerPlaceholder}>
                      <Users
                        size={22}
                        color={Colors.textMuted}
                      />
                    </View>
                  )}

                  <View style={styles.listPlayerInfo}>
                    <Text style={styles.listPlayerName}>
                      {player.name}
                    </Text>

                    <Text style={styles.listPlayerRole}>
                      {player.role}
                    </Text>
                  </View>

                  <View style={styles.basePriceContainer}>
                    <Text style={styles.priceSmallLabel}>
                      BASE
                    </Text>

                    <Text style={styles.basePrice}>
                      ₹{player.basePrice}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* UNSOLD PLAYERS */}
          {unsoldPlayers.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Unsold Players
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Players that received no winning bid
                  </Text>
                </View>

                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {unsoldPlayers.length}
                  </Text>
                </View>
              </View>

              {unsoldPlayers.map(player => (
                <View
                  key={player.id}
                  style={[
                    styles.listCard,
                    styles.unsoldListCard,
                  ]}
                >
                  {player.photo ? (
                    <Image
                      source={{ uri: player.photo }}
                      style={styles.listPlayerImage}
                      contentFit="contain"
                    />
                  ) : (
                    <View style={styles.listPlayerPlaceholder}>
                      <Users
                        size={22}
                        color={Colors.textMuted}
                      />
                    </View>
                  )}

                  <View style={styles.listPlayerInfo}>
                    <Text style={styles.listPlayerName}>
                      {player.name}
                    </Text>

                    <Text style={styles.listPlayerRole}>
                      {player.role}
                    </Text>
                  </View>

                  <View style={styles.unsoldBadge}>
                    <Text style={styles.unsoldBadgeText}>
                      UNSOLD
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
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

  primaryButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
  },

  primaryButtonText: {
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

  backButton: {
    padding: 6,
    marginRight: 10,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  headerInfo: {
    flex: 1,
  },

  title: {
    color: Colors.text,
    fontSize: 23,
    fontWeight: '800' as const,
  },

  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },

  logoutButton: {
    padding: 8,
  },

  content: {
    padding: 24,
    paddingBottom: 60,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },

  statusLive: {
    backgroundColor: Colors.money + '15',
    borderColor: Colors.money + '50',
  },

  statusWaiting: {
    backgroundColor: Colors.cardBg,
    borderColor: Colors.border,
  },

  statusEnded: {
    backgroundColor: Colors.error + '15',
    borderColor: Colors.error + '50',
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },

  statusText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800' as const,
  },

  currentCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  currentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  currentHeaderText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '800' as const,
  },

  playerBlock: {
    alignItems: 'center',
    marginTop: 20,
  },

  playerCardPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  playerCardScene: {
    width: 230,
    aspectRatio: 1011 / 1536,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  playerCardFlip: {
    width: '100%',
    height: '100%',
    position: 'relative',
    transformStyle: 'preserve-3d',
  },

  playerCardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },

  playerCardBack: {
    transform: [{ rotateY: '180deg' }],
  },

  playerCardGlow: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 22,
    elevation: 12,
  },

  playerImage: {
    width: '100%',
    height: '100%',
  },

  playerImagePlaceholder: {
    width: 190,
    aspectRatio: 1011 / 1536,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    borderWidth: 3,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  playerName: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: '900' as const,
    marginTop: 18,
    textAlign: 'center',
  },

  playerRole: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },

  bidRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  bidLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800' as const,
  },

  bidAmount: {
    color: Colors.money,
    fontSize: 28,
    fontWeight: '900' as const,
    marginTop: 4,
  },

  bidderBox: {
    alignItems: 'flex-end',
  },

  bidderName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
    marginTop: 5,
  },

  waitingBox: {
    alignItems: 'center',
    paddingVertical: 45,
  },

  waitingTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: 12,
    textAlign: 'center',
  },

  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800' as const,
  },

  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },

  statCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  statNumber: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '900' as const,
    marginTop: 7,
  },

  statLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },

  progressCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '800' as const,
  },

  progressPercentage: {
    color: Colors.gold,
    fontSize: 15,
    fontWeight: '900' as const,
  },

  progressTrack: {
    height: 9,
    backgroundColor: Colors.secondary,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 12,
  },

  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 5,
  },

  progressText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },

  section: {
    marginTop: 30,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 17,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadgeText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '900' as const,
  },

  teamCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
  },

  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  teamIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  teamTitleBlock: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },

  teamName: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '900' as const,
  },

  teamManagerName: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  teamBudgetBlock: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },

  teamBudgetLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  teamBudgetLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontWeight: '900' as const,
  },

  teamBudget: {
    color: Colors.money,
    fontSize: 19,
    fontWeight: '900' as const,
    marginTop: 3,
  },

  teamPlayersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  teamPlayersTitle: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '900' as const,
    marginLeft: 7,
  },

  noTeamPlayers: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 9,
  },

  teamPlayerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 9,
  },

  teamPlayerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  teamPlayerChipName: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '700' as const,
  },

  teamPlayerChipPrice: {
    color: Colors.money,
    fontSize: 10,
    fontWeight: '800' as const,
    marginLeft: 6,
  },

  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  soldListCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.money,
  },

  unsoldListCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.textMuted,
    opacity: 0.75,
  },

  listPlayerImage: {
    width: 58,
    height: 58,
    borderRadius: 12,
  },

  listPlayerPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listPlayerInfo: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  listPlayerName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800' as const,
  },

  listPlayerRole: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  boughtByText: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 5,
  },

  buyerName: {
    color: Colors.gold,
    fontWeight: '800' as const,
  },

  soldPriceContainer: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },

  priceSmallLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontWeight: '800' as const,
  },

  soldPrice: {
    color: Colors.money,
    fontSize: 18,
    fontWeight: '900' as const,
    marginTop: 3,
  },

  basePriceContainer: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },

  basePrice: {
    color: Colors.available,
    fontSize: 16,
    fontWeight: '900' as const,
    marginTop: 3,
  },

  unsoldBadge: {
    backgroundColor: Colors.textMuted + '25',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 8,
  },

  unsoldBadgeText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '900' as const,
  },

  emptyListCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },

  emptyListTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '800' as const,
    marginTop: 10,
  },

  emptyListText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});