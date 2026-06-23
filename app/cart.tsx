import React from "react";
import { GatedStub } from "@/components/ui";
import { FEATURES } from "@/config/features";

// Flagged OFF until Catalog-Read ships and orders reaches GA (spec §5/§12).
export default function Cart() {
  return <GatedStub title="Cart" requires={FEATURES.cart.requires} />;
}
