export const proFeatures = {
  unlimitedVehicles: false,
  automatedPriceDrops: false,
  advancedPassportExports: false,
} as const;

export type ProFeature = keyof typeof proFeatures;

export const proFeatureLabels: Record<ProFeature, string> = {
  unlimitedVehicles: "Unlimited vehicles",
  automatedPriceDrops: "Automated price drops",
  advancedPassportExports: "Advanced PDF exports",
};
