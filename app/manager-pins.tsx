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
  Lock,
  Check,
  X,
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useAuction } from '@/contexts/AuctionContext';
import { supabase } from '@/lib/supabase';

const ADMIN_PASSWORD = 'UG3PU';

export default function ManagerPinsScreen() {
  const router = useRouter();

  const { managers, session } = useAuction();

  const [editingManagerId, setEditingManagerId] = useState<string | null>(
    null
  );

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [saving, setSaving] = useState(false);

  const showMessage = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Manager PINs', message);
    }
  };

  // Protect this screen from non-admin users.
  if (session?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.center}>
          <Text style={styles.errorTitle}>
            Admin Access Required
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.primaryButtonText}>
              Return to Home
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const startEditing = (managerId: string) => {
    setEditingManagerId(managerId);
    setNewPin('');
    setConfirmPin('');
  };

  const cancelEditing = () => {
    setEditingManagerId(null);
    setNewPin('');
    setConfirmPin('');
  };

  const handleSavePin = async (managerId: string) => {
    if (!supabase) {
      showMessage('Database connection is not available.');
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      showMessage('PIN must contain exactly 4 digits.');
      return;
    }

    if (newPin !== confirmPin) {
      showMessage('PINs do not match.');
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.rpc(
        'set_manager_pin',
        {
          p_manager_id: managerId,
          p_pin: newPin,
          p_admin_password: ADMIN_PASSWORD,
        }
      );

      if (error) {
        console.error('Set manager PIN error:', error);
        showMessage(
          'Unable to save the PIN. Please try again.'
        );
        return;
      }

      if (!data) {
        showMessage(
          'PIN could not be changed. Admin verification failed.'
        );
        return;
      }

      showMessage('Manager PIN updated successfully.');

      cancelEditing();
    } catch (error) {
      console.error('Manager PIN error:', error);

      showMessage(
        'Something went wrong while saving the PIN.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft
              size={24}
              color={Colors.text}
            />
          </TouchableOpacity>

          <View style={styles.headerIcon}>
            <Shield
              size={24}
              color={Colors.gold}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Manager PINs
            </Text>

            <Text style={styles.subtitle}>
              Set individual login PINs
            </Text>
          </View>

        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          {/* Information card */}
          <View style={styles.infoCard}>

            <View style={styles.infoIcon}>
              <Lock
                size={22}
                color={Colors.gold}
              />
            </View>

            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>
                Manager Login Security
              </Text>

              <Text style={styles.infoDescription}>
                Each manager has their own 4-digit PIN.
                PINs are securely stored and are never
                displayed here.
              </Text>
            </View>

          </View>

          {/* Manager list */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Managers
            </Text>

            <Text style={styles.sectionCount}>
              {managers.length} total
            </Text>
          </View>

          {managers.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>
                No managers configured
              </Text>

              <Text style={styles.emptyText}>
                Set up your managers before assigning
                PINs.
              </Text>
            </View>
          ) : (
            managers.map((manager) => {

              const editing =
                editingManagerId === manager.id;

              return (
                <View
                  key={manager.id}
                  style={styles.managerCard}
                >

                  {/* Manager header */}
                  <View style={styles.managerHeader}>

                    <View
                      style={[
                        styles.managerIcon,
                        {
                          backgroundColor:
                            manager.color + '30',
                        },
                      ]}
                    >
                      <Shield
                        size={25}
                        color={manager.color}
                      />
                    </View>

                    <View style={styles.managerInfo}>
                      <Text style={styles.managerName}>
                        {manager.name}
                      </Text>

                      <Text style={styles.managerStatus}>
                        {editing
                          ? 'Setting new PIN'
                          : 'PIN protected'}
                      </Text>
                    </View>

                  </View>

                  {/* Editing area */}
                  {editing ? (
                    <View style={styles.editSection}>

                      <Text style={styles.inputLabel}>
                        New PIN
                      </Text>

                      <TextInput
                        style={styles.pinInput}
                        value={newPin}
                        onChangeText={(value) => {
                          setNewPin(
                            value.replace(/\D/g, '')
                          );
                        }}
                        placeholder="4-digit PIN"
                        placeholderTextColor={
                          Colors.textMuted
                        }
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={4}
                        editable={!saving}
                      />

                      <Text style={styles.inputLabel}>
                        Confirm PIN
                      </Text>

                      <TextInput
                        style={styles.pinInput}
                        value={confirmPin}
                        onChangeText={(value) => {
                          setConfirmPin(
                            value.replace(/\D/g, '')
                          );
                        }}
                        placeholder="Enter PIN again"
                        placeholderTextColor={
                          Colors.textMuted
                        }
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={4}
                        editable={!saving}
                      />

                      <View style={styles.editButtons}>

                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={cancelEditing}
                          disabled={saving}
                        >
                          <X
                            size={18}
                            color={Colors.textSecondary}
                          />

                          <Text style={styles.cancelText}>
                            CANCEL
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.saveButton,
                            saving &&
                              styles.disabledButton,
                          ]}
                          onPress={() =>
                            handleSavePin(manager.id)
                          }
                          disabled={saving}
                        >
                          <Check
                            size={18}
                            color={Colors.primary}
                          />

                          <Text style={styles.saveText}>
                            {saving
                              ? 'SAVING...'
                              : 'SAVE PIN'}
                          </Text>
                        </TouchableOpacity>

                      </View>

                    </View>
                  ) : (
                    /* Normal state */
                    <TouchableOpacity
                      style={styles.changeButton}
                      onPress={() =>
                        startEditing(manager.id)
                      }
                      activeOpacity={0.8}
                    >
                      <Lock
                        size={18}
                        color={Colors.gold}
                      />

                      <Text style={styles.changeButtonText}>
                        CHANGE PIN
                      </Text>
                    </TouchableOpacity>
                  )}

                </View>
              );
            })
          )}

          <View style={styles.bottomSpacer} />

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
    gap: 12,
  },

  backButton: {
    padding: 6,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '800' as const,
  },

  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 24,
    paddingBottom: 60,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },

  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  infoText: {
    flex: 1,
  },

  infoTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800' as const,
  },

  infoDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800' as const,
    flex: 1,
  },

  sectionCount: {
    color: Colors.textSecondary,
    fontSize: 13,
  },

  managerCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },

  managerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  managerIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  managerInfo: {
    flex: 1,
  },

  managerName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800' as const,
  },

  managerStatus: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },

  changeButton: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  changeButtonText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '800' as const,
  },

  editSection: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 18,
  },

  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700' as const,
    marginBottom: 7,
    marginTop: 10,
  },

  pinInput: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: Colors.text,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 6,
  },

  editButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  cancelText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '800' as const,
  },

  saveButton: {
    flex: 1,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  saveText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800' as const,
  },

  disabledButton: {
    opacity: 0.6,
  },

  emptyBox: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  emptyTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800' as const,
  },

  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },

  bottomSpacer: {
    height: 30,
  },
});