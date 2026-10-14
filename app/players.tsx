import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Plus, Camera, User, Trash2, X, Check, Upload, Images } from 'lucide-react-native';
import { useAuction } from '@/contexts/AuctionContext';
import Colors from '@/constants/colors';

export default function PlayersScreen() {
  const router = useRouter();
  const { players, addPlayer, addPlayers, removePlayer, removePlayers, session } = useAuction();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  if (session?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedTitle}>Admin Access Required</Text>
          <Text style={styles.accessDeniedText}>
            Only the administrator can manage the player pool.
          </Text>
          <TouchableOpacity
            style={styles.accessDeniedButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.accessDeniedButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const availablePlayers = players.filter(p => p.status === 'available');
  const soldPlayers = players.filter(p => p.status === 'sold');
  const unsoldPlayers = players.filter(p => p.status === 'unsold');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add player photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1011, 1536],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take player photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1011, 1536],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const importPlayers = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    // On web this permission call is a no-op. On Android/iOS it gives the
    // picker access to the user's media library.
    if (Platform.OS !== 'web' && status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please grant photo library permissions to import player cards.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 0,
      allowsEditing: false,
      quality: 1,
      orderedSelection: true,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const importedPlayers = result.assets.map((asset, index) => {
        const rawName = asset.fileName?.replace(/\.[^/.]+$/, '')?.trim();
        return {
          name: rawName || `Player ${players.length + index + 1}`,
          photo: asset.uri,
          fileName: asset.fileName,
        };
      });

    try {
      await addPlayers(importedPlayers);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not upload player images.';
      if (Platform.OS === 'web') window.alert(`Import failed: ${message}`);
      else Alert.alert('Import failed', message);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const importMessage =
      `${importedPlayers.length} player card${importedPlayers.length === 1 ? '' : 's'} added successfully.`;

    if (Platform.OS === 'web') {
      window.alert(importMessage);
    } else {
      Alert.alert('Players Imported', importMessage);
    }
  };

  const handleAddPlayer = () => {
    if (name.trim() === '') {
      Alert.alert('Error', 'Please enter player name');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPlayer(name.trim(), role.trim() || 'Player', photo);
    setName('');
    setRole('');
    setPhoto(null);
    setShowForm(false);
  };

  const handleRemovePlayer = (playerId: string, playerName: string) => {
    const confirmRemoval = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      removePlayer(playerId);
      setSelectedPlayers(prev => prev.filter(id => id !== playerId));
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${playerName} from the auction player pool?`)) {
        confirmRemoval();
      }
      return;
    }

    Alert.alert(
      'Remove Player',
      `Are you sure you want to remove ${playerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: confirmRemoval,
        },
      ]
    );
  };

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const allAvailableSelected =
    availablePlayers.length > 0 &&
    availablePlayers.every(player => selectedPlayers.includes(player.id));

  const toggleSelectAll = () => {
    if (allAvailableSelected) {
      setSelectedPlayers(prev =>
        prev.filter(id => !availablePlayers.some(player => player.id === id))
      );
    } else {
      setSelectedPlayers(prev => [
        ...new Set([
          ...prev,
          ...availablePlayers.map(player => player.id),
        ]),
      ]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPlayers.length === 0) return;

    const count = selectedPlayers.length;

    const confirmDelete = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      removePlayers(selectedPlayers);
      setSelectedPlayers([]);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete ${count} selected player${count === 1 ? '' : 's'}?`)) {
        confirmDelete();
      }
      return;
    }

    Alert.alert(
      'Delete Selected Players',
      `Delete ${count} selected player${count === 1 ? '' : 's'} from the auction pool?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };


  return (
    <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Player Pool',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.text,
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowForm(true);
              }}
            >
              <Plus size={24} color={Colors.gold} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.importCard}>
          <View style={styles.importHeader}>
            <View style={styles.importIcon}>
              <Images size={28} color={Colors.gold} />
            </View>
            <View style={styles.importTextContainer}>
              <Text style={styles.importTitle}>Import Player Cards</Text>
              <Text style={styles.importSubtitle}>
                Select multiple player card images at once
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.importButton}
            onPress={importPlayers}
          >
            <Upload size={20} color={Colors.primary} />
            <Text style={styles.importButtonText}>Import Players</Text>
          </TouchableOpacity>

          {players.length > 0 && (
            <Text style={styles.importCount}>
              {players.length} player{players.length === 1 ? '' : 's'} in the pool
            </Text>
          )}
        </View>

        {availablePlayers.length > 0 && (
          <View style={styles.selectionToolbar}>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={toggleSelectAll}
            >
              <View style={[
                styles.checkbox,
                allAvailableSelected && styles.checkboxSelected,
              ]}>
                {allAvailableSelected && (
                  <Check size={15} color={Colors.primary} />
                )}
              </View>
              <Text style={styles.selectAllText}>
                {allAvailableSelected ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.selectedCount}>
              {selectedPlayers.length} selected
            </Text>

            <TouchableOpacity
              style={[
                styles.deleteSelectedButton,
                selectedPlayers.length === 0 && styles.deleteSelectedButtonDisabled,
              ]}
              onPress={handleDeleteSelected}
              disabled={selectedPlayers.length === 0}
            >
              <Trash2
                size={18}
                color={selectedPlayers.length === 0 ? Colors.textMuted : Colors.error}
              />
              <Text style={[
                styles.deleteSelectedText,
                selectedPlayers.length === 0 && styles.deleteSelectedTextDisabled,
              ]}>
                Delete Selected
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add New Player</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <X size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.photoSection} onPress={pickImage}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Camera size={32} color={Colors.textMuted} />
                  <Text style={styles.photoText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Text style={styles.photoButtonText}>Gallery</Text>
              </TouchableOpacity>
              {Platform.OS !== 'web' && (
                <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                  <Text style={styles.photoButtonText}>Camera</Text>
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Player Name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Role (e.g., Batsman, Bowler)"
              placeholderTextColor={Colors.textMuted}
              value={role}
              onChangeText={setRole}
            />

            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Base Price:</Text>
              <Text style={styles.priceValue}>$50</Text>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
              <Check size={20} color={Colors.primary} />
              <Text style={styles.addButtonText}>Add Player</Text>
            </TouchableOpacity>
          </View>
        )}

        {availablePlayers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available ({availablePlayers.length})</Text>
            {availablePlayers.map((player) => (
              <View key={player.id} style={styles.playerCard}>
                {player.photo ? (
                  <Image source={{ uri: player.photo }} style={styles.playerPhoto} contentFit="contain" />
                ) : (
                  <View style={styles.playerPhotoPlaceholder}>
                    <User size={24} color={Colors.textMuted} />
                  </View>
                )}
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerRole}>{player.role}</Text>
                </View>
                <View style={styles.playerPriceBadge}>
                  <Text style={styles.playerPriceText}>${player.basePrice}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemovePlayer(player.id, player.name)}
                >
                  <Trash2 size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {soldPlayers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sold ({soldPlayers.length})</Text>
            {soldPlayers.map((player) => (
              <View key={player.id} style={[styles.playerCard, styles.soldCard]}>
                {player.photo ? (
                  <Image source={{ uri: player.photo }} style={styles.playerPhoto} contentFit="contain" />
                ) : (
                  <View style={styles.playerPhotoPlaceholder}>
                    <User size={24} color={Colors.textMuted} />
                  </View>
                )}
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerRole}>{player.role}</Text>
                </View>
                <View style={[styles.playerPriceBadge, styles.soldBadge]}>
                  <Text style={[styles.playerPriceText, styles.soldPriceText]}>
                    ${player.soldPrice}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {unsoldPlayers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unsold ({unsoldPlayers.length})</Text>
            {unsoldPlayers.map((player) => (
              <View key={player.id} style={[styles.playerCard, styles.unsoldCard]}>
                {player.photo ? (
                  <Image source={{ uri: player.photo }} style={styles.playerPhoto} contentFit="contain" />
                ) : (
                  <View style={styles.playerPhotoPlaceholder}>
                    <User size={24} color={Colors.textMuted} />
                  </View>
                )}
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerRole}>{player.role}</Text>
                </View>
                <View style={[styles.playerPriceBadge, styles.unsoldBadge]}>
                  <Text style={[styles.playerPriceText, styles.unsoldPriceText]}>Unsold</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {players.length === 0 && !showForm && (
          <View style={styles.emptyState}>
            <User size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Players Yet</Text>
            <Text style={styles.emptyText}>
              Import all your player card images at once, or add a player manually.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={importPlayers}
            >
              <Upload size={20} color={Colors.primary} />
              <Text style={styles.emptyButtonText}>Import Player Cards</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryEmptyButton}
              onPress={() => setShowForm(true)}
            >
              <Plus size={18} color={Colors.gold} />
              <Text style={styles.secondaryEmptyButtonText}>Add Manually</Text>
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
    backgroundColor: Colors.primary,
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
  selectionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  selectAllText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  selectedCount: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  deleteSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.error + '70',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  deleteSelectedButtonDisabled: {
    borderColor: Colors.border,
  },
  deleteSelectedText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '800' as const,
  },
  deleteSelectedTextDisabled: {
    color: Colors.textMuted,
  },
  playerCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  playerCheckboxSelected: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  playerCardSelected: {
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerButton: {
    padding: 8,
  },
  importCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gold + '35',
  },
  importHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  importIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  importTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  importTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  importSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  importButton: {
    backgroundColor: Colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  importButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  importCount: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.money,
    fontWeight: '600' as const,
    marginTop: 10,
  },
  formCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  photoPreview: {
    width: 120,
    aspectRatio: 1011 / 1536,
    borderRadius: 12,
  },
  photoPlaceholder: {
    width: 120,
    aspectRatio: 1011 / 1536,
    borderRadius: 12,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  photoButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  photoButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  input: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.money + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.money,
  },
  addButton: {
    backgroundColor: Colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  soldCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.money,
  },
  unsoldCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.textMuted,
    opacity: 0.7,
  },
  playerPhoto: {
    width: 52,
    aspectRatio: 1011 / 1536,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  playerPhotoPlaceholder: {
    width: 52,
    aspectRatio: 1011 / 1536,
    borderRadius: 8,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInfo: {
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
    marginTop: 2,
  },
  playerPriceBadge: {
    backgroundColor: Colors.available + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  playerPriceText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.available,
  },
  soldBadge: {
    backgroundColor: Colors.money + '30',
  },
  soldPriceText: {
    color: Colors.money,
  },
  unsoldBadge: {
    backgroundColor: Colors.textMuted + '30',
  },
  unsoldPriceText: {
    color: Colors.textMuted,
  },
  deleteButton: {
    padding: 10,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyButton: {
    backgroundColor: Colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  secondaryEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
    gap: 6,
  },
  secondaryEmptyButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
});
