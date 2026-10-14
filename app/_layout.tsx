import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuctionProvider } from '@/contexts/AuctionContext';
import Colors from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.text,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="admin-login" options={{ headerShown: false }} />
      <Stack.Screen name="manager-login" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="manager" options={{ headerShown: false }} />
      <Stack.Screen name="viewer" options={{ headerShown: false }} />

      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="players"
        options={{
          title: 'Player Pool',
          presentation: 'card',
        }}
      />

      <Stack.Screen
        name="auction"
        options={{
          title: 'Auction Room',
          presentation: 'card',
        }}
      />

      <Stack.Screen
        name="results"
        options={{
          title: 'Results',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuctionProvider>
          <RootLayoutNav />
        </AuctionProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
