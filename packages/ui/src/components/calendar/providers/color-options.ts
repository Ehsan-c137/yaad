export interface ColorOption {
  name: string;
  dot: string;
  bg: string;
  border: string;
  text: string;
}

export const CALENDAR_COLOR_OPTIONS: ColorOption[] = [
  {
    name: "Blue",
    dot: "#3b82f6",
    bg: "rgba(219, 234, 254, 0.9)",
    border: "rgba(147, 197, 253, 0.8)",
    text: "#1d4ed8",
  },
  {
    name: "Purple",
    dot: "#8b5cf6",
    bg: "rgba(237, 233, 254, 0.9)",
    border: "rgba(196, 181, 253, 0.8)",
    text: "#6d28d9",
  },
  {
    name: "Emerald",
    dot: "#10b981",
    bg: "rgba(209, 250, 229, 0.9)",
    border: "rgba(167, 243, 208, 0.8)",
    text: "#047857",
  },
  {
    name: "Orange",
    dot: "#f97316",
    bg: "rgba(255, 237, 213, 0.9)",
    border: "rgba(254, 215, 170, 0.8)",
    text: "#c2410c",
  },
  {
    name: "Pink",
    dot: "#ec4899",
    bg: "rgba(252, 231, 243, 0.9)",
    border: "rgba(251, 207, 232, 0.8)",
    text: "#be185d",
  },
  {
    name: "Amber",
    dot: "#f59e0b",
    bg: "rgba(254, 243, 199, 0.95)",
    border: "rgba(253, 230, 138, 0.9)",
    text: "#b45309",
  },
];
