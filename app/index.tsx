import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Gavel, Shield, User, Eye } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuction } from '@/contexts/AuctionContext';

export default function RoleSelectionScreen() {
  const router = useRouter();
  
  const { loginViewer } = useAuction();

  const handleRolePress = (role: string) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  if (role === 'admin') {
    router.push('/admin-login');
    return;
  }

  if (role === 'manager') {
    router.push('/manager-login');
    return;
  }

  if (role === 'viewer') {
    loginViewer();
    router.push('/viewer');
    return;
  }
};

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>

          <View style={styles.header}>
            <Gavel size={64} color={Colors.gold} />

            <Text style={styles.title}>
              Player Auction
            </Text>

            <Text style={styles.subtitle}>
              Choose how you want to enter the auction
            </Text>
          </View>

          <View style={styles.roles}>

            {/* ADMIN */}
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => handleRolePress('admin')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: Colors.accent + '30' },
                ]}
              >
                <Shield size={32} color={Colors.accent} />
              </View>

              <View style={styles.roleText}>
                <Text style={styles.roleTitle}>
                  Admin
                </Text>

                <Text style={styles.roleDescription}>
                  Manage the auction, players, managers and settings
                </Text>
              </View>
            </TouchableOpacity>

            {/* MANAGER */}
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => handleRolePress('manager')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: Colors.money + '30' },
                ]}
              >
                <User size={32} color={Colors.money} />
              </View>

              <View style={styles.roleText}>
                <Text style={styles.roleTitle}>
                  Manager
                </Text>

                <Text style={styles.roleDescription}>
                  View your budget, squad and remaining players
                </Text>
              </View>
            </TouchableOpacity>

            {/* VIEWER */}
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => handleRolePress('viewer')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: Colors.gold + '30' },
                ]}
              >
                <Eye size={32} color={Colors.gold} />
              </View>

              <View style={styles.roleText}>
                <Text style={styles.roleTitle}>
                  Viewer
                </Text>

                <Text style={styles.roleDescription}>
                  Watch the auction and follow the results
                </Text>
              </View>
            </TouchableOpacity>

          </View>

          <Text style={styles.footer}>
            Select your role to continue
          </Text>

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
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 45,
  },

  title: {
    fontSize: 38,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: 18,
  },

  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },

  roles: {
    gap: 16,
  },

  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },

  roleText: {
    flex: 1,
  },

  roleTitle: {
    fontSize: 21,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 5,
  },

  roleDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  footer: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 30,
  },
});