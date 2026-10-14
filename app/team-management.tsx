import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Shield,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Users,
  Wallet,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuction } from '@/contexts/AuctionContext';

const MAX_MANAGERS = 8;

export default function TeamManagementScreen() {
  const router = useRouter();
  const {
    managers,
    session,
    auctionStarted,
    auctionEnded,
    addManager,
    updateManager,
    removeManager,
  } = useAuction();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [newName, setNewName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newBudget, setNewBudget] = useState('');

  const isLocked = auctionStarted || auctionEnded;

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Team Management', message);
    }
  };

  const startEditing = (manager: (typeof managers)[number]) => {
    setEditingId(manager.id);
    setEditName(manager.name);
    setEditTeamName(manager.teamName || manager.name);
    setEditBudget(String(manager.initialBudget));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditTeamName('');
    setEditBudget('');
  };

  const saveManager = (managerId: string) => {
    const budget = Number(editBudget);

    if (!editName.trim()) {
      showError('Manager name cannot be empty.');
      return;
    }
    if (!editTeamName.trim()) {
      showError('Team name cannot be empty.');
      return;
    }
    if (!Number.isFinite(budget) || budget <= 0) {
      showError('Starting budget must be greater than 0.');
      return;
    }

    const success = updateManager(managerId, {
      name: editName,
      teamName: editTeamName,
      startingBudget: budget,
    });

    if (!success) {
      showError('Managers cannot be changed after the auction starts or ends.');
      return;
    }

    cancelEditing();
  };

  const handleAddManager = () => {
    if (managers.length >= MAX_MANAGERS) {
      showError('LEAGUE supports a maximum of 8 managers.');
      return;
    }

    const budget = Number(newBudget);

    if (!newName.trim()) {
      showError('Enter a manager name.');
      return;
    }
    if (!newTeamName.trim()) {
      showError('Enter a team name.');
      return;
    }
    if (!Number.isFinite(budget) || budget <= 0) {
      showError('Enter a valid starting budget.');
      return;
    }

    const success = addManager(newName, newTeamName, budget);
    if (!success) {
      showError('Unable to add manager. Make sure the auction has not started.');
      return;
    }

    setNewName('');
    setNewTeamName('');
    setNewBudget('');
  };

  const handleRemoveManager = (managerId: string, managerName: string) => {
    const manager = managers.find((m) => m.id === managerId);
    if (!manager) return;

    if (manager.players.length > 0) {
      showError(`${managerName} already owns players and cannot be removed.`);
      return;
    }

    const remove = () => {
      const success = removeManager(managerId);
      if (!success) {
        showError('Unable to remove this manager. The auction may already be locked.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${managerName} from the league?`)) remove();
    } else {
      Alert.alert(
        'Remove Manager',
        `Remove ${managerName} from the league?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: remove },
        ],
      );
    }
  };

  if (session?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.center}>
          <Shield size={48} color={Colors.gold} />
          <Text style={styles.accessTitle}>Admin Access Required</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Team Management</Text>
            <Text style={styles.subtitle}>Configure managers, teams and budgets</Text>
          </View>
          <View style={styles.adminBadge}>
            <Shield size={17} color={Colors.gold} />
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isLocked && (
            <View style={styles.lockedCard}>
              <Shield size={20} color={Colors.gold} />
              <View style={styles.lockedTextContainer}>
                <Text style={styles.lockedTitle}>Team setup is locked</Text>
                <Text style={styles.lockedText}>
                  Managers, teams and starting budgets cannot be changed after the auction starts.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Users size={22} color={Colors.gold} />
              <View>
                <Text style={styles.summaryValue}>{managers.length} / {MAX_MANAGERS}</Text>
                <Text style={styles.summaryLabel}>Teams</Text>
              </View>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Wallet size={22} color={Colors.money} />
              <View>
                <Text style={styles.summaryValue}>
                  {managers.reduce((total, manager) => total + manager.initialBudget, 0)}
                </Text>
                <Text style={styles.summaryLabel}>Total Starting Budget</Text>
              </View>
            </View>
          </View>

          {!isLocked && managers.length < MAX_MANAGERS && (
            <View style={styles.addCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}><Plus size={22} color={Colors.gold} /></View>
                <View>
                  <Text style={styles.sectionTitle}>Add Manager</Text>
                  <Text style={styles.sectionSubtitle}>Create a new team</Text>
                </View>
              </View>

              <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Manager name" placeholderTextColor={Colors.textMuted} />
              <TextInput style={styles.input} value={newTeamName} onChangeText={setNewTeamName} placeholder="Team name" placeholderTextColor={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={newBudget}
                onChangeText={(value) => setNewBudget(value.replace(/\D/g, ''))}
                placeholder="Starting budget"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
              />

              <TouchableOpacity style={styles.primaryAction} onPress={handleAddManager}>
                <Plus size={19} color={Colors.primary} />
                <Text style={styles.primaryActionText}>ADD MANAGER</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.managerSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}><Users size={22} color={Colors.gold} /></View>
              <View>
                <Text style={styles.sectionTitle}>Managers & Teams</Text>
                <Text style={styles.sectionSubtitle}>{managers.length} configured</Text>
              </View>
            </View>

            {managers.map((manager) => {
              const isEditing = editingId === manager.id;
              const teamName = manager.teamName || manager.name;

              return (
                <View key={manager.id} style={styles.managerCard}>
                  <View style={styles.managerHeader}>
                    <View style={[styles.avatar, { backgroundColor: manager.color }]}>
                      <Text style={styles.avatarText}>{manager.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.managerIdentity}>
                      <Text style={styles.managerName}>{manager.name}</Text>
                      <Text style={styles.teamName}>{teamName}</Text>
                    </View>

                    {!isLocked && !isEditing && (
                      <View style={styles.managerActions}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => startEditing(manager)}>
                          <Pencil size={18} color={Colors.gold} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.iconButton, manager.players.length > 0 && styles.iconButtonDisabled]}
                          onPress={() => handleRemoveManager(manager.id, manager.name)}
                          disabled={manager.players.length > 0}
                        >
                          <Trash2 size={18} color={manager.players.length > 0 ? Colors.textMuted : Colors.error} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {isEditing ? (
                    <View style={styles.editSection}>
                      <Text style={styles.fieldLabel}>Manager Name</Text>
                      <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Manager name" placeholderTextColor={Colors.textMuted} />
                      <Text style={styles.fieldLabel}>Team Name</Text>
                      <TextInput style={styles.input} value={editTeamName} onChangeText={setEditTeamName} placeholder="Team name" placeholderTextColor={Colors.textMuted} />
                      <Text style={styles.fieldLabel}>Starting Budget</Text>
                      <TextInput
                        style={styles.input}
                        value={editBudget}
                        onChangeText={(value) => setEditBudget(value.replace(/\D/g, ''))}
                        placeholder="Starting budget"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="number-pad"
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing}>
                          <X size={18} color={Colors.textSecondary} />
                          <Text style={styles.cancelButtonText}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={() => saveManager(manager.id)}>
                          <Check size={18} color={Colors.primary} />
                          <Text style={styles.saveButtonText}>SAVE</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.managerDetails}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Remaining</Text>
                        <Text style={[styles.detailValue, { color: Colors.money }]}>{manager.budget}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Starting</Text>
                        <Text style={styles.detailValue}>{manager.initialBudget}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Players</Text>
                        <Text style={styles.detailValue}>{manager.players.length}</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {managers.length === 0 && (
              <View style={styles.emptyCard}>
                <Users size={48} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No managers yet</Text>
                <Text style={styles.emptyText}>Add your first manager above.</Text>
              </View>
            )}
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>💡 Before the auction</Text>
            <Text style={styles.noteText}>
              Set all manager names, team names and starting budgets before starting the auction. Once the auction begins, team setup is locked to protect auction data.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  safeArea: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  accessTitle: { color: Colors.text, fontSize: 23, fontWeight: '800' as const, marginTop: 16, marginBottom: 20 },
  primaryButton: { backgroundColor: Colors.gold, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 12 },
  primaryButtonText: { color: Colors.primary, fontWeight: '800' as const },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  backButton: { padding: 6 },
  headerText: { flex: 1 },
  title: { color: Colors.text, fontSize: 24, fontWeight: '800' as const },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.gold + '20', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  adminBadgeText: { color: Colors.gold, fontSize: 12, fontWeight: '800' as const },
  content: { padding: 24, paddingBottom: 60, width: '100%', maxWidth: 900, alignSelf: 'center', gap: 18 },
  lockedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gold + '15', borderWidth: 1, borderColor: Colors.gold + '50', borderRadius: 16, padding: 16, gap: 12 },
  lockedTextContainer: { flex: 1 },
  lockedTitle: { color: Colors.gold, fontSize: 15, fontWeight: '800' as const },
  lockedText: { color: Colors.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 19 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: Colors.border },
  summaryItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryDivider: { width: 1, height: 40, backgroundColor: Colors.border, marginHorizontal: 16 },
  summaryValue: { color: Colors.text, fontSize: 20, fontWeight: '800' as const },
  summaryLabel: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  addCard: { backgroundColor: Colors.cardBg, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: Colors.border },
  managerSection: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sectionIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: Colors.gold + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '800' as const },
  sectionSubtitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  input: { backgroundColor: Colors.primary, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 15, paddingVertical: 13, color: Colors.text, fontSize: 15, marginTop: 10 },
  primaryAction: { marginTop: 14, backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryActionText: { color: Colors.primary, fontWeight: '800' as const },
  managerCard: { backgroundColor: Colors.cardBg, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: Colors.border },
  managerHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.text, fontSize: 22, fontWeight: '800' as const },
  managerIdentity: { flex: 1, marginLeft: 14 },
  managerName: { color: Colors.text, fontSize: 17, fontWeight: '800' as const },
  teamName: { color: Colors.gold, fontSize: 14, fontWeight: '600' as const, marginTop: 3 },
  managerActions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  iconButtonDisabled: { opacity: 0.45 },
  managerDetails: { flexDirection: 'row', marginTop: 18, paddingTop: 15, borderTopWidth: 1, borderTopColor: Colors.border },
  detailItem: { flex: 1 },
  detailLabel: { color: Colors.textMuted, fontSize: 11 },
  detailValue: { color: Colors.text, fontSize: 16, fontWeight: '800' as const, marginTop: 3 },
  editSection: { marginTop: 18, paddingTop: 15, borderTopWidth: 1, borderTopColor: Colors.border },
  fieldLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' as const, marginTop: 8 },
  editButtons: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelButton: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  cancelButtonText: { color: Colors.textSecondary, fontWeight: '800' as const },
  saveButton: { flex: 1, borderRadius: 12, backgroundColor: Colors.gold, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  saveButtonText: { color: Colors.primary, fontWeight: '800' as const },
  emptyCard: { backgroundColor: Colors.cardBg, borderRadius: 18, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '800' as const, marginTop: 12 },
  emptyText: { color: Colors.textMuted, fontSize: 13, marginTop: 5 },
  noteCard: { backgroundColor: Colors.cardBg, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: Colors.border },
  noteTitle: { color: Colors.text, fontSize: 14, fontWeight: '800' as const },
  noteText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
});
