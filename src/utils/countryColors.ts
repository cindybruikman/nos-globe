// Fixed palette for the most common countries
const palette: string[] = [
  '#FF6B6B', // Red
  '#FFD93D', // Yellow
  '#6BCB77', // Green
  '#4D96FF', // Blue
  '#FF922B', // Orange
  '#845EC2', // Purple
  '#FFC75F', // Light Yellow
  '#0081CF', // Teal
  '#B0A8B9', // Grey
  '#F9F871', // Light Yellow
  '#F76E11', // Orange
  '#A3C9A8', // Mint
  '#F24C4C', // Red
  '#43AA8B', // Green
  '#3A86FF', // Blue
  '#FFB4A2', // Peach
  '#B5838D', // Mauve
  '#6D6875', // Grey
  '#FFBE0B', // Gold
  '#8338EC', // Violet
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