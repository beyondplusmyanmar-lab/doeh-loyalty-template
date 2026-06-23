import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import type { Environment } from "@beyondplusmm/doehpos-sdk";
import { BUILD_ENVIRONMENT, PREFILL_API_KEY } from "@/config/env";

// The bearer is the ONLY credential. There is no shop/org concept — the key
// itself determines which shop you act as (spec §3). It lives in the device
// secure store (Keychain / Keystore), never in plain storage.
//
// Environment is fixed by the BUILD (EXPO_PUBLIC_ENV / eas.json profile), not a
// user toggle: a published merchant app targets exactly one environment.
const K_KEY = "doeh.apiKey";

interface CredentialsState {
  apiKey: string | null;
  environment: Environment;
  loaded: boolean;
  save: (apiKey: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CredentialsContext = createContext<CredentialsState | null>(null);

export function CredentialsProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync(K_KEY);
      setApiKey(stored ?? (PREFILL_API_KEY || null));
      setLoaded(true);
    })();
  }, []);

  const save = async (key: string) => {
    await SecureStore.setItemAsync(K_KEY, key);
    setApiKey(key);
  };

  const clear = async () => {
    await SecureStore.deleteItemAsync(K_KEY);
    setApiKey(null);
  };

  return (
    <CredentialsContext.Provider
      value={{ apiKey, environment: BUILD_ENVIRONMENT, loaded, save, clear }}
    >
      {children}
    </CredentialsContext.Provider>
  );
}

export function useCredentials(): CredentialsState {
  const ctx = useContext(CredentialsContext);
  if (!ctx) throw new Error("useCredentials must be used within a CredentialsProvider");
  return ctx;
}
