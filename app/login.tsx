import React from "react";
import { GatedStub } from "@/components/ui";
import { FEATURES } from "@/config/features";

// Flagged OFF until the Consumer-Identity platform epic ships (spec §5/§12).
export default function Login() {
  return <GatedStub title="Sign in" requires={FEATURES.login.requires} />;
}
