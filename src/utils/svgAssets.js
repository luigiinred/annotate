// SVG annotation assets - arrows, circles, etc.
// Each asset has: id, name, viewBox, path(s), and optional default dimensions

export const arrowAssets = [
  {
    id: 'arrow-straight',
    name: 'Straight',
    viewBox: '0 0 200 50',
    defaultWidth: 150,
    defaultHeight: 40,
    render: (color, strokeWidth) => `
      <line x1="10" y1="25" x2="170" y2="25" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
      <path d="M160 10 L190 25 L160 40" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
    `
  },
  {
    id: 'arrow-curved',
    name: 'Curved',
    viewBox: '0 0 200 80',
    defaultWidth: 150,
    defaultHeight: 60,
    render: (color, strokeWidth) => `
      <path d="M10 60 Q100 10 170 40" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
      <path d="M155 25 L180 40 L155 55" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
    `
  },
  {
    id: 'arrow-sketchy',
    name: 'Sketchy',
    viewBox: '0 0 200 50',
    defaultWidth: 150,
    defaultHeight: 40,
    render: (color, strokeWidth) => `
      <path d="M12 26 Q50 23 100 25 Q150 27 168 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" opacity="0.9"/>
      <path d="M10 24 Q50 27 100 25 Q150 23 170 26" fill="none" stroke="${color}" stroke-width="${strokeWidth * 0.7}" stroke-linecap="round" opacity="0.6"/>
      <path d="M158 8 L192 25 L158 42" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M160 10 L188 24" fill="none" stroke="${color}" stroke-width="${strokeWidth * 0.6}" stroke-linecap="round" opacity="0.5"/>
    `
  },
  {
    id: 'arrow-bold',
    name: 'Bold',
    viewBox: '0 0 200 60',
    defaultWidth: 150,
    defaultHeight: 45,
    render: (color) => `
      <path d="M10 30 L140 30 L140 15 L190 30 L140 45 L140 30" fill="${color}"/>
    `
  },
  {
    id: 'arrow-hand-drawn',
    name: 'Hand Drawn',
    viewBox: '0 0 200 60',
    defaultWidth: 150,
    defaultHeight: 45,
    render: (color, strokeWidth) => `
      <path d="M8 32 C30 28 70 34 100 30 C130 26 150 33 172 29" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
      <path d="M155 12 C165 18 178 24 190 30 C178 36 165 42 155 48" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
    `
  },
  {
    id: 'arrow-double',
    name: 'Double',
    viewBox: '0 0 200 50',
    defaultWidth: 150,
    defaultHeight: 40,
    render: (color, strokeWidth) => `
      <line x1="30" y1="25" x2="170" y2="25" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
      <path d="M20 10 L10 25 L20 40" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M180 10 L190 25 L180 40" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
    `
  },
  {
    id: 'arrow-wavy',
    name: 'Wavy',
    viewBox: '0 0 200 60',
    defaultWidth: 150,
    defaultHeight: 45,
    render: (color, strokeWidth) => `
      <path d="M10 30 Q35 15 60 30 Q85 45 110 30 Q135 15 160 30" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
      <path d="M150 15 L180 30 L150 45" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
    `
  },
  {
    id: 'arrow-tail',
    name: 'Tail',
    viewBox: '0 0 200 50',
    defaultWidth: 150,
    defaultHeight: 40,
    render: (color, strokeWidth) => `
      <line x1="30" y1="25" x2="160" y2="25" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
      <path d="M160 10 L190 25 L160 40" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 10 L30 25 L10 40" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
    `
  }
];

export const circleAssets = [
  {
    id: 'circle-solid',
    name: 'Solid',
    viewBox: '0 0 100 100',
    defaultWidth: 100,
    defaultHeight: 100,
    render: (color, strokeWidth) => `
      <circle cx="50" cy="50" r="45" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>
    `
  },
  {
    id: 'circle-sketchy',
    name: 'Sketchy',
    viewBox: '0 0 100 100',
    defaultWidth: 100,
    defaultHeight: 100,
    render: (color, strokeWidth) => `
      <ellipse cx="50" cy="50" rx="44" ry="46" fill="none" stroke="${color}" stroke-width="${strokeWidth}" opacity="0.9"/>
      <ellipse cx="50" cy="50" rx="46" ry="44" fill="none" stroke="${color}" stroke-width="${strokeWidth * 0.6}" opacity="0.5"/>
    `
  },
  {
    id: 'circle-dashed',
    name: 'Dashed',
    viewBox: '0 0 100 100',
    defaultWidth: 100,
    defaultHeight: 100,
    render: (color, strokeWidth) => `
      <circle cx="50" cy="50" r="45" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-dasharray="10 5"/>
    `
  },
  {
    id: 'circle-double',
    name: 'Double',
    viewBox: '0 0 100 100',
    defaultWidth: 100,
    defaultHeight: 100,
    render: (color, strokeWidth) => `
      <circle cx="50" cy="50" r="45" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="${color}" stroke-width="${strokeWidth * 0.6}"/>
    `
  },
  {
    id: 'circle-hand-drawn',
    name: 'Hand Drawn',
    viewBox: '0 0 100 100',
    defaultWidth: 100,
    defaultHeight: 100,
    render: (color, strokeWidth) => `
      <path d="M50 5 C75 3 97 25 95 50 C97 75 75 97 50 95 C25 97 3 75 5 50 C3 25 25 3 50 5" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
    `
  }
];

export const rectAssets = [
  {
    id: 'rect-solid',
    name: 'Solid',
    viewBox: '0 0 120 80',
    defaultWidth: 120,
    defaultHeight: 80,
    render: (color, strokeWidth) => `
      <rect x="5" y="5" width="110" height="70" fill="none" stroke="${color}" stroke-width="${strokeWidth}" rx="2"/>
    `
  },
  {
    id: 'rect-rounded',
    name: 'Rounded',
    viewBox: '0 0 120 80',
    defaultWidth: 120,
    defaultHeight: 80,
    render: (color, strokeWidth) => `
      <rect x="5" y="5" width="110" height="70" fill="none" stroke="${color}" stroke-width="${strokeWidth}" rx="12"/>
    `
  },
  {
    id: 'rect-sketchy',
    name: 'Sketchy',
    viewBox: '0 0 120 80',
    defaultWidth: 120,
    defaultHeight: 80,
    render: (color, strokeWidth) => `
      <path d="M8 7 L112 5 L115 75 L5 77 Z" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
      <path d="M6 8 L114 6" fill="none" stroke="${color}" stroke-width="${strokeWidth * 0.5}" stroke-linecap="round" opacity="0.4"/>
    `
  },
  {
    id: 'rect-dashed',
    name: 'Dashed',
    viewBox: '0 0 120 80',
    defaultWidth: 120,
    defaultHeight: 80,
    render: (color, strokeWidth) => `
      <rect x="5" y="5" width="110" height="70" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-dasharray="8 4" rx="2"/>
    `
  },
  {
    id: 'rect-bracket',
    name: 'Bracket',
    viewBox: '0 0 120 80',
    defaultWidth: 120,
    defaultHeight: 80,
    render: (color, strokeWidth) => `
      <path d="M15 5 L5 5 L5 75 L15 75" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
      <path d="M105 5 L115 5 L115 75 L105 75" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
    `
  }
];

export const highlightAssets = [
  {
    id: 'highlight-solid',
    name: 'Solid',
    viewBox: '0 0 150 40',
    defaultWidth: 150,
    defaultHeight: 40,
    render: (color, _, opacity = '40') => `
      <rect x="2" y="2" width="146" height="36" fill="${color}${opacity}" rx="4"/>
    `
  },
  {
    id: 'highlight-marker',
    name: 'Marker',
    viewBox: '0 0 150 40',
    defaultWidth: 150,
    defaultHeight: 40,
    render: (color, _, opacity = '50') => `
      <path d="M5 8 L145 5 L148 35 L3 38 Z" fill="${color}${opacity}"/>
    `
  },
  {
    id: 'highlight-underline',
    name: 'Underline',
    viewBox: '0 0 150 40',
    defaultWidth: 150,
    defaultHeight: 10,
    render: (color, strokeWidth) => `
      <path d="M5 20 Q75 25 145 20" fill="none" stroke="${color}" stroke-width="${strokeWidth * 2}" stroke-linecap="round"/>
    `
  },
  {
    id: 'highlight-strikethrough',
    name: 'Strike',
    viewBox: '0 0 150 40',
    defaultWidth: 150,
    defaultHeight: 20,
    render: (color, strokeWidth) => `
      <line x1="5" y1="20" x2="145" y2="20" stroke="${color}" stroke-width="${strokeWidth * 1.5}" stroke-linecap="round"/>
    `
  }
];

export const lineAssets = [
  {
    id: 'line-solid',
    name: 'Solid',
    viewBox: '0 0 200 20',
    defaultWidth: 150,
    defaultHeight: 20,
    render: (color, strokeWidth) => `
      <line x1="5" y1="10" x2="195" y2="10" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
    `
  },
  {
    id: 'line-dashed',
    name: 'Dashed',
    viewBox: '0 0 200 20',
    defaultWidth: 150,
    defaultHeight: 20,
    render: (color, strokeWidth) => `
      <line x1="5" y1="10" x2="195" y2="10" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-dasharray="12 6"/>
    `
  },
  {
    id: 'line-dotted',
    name: 'Dotted',
    viewBox: '0 0 200 20',
    defaultWidth: 150,
    defaultHeight: 20,
    render: (color, strokeWidth) => `
      <line x1="5" y1="10" x2="195" y2="10" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-dasharray="2 8"/>
    `
  },
  {
    id: 'line-sketchy',
    name: 'Sketchy',
    viewBox: '0 0 200 20',
    defaultWidth: 150,
    defaultHeight: 20,
    render: (color, strokeWidth) => `
      <path d="M5 11 Q50 8 100 10 Q150 12 195 9" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
      <path d="M5 9 Q50 12 100 10 Q150 8 195 11" fill="none" stroke="${color}" stroke-width="${strokeWidth * 0.5}" stroke-linecap="round" opacity="0.5"/>
    `
  },
  {
    id: 'line-wavy',
    name: 'Wavy',
    viewBox: '0 0 200 30',
    defaultWidth: 150,
    defaultHeight: 25,
    render: (color, strokeWidth) => `
      <path d="M5 15 Q25 5 50 15 Q75 25 100 15 Q125 5 150 15 Q175 25 195 15" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
    `
  }
];

// Helper to get all assets for a type
export function getAssetsForType(type) {
  switch (type) {
    case 'arrow': return arrowAssets;
    case 'circle': return circleAssets;
    case 'rect': return rectAssets;
    case 'highlight': return highlightAssets;
    case 'line': return lineAssets;
    default: return [];
  }
}

// Helper to get a specific asset
export function getAsset(type, assetId) {
  const assets = getAssetsForType(type);
  return assets.find(a => a.id === assetId) || assets[0];
}
