import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, ArrowLeft, LogIn } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuction } from '@/contexts/AuctionContext';

const ADMIN_PASSWORD = 'UG3PU';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { loginAdmin } = useAuction();
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      loginAdmin();
      router.replace('/admin');
      return;
    }

    if (Platform.OS === 'web') {
      window.alert('Incorrect admin password.');
    } else {
      Alert.alert('Login Failed', 'Incorrect admin password.');
    }

    setPassword('');
  };

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={Colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.loginCard}>

            <View style={styles.iconContainer}>
              <Shield size={48} color={Colors.gold} />
            </View>

            <Text style={styles.title}>
              Admin Login
            </Text>

            <Text style={styles.subtitle}>
              Enter the administrator password to continue.
            </Text>

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Admin password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <LogIn size={20} color={Colors.primary} />
              <Text style={styles.loginButtonText}>
                LOGIN
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },

  backButton: {
    position: 'absolute',
    top: 25,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },

  backText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600' as const,
  },

  loginCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: Colors.text,
  },

  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },

  input: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 16,
  },

  loginButton: {
    width: '100%',
    marginTop: 16,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  loginButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800' as const,
  },
});