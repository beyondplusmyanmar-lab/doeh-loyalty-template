import React from "react";
import { GatedStub } from "@/components/ui";
import { FEATURES } from "@/config/features";

// Flagged OFF until the Catalog-Read platform epic ships (spec §5/§12).
export default function Catalog() {
  return <GatedStub title="Shop" requires={FEATURES.catalog.requires} />;
}
