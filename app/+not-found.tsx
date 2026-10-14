import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.container}>
      <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />
      <View style={styles.content}>
        <AlertCircle size={64} color={Colors.textMuted} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.text}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 16,
  },
  text: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  link: {
    marginTop: 24,
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});
