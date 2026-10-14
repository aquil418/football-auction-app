import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  Gavel,
  User,
  DollarSign,
  Check,
  X,
  ChevronRight,
  ChevronUp,
  Zap,
} from 'lucide-react-native';
import { useAuction } from '@/contexts/AuctionContext';
import Colors from '@/constants/colors';

export default function AuctionScreen() {
  const router = useRouter();
  const {
  managers,
  players,
  currentPlayer,
  currentBid,
  currentBidder,
  bidIncrement,
  selectPlayerForAuction,
  placeBid,
  sellPlayer,
  markUnsold,
  setBidIncrement,
  getAvailablePlayers,
  getUnsoldPlayers,
  reAuctionPlayer,
  session,
} = useAuction();

  const [showPlayerSelect, setShowPlayerSelect] = useState(!currentPlayer);
  const [showUnsoldPlayers, setShowUnsoldPlayers] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentBidder) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentBid, currentBidder]);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: showPlayerSelect ? 0 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [showPlayerSelect]);

  if (session?.role !== 'admin') {
    return (
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedTitle}>Admin Access Required</Text>
          <Text style={styles.accessDeniedText}>
            Only the administrator can control bidding and player sales.
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

  const handleSelectPlayer = (playerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    selectPlayerForAuction(playerId);
    setShowPlayerSelect(false);
  };

  const handleBid = (managerId: string) => {
    const manager = managers.find(m => m.id === managerId);
    if (!manager) return;

    const newBid = currentBidder ? currentBid + bidIncrement : currentBid;
    
    if (manager.budget < newBid) {
      Alert.alert('Insufficient Budget', `${manager.name} doesn't have enough budget for this bid.`);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    placeBid(managerId);
  };

  const handleSell = () => {
  if (!currentBidder || !currentPlayer) {
    return;
  }

  const message =
    `Sell ${currentPlayer.name} to ${currentBidder.name} for $${currentBid}?`;

  const completeSale = () => {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );

    sellPlayer();
    setShowPlayerSelect(true);
  };

  if (Platform.OS === 'web') {
    const confirmed = window.confirm(message);

    if (confirmed) {
      completeSale();
    }
  } else {
    Alert.alert(
      'Confirm Sale',
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sell',
          onPress: completeSale,
        },
      ]
    );
  }
};

  const handleUnsold = () => {
  if (!currentPlayer) {
    return;
  }

  const message = `Mark ${currentPlayer.name} as unsold?`;

  const completeUnsold = () => {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning
    );

    markUnsold();
    setShowPlayerSelect(true);
  };

  if (Platform.OS === 'web') {
    const confirmed = window.confirm(message);

    if (confirmed) {
      completeUnsold();
    }
  } else {
    Alert.alert(
      'Mark Unsold',
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unsold',
          style: 'destructive',
          onPress: completeUnsold,
        },
      ]
    );
  }
};

  const availablePlayers = getAvailablePlayers();
  const unsoldPlayers = getUnsoldPlayers();

  const incrementOptions = [5, 10, 25, 50, 100];

  return (
    <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Auction Room',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.text,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {showPlayerSelect || !currentPlayer ? (
          <View style={styles.selectSection}>
            <View style={styles.selectHeader}>
              <Gavel size={32} color={Colors.gold} />
              <Text style={styles.selectTitle}>Select Player for Auction</Text>
              <Text style={styles.selectSubtitle}>
                {availablePlayers.length} players available
              </Text>
            </View>
            {unsoldPlayers.length > 0 && (
  <TouchableOpacity
    style={styles.unsoldPlayersToggle}
    onPress={() => setShowUnsoldPlayers(!showUnsoldPlayers)}
  >
    <View>
      <Text style={styles.unsoldPlayersTitle}>
        ↩ Unsold Players ({unsoldPlayers.length})
      </Text>
      <Text style={styles.unsoldPlayersSubtitle}>
        {showUnsoldPlayers ? 'Hide unsold players' : 'View and re-auction them'}
      </Text>
    </View>

    <ChevronUp
      size={24}
      color={Colors.gold}
      style={{
        transform: [{ rotate: showUnsoldPlayers ? '0deg' : '180deg' }],
      }}
    />
  </TouchableOpacity>
)}
{showUnsoldPlayers && unsoldPlayers.length > 0 && (
  <View style={styles.unsoldSection}>
    <Text style={styles.unsoldSectionTitle}>
      Players Waiting for Re-Auction
    </Text>

    <View style={styles.unsoldGrid}>
      {unsoldPlayers.map((player) => (
        <View key={player.id} style={styles.unsoldCard}>
          {player.photo ? (
            <Image
              source={{ uri: player.photo }}
              style={styles.unsoldPhoto}
              contentFit="contain"
            />
          ) : (
            <View style={styles.unsoldPhotoPlaceholder}>
              <User size={32} color={Colors.textMuted} />
            </View>
          )}

          <Text style={styles.unsoldName} numberOfLines={1}>
            {player.name}
          </Text>

          <Text style={styles.unsoldRole}>
            {player.role}
          </Text>

          <TouchableOpacity
            style={styles.reAuctionButton}
            onPress={() => {
              reAuctionPlayer(player.id);
              setShowUnsoldPlayers(false);
            }}
          >
            <Gavel size={18} color={Colors.primary} />
            <Text style={styles.reAuctionButtonText}>
              RE-AUCTION
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  </View>
)}
            {availablePlayers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No players available for auction</Text>
                <TouchableOpacity
                  style={styles.addPlayersButton}
                  onPress={() => router.push('/players')}
                >
                  <Text style={styles.addPlayersButtonText}>Add Players</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.playerGrid}>
                {availablePlayers.map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={styles.playerSelectCard}
                    onPress={() => handleSelectPlayer(player.id)}
                  >
                    {player.photo ? (
                      <Image source={{ uri: player.photo }} style={styles.playerSelectPhoto} contentFit="contain" />
                    ) : (
                      <View style={styles.playerSelectPhotoPlaceholder}>
                        <User size={32} color={Colors.textMuted} />
                      </View>
                    )}
                    <Text style={styles.playerSelectName} numberOfLines={1}>
                      {player.name}
                    </Text>
                    <Text style={styles.playerSelectRole}>{player.role}</Text>
                    <View style={styles.playerSelectPrice}>
                      <Text style={styles.playerSelectPriceText}>${player.basePrice}</Text>
                    </View>
                    <ChevronRight size={20} color={Colors.gold} style={styles.selectArrow} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
            <View style={styles.currentPlayerCard}>
              <View style={styles.playerSpotlight}>
                {currentPlayer.photo ? (
                  <Image source={{ uri: currentPlayer.photo }} style={styles.spotlightPhoto} contentFit="contain" />
                ) : (
                  <View style={styles.spotlightPhotoPlaceholder}>
                    <User size={64} color={Colors.textMuted} />
                  </View>
                )}
                <View style={styles.playerDetails}>
                  <Text style={styles.playerName}>{currentPlayer.name}</Text>
                  <Text style={styles.playerRole}>{currentPlayer.role}</Text>
                </View>
              </View>

              <Animated.View
                style={[
                  styles.bidDisplay,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Text style={styles.bidLabel}>Current Bid</Text>
                <View style={styles.bidAmount}>
                  <DollarSign size={36} color={Colors.gold} />
                  <Text style={styles.bidValue}>{currentBid}</Text>
                </View>
                {currentBidder ? (
                  <View style={[styles.bidderBadge, { backgroundColor: currentBidder.color + '30' }]}>
                    <View style={[styles.bidderDot, { backgroundColor: currentBidder.color }]} />
                    <Text style={[styles.bidderName, { color: currentBidder.color }]}>
                      {currentBidder.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.noBidder}>Base Price - No bids yet</Text>
                )}
              </Animated.View>

              <View style={styles.incrementSection}>
                <Text style={styles.incrementLabel}>Bid Increment:</Text>
                <View style={styles.incrementOptions}>
                  {incrementOptions.map((inc) => (
                    <TouchableOpacity
                      key={inc}
                      style={[
                        styles.incrementButton,
                        bidIncrement === inc && styles.incrementButtonActive,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setBidIncrement(inc);
                      }}
                    >
                      <Text
                        style={[
                          styles.incrementText,
                          bidIncrement === inc && styles.incrementTextActive,
                        ]}
                      >
                        +${inc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.sellButton}
                  onPress={handleSell}
                  disabled={!currentBidder}
                >
                  <LinearGradient
                    colors={currentBidder ? [Colors.money, Colors.moneyDark] : [Colors.textMuted, Colors.textMuted]}
                    style={styles.sellButtonGradient}
                  >
                    <Check size={24} color={Colors.text} />
                    <Text style={styles.sellButtonText}>
  {currentBidder ? 'SELL PLAYER' : 'PLACE A BID'}
</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.unsoldButton} onPress={handleUnsold}>
                  <X size={24} color={Colors.error} />
                  <Text style={styles.unsoldButtonText}>Unsold</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.changePlayerButton}
                onPress={() => setShowPlayerSelect(true)}
              >
                <Text style={styles.changePlayerText}>Change Player</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.biddersTitle}>Managers - Tap to Bid</Text>

            <View style={styles.biddersGrid}>
              {managers.map((manager) => {
                const isCurrentBidder = currentBidder?.id === manager.id;
                const nextBid = currentBidder ? currentBid + bidIncrement : currentBid;
                const canBid = manager.budget >= nextBid;

                return (
                  <TouchableOpacity
                    key={manager.id}
                    style={[
                      styles.bidderCard,
                      isCurrentBidder && styles.bidderCardActive,
                      !canBid && styles.bidderCardDisabled,
                    ]}
                    onPress={() => handleBid(manager.id)}
                    disabled={!canBid}
                  >
                    <View style={[styles.bidderAvatar, { backgroundColor: manager.color }]}>
                      <Text style={styles.bidderAvatarText}>
                        {manager.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.bidderCardName}>{manager.name}</Text>
                    <View style={styles.bidderBudget}>
                      <DollarSign size={14} color={canBid ? Colors.money : Colors.textMuted} />
                      <Text style={[styles.bidderBudgetText, !canBid && styles.bidderBudgetLow]}>
                        {manager.budget}
                      </Text>
                    </View>
                    {isCurrentBidder && (
                      <View style={styles.highestBadge}>
                        <Zap size={12} color={Colors.gold} />
                        <Text style={styles.highestText}>Highest</Text>
                      </View>
                    )}
                    {canBid && (
                      <View style={styles.tapToBid}>
                        <ChevronUp size={16} color={Colors.gold} />
                        <Text style={styles.tapToBidText}>
                          Bid ${currentBidder ? currentBid + bidIncrement : currentBid}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
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
  unsoldPlayersToggle: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: Colors.cardBg,
  borderWidth: 1,
  borderColor: Colors.gold + '50',
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
},

unsoldPlayersTitle: {
  fontSize: 17,
  fontWeight: '700' as const,
  color: Colors.gold,
},

unsoldPlayersSubtitle: {
  fontSize: 13,
  color: Colors.textSecondary,
  marginTop: 4,
},

unsoldSection: {
  marginBottom: 20,
},

unsoldSectionTitle: {
  fontSize: 18,
  fontWeight: '700' as const,
  color: Colors.text,
  marginBottom: 12,
},

unsoldGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
},

unsoldCard: {
  width: '48%',
  backgroundColor: Colors.cardBg,
  borderRadius: 16,
  padding: 12,
  marginBottom: 12,
  alignItems: 'center',
},

unsoldPhoto: {
  width: 100,
  aspectRatio: 1011 / 1536,
  borderRadius: 12,
  marginBottom: 8,
},

unsoldPhotoPlaceholder: {
  width: 100,
  aspectRatio: 1011 / 1536,
  borderRadius: 12,
  backgroundColor: Colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 8,
},

unsoldName: {
  fontSize: 15,
  fontWeight: '700' as const,
  color: Colors.text,
  textAlign: 'center',
},

unsoldRole: {
  fontSize: 12,
  color: Colors.textSecondary,
  marginTop: 2,
  marginBottom: 10,
},

reAuctionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: Colors.gold,
  borderRadius: 10,
  paddingVertical: 9,
  paddingHorizontal: 10,
  gap: 5,
  width: '100%',
},

reAuctionButtonText: {
  fontSize: 12,
  fontWeight: '800' as const,
  color: Colors.primary,
},
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  selectSection: {
    alignItems: 'center',
  },
  selectHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  selectTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 12,
  },
  selectSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  addPlayersButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addPlayersButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  playerGrid: {
    width: '100%',
  },
  playerSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  playerSelectPhoto: {
    width: 56,
    aspectRatio: 1011 / 1536,
    borderRadius: 8,
  },
  playerSelectPhotoPlaceholder: {
    width: 56,
    aspectRatio: 1011 / 1536,
    borderRadius: 8,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerSelectName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginLeft: 16,
  },
  playerSelectRole: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginRight: 12,
  },
  playerSelectPrice: {
    backgroundColor: Colors.gold + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  playerSelectPriceText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  selectArrow: {
    marginLeft: 12,
  },
  currentPlayerCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  playerSpotlight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  spotlightPhoto: {
    width: 80,
    aspectRatio: 1011 / 1536,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: Colors.gold,
  },
  spotlightPhotoPlaceholder: {
    width: 80,
    aspectRatio: 1011 / 1536,
    borderRadius: 10,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.gold,
  },
  playerDetails: {
    flex: 1,
    marginLeft: 16,
  },
  playerName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  playerRole: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  bidDisplay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  bidLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bidAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bidValue: {
    fontSize: 56,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  bidderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bidderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  bidderName: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  noBidder: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 12,
  },
  incrementSection: {
    marginVertical: 16,
  },
  incrementLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  incrementOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  incrementButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  incrementButtonActive: {
    backgroundColor: Colors.gold,
  },
  incrementText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  incrementTextActive: {
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  sellButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sellButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  sellButtonText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  unsoldButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '20',
    borderRadius: 16,
    paddingVertical: 18,
    gap: 8,
  },
  unsoldButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  changePlayerButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  changePlayerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  biddersTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  biddersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bidderCard: {
    width: '48%',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  bidderCardActive: {
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  bidderCardDisabled: {
    opacity: 0.5,
  },
  bidderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bidderAvatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  bidderCardName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  bidderBudget: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bidderBudgetText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.money,
  },
  bidderBudgetLow: {
    color: Colors.textMuted,
  },
  highestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  highestText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  tapToBid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  tapToBidText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
});
