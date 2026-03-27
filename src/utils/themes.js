export const themes = {
  sketch: {
    name: 'Sketch',
    color: '#2D2D2D',
    strokeWidth: 2,
    shadow: { color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    highlightOpacity: '15',
    style: 'sketchy'
  },
  marker: {
    name: 'Marker',
    color: '#E53935',
    strokeWidth: 4,
    shadow: { color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    highlightOpacity: '40',
    style: 'marker'
  },
  pencil: {
    name: 'Pencil',
    color: '#555555',
    strokeWidth: 1.5,
    shadow: { color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    highlightOpacity: '10',
    style: 'sketchy'
  },
  highlighter: {
    name: 'Highlighter',
    color: '#FFEB3B',
    strokeWidth: 20,
    shadow: { color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    highlightOpacity: '50',
    style: 'marker'
  },
  comic: {
    name: 'Comic',
    color: '#000000',
    strokeWidth: 3,
    shadow: { color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    highlightOpacity: '20',
    style: 'bold'
  },
  coral: {
    name: 'Coral',
    color: '#FF6B6B',
    strokeWidth: 6,
    shadow: { color: 'rgba(0,0,0,0.25)', blur: 12, offsetX: 3, offsetY: 3 },
    highlightOpacity: '35',
    style: 'solid'
  },
  ocean: {
    name: 'Ocean',
    color: '#3B82F6',
    strokeWidth: 5,
    shadow: { color: 'rgba(59,130,246,0.25)', blur: 10, offsetX: 2, offsetY: 2 },
    highlightOpacity: '30',
    style: 'solid'
  },
  minimal: {
    name: 'Minimal',
    color: '#374151',
    strokeWidth: 2,
    shadow: { color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    highlightOpacity: '15',
    style: 'clean'
  }
};

export const defaultSizes = {
  circle: { width: 100, height: 100 },
  rect: { width: 120, height: 80 },
  highlight: { width: 150, height: 40 },
  arrow: { length: 150 },
  line: { length: 150 }
};

export function getLayerStyle(layer, currentTheme) {
  const themeKey = layer.theme || currentTheme;
  const theme = themes[themeKey];
  return {
    color: layer.customColor ? layer.color : theme.color,
    strokeWidth: layer.size || theme.strokeWidth,
    shadow: theme.shadow,
    highlightOpacity: theme.highlightOpacity,
    style: theme.style || 'solid'
  };
}
