import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CredentialsProvider } from "@/store/credentials";
import { brand } from "@/config/brand";
import { colors } from "@/components/ui";

const queryClient = new QueryClient({
  defaultOptions: {
    // The SDK owns transport/429 retries; don't double-retry at the query layer.
    queries: { retry: false, staleTime: 5_000 },
    mutations: { retry: false },
  },
});

const screenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTitleStyle: { color: colors.text },
  headerTintColor: colors.primary,
  contentStyle: { backgroundColor: colors.bg },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <CredentialsProvider>
          <StatusBar style="light" />
          <Stack screenOptions={screenOptions}>
            <Stack.Screen name="index" options={{ title: brand.name }} />
            <Stack.Screen name="loyalty" options={{ title: "Rewards" }} />
            <Stack.Screen name="settings" options={{ title: "Settings" }} />
            <Stack.Screen name="developer" options={{ title: "Developer Tools" }} />
            <Stack.Screen name="login" options={{ title: "Sign in" }} />
            <Stack.Screen name="catalog" options={{ title: "Shop" }} />
            <Stack.Screen name="cart" options={{ title: "Cart" }} />
          </Stack>
        </CredentialsProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
