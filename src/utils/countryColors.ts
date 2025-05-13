// Fixed palette for the most common countries
const palette: string[] = [
  // From Sasha Trubetskoy's list (20 colors)
  '#e6194b', // Red
  '#3cb44b', // Green
  '#ffe119', // Yellow
  '#4363d8', // Blue
  '#f58231', // Orange
  '#911eb4', // Purple
  '#46f0f0', // Cyan
  '#f032e6', // Magenta
  '#bcf60c', // Lime
  '#fabebe', // Pink
  '#008080', // Teal
  '#e6beff', // Lavender
  '#9a6324', // Brown
  '#fffac8', // Beige
  '#800000', // Maroon
  '#aaffc3', // Mint
  '#808000', // Olive
  '#ffd8b1', // Apricot
  '#000075', // Navy
  '#808080', // Grey

  // Additional distinct colors (10 more)
  '#FF6B6B', // Light Red
  '#FFD700', // Gold
  '#6A5ACD', // Slate Blue
  '#FF7F50', // Coral
  '#D2691E', // Chocolate
  '#00FF7F', // Spring Green
  '#DC143C', // Crimson
  '#C71585', // Medium Violet Red
  '#20B2AA', // Light Sea Green
  '#FF4500', // Orange Red
];

const isoToPaletteIndex: { [iso: string]: number } = {};
let paletteIndex = 0;

export function getCountryColor(iso: string): string {
  if (!isoToPaletteIndex[iso]) {
    if (paletteIndex < palette.length) {
      isoToPaletteIndex[iso] = paletteIndex++;
    } else {
      // Hash fallback for more countries
      let hash = 0;
      for (let i = 0; i < iso.length; i++) {
        hash = iso.charCodeAt(i) + ((hash << 5) - hash);
      }
      isoToPaletteIndex[iso] = Math.abs(hash) % palette.length;
    }
  }
  return palette[isoToPaletteIndex[iso]];
} 