import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { brand } from "@/config/brand";

// Primary / bg / card come from brand.json (the white-label swap); the semantic
// status colours stay fixed so success/warn/error read consistently.
export const colors = {
  bg: brand.colors.bg,
  card: brand.colors.card,
  border: "#27314d",
  text: "#e7ecf5",
  muted: "#8b97b3",
  primary: brand.colors.primary,
  good: "#3ecf8e",
  warn: "#ffb454",
  bad: "#ff6b6b",
};

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Body({ children, color }: { children: React.ReactNode; color?: string }) {
  return <Text style={[styles.body, color ? { color } : null]}>{children}</Text>;
}

export function Field({ label, ...props }: { label: string } & TextInputProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} style={styles.input} {...props} />
    </View>
  );
}

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "ghost" | "danger";
}) {
  const bg =
    variant === "primary" ? colors.primary : variant === "danger" ? colors.bad : "transparent";
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.btn,
        { backgroundColor: bg, opacity: isDisabled ? 0.5 : 1 },
        variant === "ghost" ? styles.btnGhost : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? colors.text : "#06122e"} />
      ) : (
        <Text style={[styles.btnText, variant === "ghost" ? { color: colors.text } : null]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function Pill({ text, tone = "muted" }: { text: string; tone?: "good" | "warn" | "muted" }) {
  const color = tone === "good" ? colors.good : tone === "warn" ? colors.warn : colors.muted;
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={{ color, fontSize: 12, fontWeight: "600" }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16, gap: 14 },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
  body: { color: colors.text, fontSize: 15, lineHeight: 21 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  label: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  input: {
    backgroundColor: "#0e1424",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  btn: { borderRadius: 10, paddingVertical: 13, alignItems: "center", justifyContent: "center" },
  btnGhost: { borderWidth: 1, borderColor: colors.border },
  btnText: { color: "#06122e", fontSize: 15, fontWeight: "700" },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
});

// A shared stub for capabilities gated on a future platform epic (spec §5).
export function GatedStub({ title, requires }: { title: string; requires: string }) {
  return (
    <Screen>
      <Card>
        <Title>{title}</Title>
        <Pill text="not available yet" tone="warn" />
        <Body color={colors.muted}>{requires}</Body>
        <Muted>
          This screen is part of the frame but intentionally makes no API calls —
          there is no platform surface behind it yet. It turns on when its epic ships.
        </Muted>
      </Card>
    </Screen>
  );
}
