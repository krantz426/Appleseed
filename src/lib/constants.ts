export const APP_NAME = "Appleseed";

export const PLATFORM_FEE_PERCENT = 5;

/** Preset contribution amounts in cents */
export const PRESET_AMOUNTS = [1000, 1500, 2000, 2500] as const;

export const OCCASIONS = [
  "End of Year",
  "Teacher Appreciation Week",
  "Holiday Season",
  "Birthday",
  "Back to School",
  "Retirement",
  "Thank You",
  "Other",
] as const;

export type Occasion = (typeof OCCASIONS)[number];
