import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
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
import { User, ArrowLeft, LogIn, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuction } from '@/contexts/AuctionContext';

export default function ManagerLoginScreen() {
  const router = useRouter();
  const { managers, loginManager } = useAuction();

  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(
    null
  );
  const [pin, setPin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const selectedManager = managers.find(
    (manager) => manager.id === selectedManagerId
  );

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Login Failed', message);
    }
  };

  const handleSelectManager = (managerId: string) => {
    setSelectedManagerId(managerId);
    setPin('');
  };

  const handleLogin = async () => {
    if (!selectedManager) {
      showError('Please select a manager first.');
      return;
    }

    if (!pin || pin.length !== 4) {
      showError('Please enter your 4-digit PIN.');
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      showError('PIN must contain exactly 4 digits.');
      return;
    }

    if (!supabase) {
      showError('Database connection is not available.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const { data, error } = await supabase.rpc(
        'verify_manager_pin',
        {
          p_manager_id: selectedManager.id,
          p_pin: pin,
        }
      );

      if (error) {
        console.error('PIN verification error:', error);

        showError(
          'Unable to verify PIN. Please check your connection and try again.'
        );

        return;
      }

      if (!data) {
        showError('Incorrect PIN.');
        setPin('');
        return;
      }

      // PIN is correct.
      loginManager(selectedManager.id);
      router.push('/manager');
    } catch (error) {
      console.error('Manager login error:', error);

      showError(
        'Something went wrong while logging in. Please try again.'
      );
    } finally {
      setIsLoggingIn(false);
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
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>Manager Login</Text>

            <Text style={styles.subtitle}>
              Select your manager
            </Text>
          </View>
        </View>

        {/* Scrollable content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >

          {/* Manager list */}
          <View style={styles.managerList}>
            {managers.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  No managers have been configured yet.
                </Text>

                <Text style={styles.emptySubtext}>
                  An admin needs to set up the managers first.
                </Text>
              </View>
            ) : (
              managers.map((manager) => {
                const selected = manager.id === selectedManagerId;

                return (
                  <TouchableOpacity
                    key={manager.id}
                    style={[
                      styles.managerCard,
                      selected && styles.managerCardSelected,
                    ]}
                    onPress={() => handleSelectManager(manager.id)}
                    activeOpacity={0.8}
                  >

                    {/* Manager icon */}
                    <View
                      style={[
                        styles.managerIcon,
                        {
                          backgroundColor:
                            manager.color + '30',
                        },
                      ]}
                    >
                      <User
                        size={28}
                        color={manager.color}
                      />
                    </View>

                    {/* Manager information */}
                    <View style={styles.managerInfo}>
                      <Text style={styles.managerName}>
                        {manager.name}
                      </Text>

                      <Text style={styles.teamName}>
                        {manager.teamName || manager.name}
                      </Text>

                      <Text style={styles.managerPlayers}>
                        Select this manager to continue
                      </Text>
                    </View>

                    {/* Selected indicator */}
                    {selected && (
                      <View style={styles.checkIcon}>
                        <Check
                          size={20}
                          color={Colors.primary}
                        />
                      </View>
                    )}

                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Login section */}
          {selectedManager && (
            <View style={styles.loginSection}>

              <Text style={styles.loginTitle}>
                Login as {selectedManager.name}
              </Text>

              <TextInput
                style={styles.pinInput}
                value={pin}
                onChangeText={(value) => {
                  // Only allow numbers
                  const numericValue = value.replace(/\D/g, '');
                  setPin(numericValue);
                }}
                placeholder="Enter 4-digit PIN"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={4}
                onSubmitEditing={handleLogin}
                returnKeyType="done"
                editable={!isLoggingIn}
              />

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoggingIn && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={isLoggingIn}
              >

                <LogIn
                  size={20}
                  color={Colors.primary}
                />

                <Text style={styles.loginButtonText}>
                  {isLoggingIn ? 'VERIFYING...' : 'LOGIN'}
                </Text>

              </TouchableOpacity>

            </View>
          )}

          {/* Extra bottom spacing */}
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

  scrollView: {
    flex: 1,
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
    marginRight: 14,
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

  content: {
    padding: 24,
    paddingBottom: 60,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
  },

  managerList: {
    gap: 12,
  },

  managerCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  managerCardSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.cardBgLight,
  },

  managerIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
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
    fontWeight: '700' as const,
  },

  teamName: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '700' as const,
    marginTop: 2,
  },

  managerPlayers: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },

  checkIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginSection: {
    marginTop: 24,
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  loginTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 14,
  },

  pinInput: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 6,
  },

  loginButton: {
    marginTop: 14,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800' as const,
  },

  emptyBox: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },

  emptyText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
    textAlign: 'center',
  },

  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },

  bottomSpacer: {
    height: 30,
  },
});