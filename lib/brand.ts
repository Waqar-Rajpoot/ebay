/** Brand text used across auth screens. Edit here instead of inside components. */
export const BRAND = {
  NAME: "eBay Automations",
  TAGLINE: "Run your eBay store on autopilot.",
  DESCRIPTION:
    "Save hours every week by automating the repetitive work behind your listings and orders.",
  PANEL_FOOTNOTE: "Sign in securely with your Google account.",
} as const;

export const SIGN_IN_COPY = {
  HEADING: "Welcome back",
  SUBHEADING: "Sign in to manage your eBay automations.",
  LEGAL: "By continuing, you agree to our Terms of Service and Privacy Policy.",
} as const;

export interface BrandHighlight {
  title: string;
  description: string;
}

export const BRAND_HIGHLIGHTS: readonly BrandHighlight[] = [
  {
    title: "Automated relisting",
    description: "Keep unsold items live without lifting a finger.",
  },
  {
    title: "Smart repricing",
    description: "Adjust prices on your rules, around the clock.",
  },
  {
    title: "Order and inventory sync",
    description: "One dashboard for every sale and stock level.",
  },
];