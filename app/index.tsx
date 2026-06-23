import React from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useCredentials } from "@/store/credentials";
import { brand } from "@/config/brand";
import { FEATURES } from "@/config/features";
import { MOCK } from "@/config/env";
import { Body, Button, Card, Muted, Pill, Screen, Title, colors } from "@/components/ui";

export default function Home() {
  const router = useRouter();
  const { apiKey, environment, loaded } = useCredentials();
  const configured = MOCK || Boolean(apiKey);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }}>
      <Screen>
        <Card>
          <Title>{brand.name}</Title>
          <Muted>{brand.tagline}</Muted>
          <Body>
            Environment:{" "}
            <Pill text={environment} tone={environment === "production" ? "warn" : "good"} />
          </Body>
          <Body>
            Key:{" "}
            {MOCK ? (
              <Pill text="mock mode" tone="warn" />
            ) : configured ? (
              <Pill text={`${apiKey!.slice(0, 11)}…`} tone="good" />
            ) : (
              <Pill text="not set" tone="warn" />
            )}
          </Body>
        </Card>

        <Card>
          <Title>Rewards</Title>
          {MOCK ? (
            <Muted>Mock mode — points are in-memory, no key or network needed.</Muted>
          ) : !configured && loaded ? (
            <Body color={colors.warn}>Set your sandbox key in Settings first.</Body>
          ) : null}
          <Button
            title="Open rewards"
            onPress={() => router.push("/loyalty")}
            disabled={!configured}
          />
          <Button title="Settings" variant="ghost" onPress={() => router.push("/settings")} />
        </Card>

        {/* Gated capabilities — visible frame, no calls behind them (spec §5). */}
        <Card>
          <Title>Coming with the platform</Title>
          <Muted>
            These are flagged off until their platform capability ships. Tapping shows what's
            required — nothing here calls an endpoint that doesn't exist.
          </Muted>
          <Button
            title={`Sign in${FEATURES.login.enabled ? "" : " (soon)"}`}
            variant="ghost"
            onPress={() => router.push("/login")}
          />
          <Button
            title={`Shop${FEATURES.catalog.enabled ? "" : " (soon)"}`}
            variant="ghost"
            onPress={() => router.push("/catalog")}
          />
          <Button
            title={`Cart${FEATURES.cart.enabled ? "" : " (soon)"}`}
            variant="ghost"
            onPress={() => router.push("/cart")}
          />
        </Card>
      </Screen>
    </ScrollView>
  );
}
