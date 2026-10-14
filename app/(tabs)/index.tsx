import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Trash2, Users, DollarSign, Gavel } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuction } from '@/contexts/AuctionContext';
import Colors from '@/constants/colors';

export default function SetupScreen() {
  const router = useRouter();
  const { isSetupComplete, setupManagers, managers, players, resetAuction, session } = useAuction();
  const [managerNames, setManagerNames] = useState<string[]>(['', '']);
  const [budget, setBudget] = useState('1000');

  if (session?.role !== 'admin') {
    return (
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedTitle}>Admin Access Required</Text>
          <Text style={styles.accessDeniedText}>
            Auction setup is only available to the administrator.
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

  const addManager = () => {
    if (managerNames.length < 8) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setManagerNames([...managerNames, '']);
    }
  };

  const removeManager = (index: number) => {
    if (managerNames.length > 2) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setManagerNames(managerNames.filter((_, i) => i !== index));
    }
  };

  const updateManagerName = (index: number, name: string) => {
    const updated = [...managerNames];
    updated[index] = name;
    setManagerNames(updated);
  };

  const handleSetup = () => {
    const validNames = managerNames.filter(name => name.trim() !== '');
    if (validNames.length >= 2 && parseInt(budget) > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setupManagers(validNames, parseInt(budget));
    }
  };

  const handleReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    resetAuction();
    setManagerNames(['', '']);
    setBudget('1000');
  };

  if (isSetupComplete) {
    return (
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.container}>
        <ScrollView contentContainerStyle={styles.dashboardContent}>
          <View style={styles.header}>
            <Gavel size={48} color={Colors.gold} />
            <Text style={styles.title}>Auction Hub</Text>
            <Text style={styles.subtitle}>Ready to start the auction</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Users size={24} color={Colors.accent} />
              <Text style={styles.statNumber}>{managers.length}</Text>
              <Text style={styles.statLabel}>Managers</Text>
            </View>
            <View style={styles.statCard}>
              <DollarSign size={24} color={Colors.money} />
              <Text style={styles.statNumber}>{managers[0]?.initialBudget || 0}</Text>
              <Text style={styles.statLabel}>Budget Each</Text>
            </View>
            <View style={styles.statCard}>
              <Gavel size={24} color={Colors.gold} />
              <Text style={styles.statNumber}>{players.length}</Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
          </View>

          <View style={styles.menuGrid}>
            <TouchableOpacity
              style={[styles.menuCard, { backgroundColor: Colors.cardBg }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/players');
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: Colors.accent + '30' }]}>
                <Plus size={28} color={Colors.accent} />
              </View>
              <Text style={styles.menuTitle}>Add Players</Text>
              <Text style={styles.menuSubtitle}>Upload player photos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuCard, { backgroundColor: Colors.cardBg }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/auction');
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: Colors.gold + '30' }]}>
                <Gavel size={28} color={Colors.gold} />
              </View>
              <Text style={styles.menuTitle}>Auction Room</Text>
              <Text style={styles.menuSubtitle}>Start bidding</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuCard, { backgroundColor: Colors.cardBg }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/managers');
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: Colors.money + '30' }]}>
                <Users size={28} color={Colors.money} />
              </View>
              <Text style={styles.menuTitle}>Managers</Text>
              <Text style={styles.menuSubtitle}>View budgets & teams</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuCard, { backgroundColor: Colors.cardBg }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/results');
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#8b5cf6' + '30' }]}>
                <DollarSign size={28} color="#8b5cf6" />
              </View>
              <Text style={styles.menuTitle}>Results</Text>
              <Text style={styles.menuSubtitle}>Auction summary</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset Auction</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Gavel size={56} color={Colors.gold} />
            <Text style={styles.title}>Player Auction</Text>
            <Text style={styles.subtitle}>Set up your auction</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget per Manager</Text>
            <View style={styles.budgetInputContainer}>
              <DollarSign size={24} color={Colors.money} />
              <TextInput
                style={styles.budgetInput}
                value={budget}
                onChangeText={setBudget}
                keyboardType="number-pad"
                placeholder="Enter budget"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Managers ({managerNames.length})</Text>
              {managerNames.length < 8 && (
                <TouchableOpacity style={styles.addButton} onPress={addManager}>
                  <Plus size={20} color={Colors.text} />
                </TouchableOpacity>
              )}
            </View>

            {managerNames.map((name, index) => (
              <View key={index} style={styles.managerInputRow}>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: Colors.managerColors[index % Colors.managerColors.length] },
                  ]}
                />
                <TextInput
                  style={styles.managerInput}
                  value={name}
                  onChangeText={(text) => updateManagerName(index, text)}
                  placeholder={`Manager ${index + 1}`}
                  placeholderTextColor={Colors.textMuted}
                />
                {managerNames.length > 2 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeManager(index)}
                  >
                    <Trash2 size={18} color={Colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.startButton,
              managerNames.filter(n => n.trim()).length < 2 && styles.startButtonDisabled,
            ]}
            onPress={handleSetup}
            disabled={managerNames.filter(n => n.trim()).length < 2}
          >
            <LinearGradient
              colors={[Colors.gold, '#ffaa00']}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Gavel size={24} color={Colors.primary} />
              <Text style={styles.startButtonText}>Start Setup</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  dashboardContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  budgetInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.money,
    marginLeft: 12,
    paddingVertical: 12,
  },
  addButton: {
    backgroundColor: Colors.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  managerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  managerInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
    paddingVertical: 14,
  },
  removeButton: {
    padding: 8,
  },
  startButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  resetButton: {
    marginTop: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 12,
  },
  resetButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
