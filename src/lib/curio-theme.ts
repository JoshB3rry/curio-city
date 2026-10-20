import { createTheme } from "@openuidev/react-ui";

// Curio.city theme — warm, quiet, editorial. Cream paper, deep pine green,
// serif headings. Inspired by proactiv.work's calm start-page aesthetic,
// adapted for a chatbot interface.

export const curioLight = createTheme({
  background: "oklch(0.974 0.011 84.6)", // warm cream
  foreground: "oklch(1.000 0.000 89.9)", // white cards
  sunk: "oklch(0.944 0.018 86.1)", // pale parchment
  elevated: "oklch(1.000 0.000 89.9)",

  textNeutralPrimary: "oklch(0.237 0.016 160.6)", // green-charcoal ink
  textNeutralSecondary: "oklch(0.615 0.019 84.6)", // warm mid-grey
  textNeutralTertiary: "oklch(0.615 0.019 84.6)",

  interactiveAccentDefault: "oklch(0.382 0.060 165.1)", // deep pine
  interactiveAccentHover: "oklch(0.311 0.045 169.7)", // deeper pine
  interactiveAccentPressed: "oklch(0.311 0.045 169.7)",
  textAccentPrimary: "oklch(0.974 0.011 84.6)", // cream text on pine

  borderDefault: "oklch(0.900 0.020 85.0)", // warm hairline
  borderAccent: "oklch(0.698 0.045 149.3)", // sage

  chatUserResponseBg: "oklch(0.382 0.060 165.1)", // pine user bubbles
  chatUserResponseText: "oklch(0.974 0.011 84.6)",

  fontHeading: '"Playfair Display", Georgia, "Times New Roman", serif',
  fontBody: '"Inter", -apple-system, "Segoe UI", sans-serif',

  // Compound heading tokens must be overridden directly — the welcome title
  // uses --openui-text-heading-md, not fontHeading.
  textHeadingXs: '500 16px/1.25 "Playfair Display", Georgia, serif',
  textHeadingSm: '500 18px/1.25 "Playfair Display", Georgia, serif',
  textHeadingMd: '500 24px/1.25 "Playfair Display", Georgia, serif',
  textHeadingLg: '500 28px/1.15 "Playfair Display", Georgia, serif',
  textHeadingXl: '600 32px/1.1 "Playfair Display", Georgia, serif',

  radiusM: "14px",
  radiusL: "18px",
});

export const curioDark = createTheme({
  background: "oklch(0.201 0.014 61.7)", // warm ember brown-black
  foreground: "oklch(0.248 0.016 71.3)", // dark chocolate-charcoal cards
  sunk: "oklch(0.180 0.013 60.0)",
  elevated: "oklch(0.280 0.017 72.0)",

  textNeutralPrimary: "oklch(0.940 0.019 80.1)", // warm cream
  textNeutralSecondary: "oklch(0.736 0.029 81.4)", // warm taupe
  textNeutralTertiary: "oklch(0.622 0.024 76.4)", // dim meta

  interactiveAccentDefault: "oklch(0.842 0.103 158.3)", // bright mint
  interactiveAccentHover: "oklch(0.880 0.095 158.0)",
  interactiveAccentPressed: "oklch(0.790 0.100 158.5)",
  textAccentPrimary: "oklch(0.201 0.014 61.7)", // dark text on mint

  borderDefault: "oklch(0.326 0.018 74.0)", // subtle warm border
  borderAccent: "oklch(0.842 0.103 158.3)",

  chatUserResponseBg: "oklch(0.842 0.103 158.3)", // mint user bubbles
  chatUserResponseText: "oklch(0.201 0.014 61.7)",

  fontHeading: '"Playfair Display", Georgia, "Times New Roman", serif',
  fontBody: '"Inter", -apple-system, "Segoe UI", sans-serif',

  textHeadingXs: '500 16px/1.25 "Playfair Display", Georgia, serif',
  textHeadingSm: '500 18px/1.25 "Playfair Display", Georgia, serif',
  textHeadingMd: '500 24px/1.25 "Playfair Display", Georgia, serif',
  textHeadingLg: '500 28px/1.15 "Playfair Display", Georgia, serif',
  textHeadingXl: '600 32px/1.1 "Playfair Display", Georgia, serif',

  radiusM: "14px",
  radiusL: "18px",
});
