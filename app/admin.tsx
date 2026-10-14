import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Shield,
  Users,
  Gavel,
  ArrowLeft,
  LogOut,
  Settings,
  LockKeyhole,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuction } from '@/contexts/AuctionContext';

export default function AdminDashboard() {
  const router = useRouter();
  const { session, logout } = useAuction();

  if (session?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.center}>
          <Text style={styles.errorTitle}>Admin Access Required</Text>

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

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/')}
            style={styles.backButton}
          >
            <ArrowLeft
              size={24}
              color={Colors.text}
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Admin Dashboard
            </Text>

            <Text style={styles.subtitle}>
              Full auction control
            </Text>
          </View>

          <View style={styles.adminBadge}>
            <Shield
              size={18}
              color={Colors.gold}
            />

            <Text style={styles.adminBadgeText}>
              ADMIN
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <LogOut
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* ADMIN OPTIONS */}
        <View style={styles.content}>

          {/* AUCTION SETUP */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/team-management')}
          >
            <View style={styles.iconBox}>
              <Settings
                size={30}
                color={Colors.gold}
              />
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>
                Team Management
              </Text>

              <Text style={styles.cardDescription}>
                Add, edit and remove managers, teams and budgets
              </Text>
            </View>
          </TouchableOpacity>

          {/* MANAGE PLAYERS */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/players')}
          >
            <View style={styles.iconBox}>
              <Users
                size={30}
                color={Colors.gold}
              />
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>
                Manage Players
              </Text>

              <Text style={styles.cardDescription}>
                Import, add and remove auction players
              </Text>
            </View>
          </TouchableOpacity>

          {/* AUCTION ROOM */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/auction')}
          >
            <View style={styles.iconBox}>
              <Gavel
                size={30}
                color={Colors.gold}
              />
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>
                Auction Room
              </Text>

              <Text style={styles.cardDescription}>
                Control bidding, sales and re-auctions
              </Text>
            </View>
          </TouchableOpacity>

          {/* MANAGERS */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/managers')}
          >
            <View style={styles.iconBox}>
              <Users
                size={30}
                color={Colors.gold}
              />
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>
                Managers
              </Text>

              <Text style={styles.cardDescription}>
                View all manager budgets and squads
              </Text>
            </View>
          </TouchableOpacity>

          {/* MANAGER PINS */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/manager-pins')}
          >
            <View style={styles.iconBox}>
              <LockKeyhole
                size={30}
                color={Colors.gold}
              />
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>
                Manager PINs
              </Text>

              <Text style={styles.cardDescription}>
                Set and change individual manager login PINs
              </Text>
            </View>
          </TouchableOpacity>

        </View>
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

  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },

  adminBadgeText: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '800' as const,
  },

  logoutButton: {
    padding: 8,
  },

  content: {
    padding: 24,
    gap: 16,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 15,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },

  cardText: {
    flex: 1,
  },

  cardTitle: {
    color: Colors.text,
    fontSize: 19,
    fontWeight: '800' as const,
  },

  cardDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
});