import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useCredentials } from "@/store/credentials";
import { MOCK } from "@/config/env";
import { Body, Button, Card, Field, Muted, Pill, Screen, Title, colors } from "@/components/ui";

export default function Settings() {
  const router = useRouter();
  const { apiKey, environment, save, clear } = useCredentials();
  const [keyInput, setKeyInput] = useState(apiKey ?? "");
  const [saving, setSaving] = useState(false);

  const isProd = environment === "production";
  // Honest guard: a test key won't work in a production build, and a live key
  // must never be pasted into the app at all (it belongs in the broker — §3).
  const warn = keyInput.startsWith("sk_live_")
    ? "Never paste an sk_live_ key into the app. It belongs in your token broker (see docs/PRODUCTION.md)."
    : isProd && keyInput.startsWith("sk_test_")
      ? "A test key will be rejected by a production build (API_KEY_ENV_MISMATCH)."
      : null;

  const onSave = async () => {
    setSaving(true);
    try {
      await save(keyInput.trim());
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }}>
      <Screen>
        {MOCK ? (
          <Card>
            <Title>Mock mode</Title>
            <Body>
              <Pill text="mock" tone="warn" /> No key needed — loyalty calls are served
              by an in-memory mock.
            </Body>
            <Muted>
              Unset EXPO_PUBLIC_DOEH_MODE to talk to the real sandbox/production API.
            </Muted>
          </Card>
        ) : null}
        <Card>
          <Title>Environment</Title>
          <Body>
            This build targets{" "}
            <Pill text={environment} tone={isProd ? "warn" : "good"} />.
          </Body>
          <Muted>
            Environment is fixed at build time (EXPO_PUBLIC_ENV / eas.json), not toggled in-app —
            a published app targets exactly one environment.
          </Muted>
        </Card>

        {isProd ? (
          <Card>
            <Title>Production sign-in</Title>
            <Body color={colors.warn}>
              Production uses your token broker — the app never holds an sk_live_ key.
            </Body>
            <Muted>
              Set EXPO_PUBLIC_BROKER_URL and wire the broker sign-in (M5). See docs/PRODUCTION.md.
            </Muted>
          </Card>
        ) : (
          <Card>
            <Title>Sandbox key</Title>
            <Muted>
              Paste your sk_test_ key. Stored in the device secure store (Keychain / Keystore),
              never logged. Sandbox data is isolated and reset daily.
            </Muted>
            <Field
              label="sk_test_ key"
              value={keyInput}
              onChangeText={setKeyInput}
              placeholder="sk_test_…"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            {warn ? <Body color={colors.warn}>{warn}</Body> : null}
            <Button title="Save" onPress={onSave} loading={saving} disabled={!keyInput.trim()} />
            <Button
              title="Clear key"
              variant="danger"
              onPress={() => {
                clear();
                setKeyInput("");
              }}
            />
          </Card>
        )}
      </Screen>
    </ScrollView>
  );
}
