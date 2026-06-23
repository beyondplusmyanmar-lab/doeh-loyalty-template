import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useCredentials } from "@/store/credentials";
import { useEarnPoints, useMember, useRedeemPoints } from "@/hooks/useLoyalty";
import { getMockAdmin } from "@/api/mockClient";
import { MOCK, BROKER_URL } from "@/config/env";
import pkg from "../package.json";
import { Body, Button, Card, Field, Muted, Pill, Screen, Title, colors } from "@/components/ui";

// Tiers are a CLIENT-SIDE DEMO only — the DOEH loyalty API exposes balance +
// ledger, not tiers. Shown here to illustrate how a merchant might derive a tier
// locally. Not a platform concept; do not treat it as authoritative.
const TIERS = [
  { name: "Gold", min: 2000 },
  { name: "Silver", min: 500 },
  { name: "Bronze", min: 0 },
];
const tierFor = (balance: number) => TIERS.find((t) => balance >= t.min)?.name ?? "Bronze";

interface LedgerEntry {
  id?: string;
  type?: "earn" | "redeem";
  points?: number;
  reason?: string;
  at?: string;
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" | "muted" }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Muted>{label}</Muted>
      <Pill text={value} tone={tone ?? "muted"} />
    </View>
  );
}

export default function Developer() {
  const { environment } = useCredentials();
  const isProd = environment === "production";
  const qc = useQueryClient();

  const [memberId, setMemberId] = useState("MEM001");
  const member = useMember(memberId);
  const earn = useEarnPoints();
  const redeem = useRedeemPoints();

  // Developer tools are not for end users — disabled in production builds.
  if (isProd && !MOCK) {
    return (
      <Screen>
        <Card>
          <Title>Developer Tools</Title>
          <Body color={colors.muted}>Disabled in production builds.</Body>
        </Card>
      </Screen>
    );
  }

  const balance = member.data?.account.balance;
  const ledger = (member.data?.account.ledger as LedgerEntry[] | undefined) ?? [];

  const refresh = () => qc.invalidateQueries({ queryKey: ["member", memberId] });
  const seed = (b: number) => {
    getMockAdmin().seed(memberId, b);
    refresh();
  };
  const reset = () => {
    getMockAdmin().reset();
    qc.invalidateQueries({ queryKey: ["member"] });
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }}>
      <Screen>
        <Card>
          <Title>Sandbox Inspector</Title>
          <Muted>Developer-only. Not shown in production builds.</Muted>
        </Card>

        {/* 1 — Environment */}
        <Card>
          <Title>Environment</Title>
          <Row label="Mode" value={MOCK ? "mock" : environment} tone={MOCK ? "warn" : "good"} />
          <Row label="SDK (declared)" value={String(pkg.dependencies["@beyondplusmm/doehpos-sdk"])} />
          <Row label="Sandbox" value={MOCK || environment === "sandbox" ? "yes" : "no"} tone="good" />
          <Row label="Broker" value={BROKER_URL ? "configured" : "—"} tone={BROKER_URL ? "good" : "muted"} />
        </Card>

        {/* 2 — Member */}
        <Card>
          <Title>Member</Title>
          <Field label="Member id" value={memberId} onChangeText={setMemberId} autoCapitalize="none" placeholder="MEM001" />
          <Button title="Refresh" variant="ghost" loading={member.isFetching} onPress={refresh} />
          {member.data ? (
            <>
              <Row label="Balance" value={`${balance} pts`} tone="good" />
              <Row label="Tier (demo)" value={tierFor(balance ?? 0)} />
              <Muted>Tier is a client-side example, not part of the loyalty API.</Muted>
            </>
          ) : member.error ? (
            <Body color={colors.warn}>No such member yet — seed or earn to create it.</Body>
          ) : null}
        </Card>

        {/* 3 — Transactions */}
        <Card>
          <Title>Transactions</Title>
          {ledger.length === 0 ? (
            <Muted>No ledger entries.</Muted>
          ) : (
            ledger.map((e, i) => (
              <View key={e.id ?? i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Muted>
                  {e.type ?? "—"}
                  {e.reason ? ` · ${e.reason}` : ""}
                </Muted>
                <Body color={e.type === "redeem" ? colors.warn : colors.good}>
                  {e.type === "redeem" ? "-" : "+"}
                  {e.points ?? 0}
                </Body>
              </View>
            ))
          )}
        </Card>

        {/* 4 — Developer actions (MOCK ONLY) */}
        {MOCK ? (
          <Card>
            <Title>Developer actions</Title>
            <Muted>Mock only — these manipulate in-memory state.</Muted>
            <Button title="Add 100 pts" onPress={() => earn.mutate({ memberId, input: { points: 100, reason: "inspector" } })} loading={earn.isPending} />
            <Button title="Redeem 25 pts" variant="ghost" onPress={() => redeem.mutate({ memberId, input: { points: 25, reason: "inspector" } })} loading={redeem.isPending} />
            <Button title="Seed Silver (750)" variant="ghost" onPress={() => seed(750)} />
            <Button title="Seed Gold (2500)" variant="ghost" onPress={() => seed(2500)} />
            <Button title="Reset mock state" variant="danger" onPress={reset} />
          </Card>
        ) : (
          <Card>
            <Muted>Read-only against the {environment} API. Run in mock mode for seed/reset actions.</Muted>
          </Card>
        )}
      </Screen>
    </ScrollView>
  );
}
