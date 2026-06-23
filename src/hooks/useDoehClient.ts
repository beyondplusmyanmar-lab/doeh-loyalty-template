import { useMemo } from "react";
import { useCredentials } from "@/store/credentials";
import { makeClient, type LoyaltyClient } from "@/api/client";
import { getMockClient } from "@/api/mockClient";
import { MOCK } from "@/config/env";

/**
 * The configured client, or null when no bearer has been set yet. In mock mode
 * (`EXPO_PUBLIC_DOEH_MODE=mock`) it returns the in-memory mock and ignores the key.
 */
export function useDoehClient(): LoyaltyClient | null {
  const { apiKey, environment } = useCredentials();
  return useMemo(() => {
    if (MOCK) return getMockClient();
    return apiKey ? makeClient(apiKey, environment) : null;
  }, [apiKey, environment]);
}
