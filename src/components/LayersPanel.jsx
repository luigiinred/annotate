import { themes } from '../utils/themes';

const typeIcons = {
  circle: '○',
  rect: '□',
  arrow: '→',
  line: '/',
  highlight: '▬',
  text: 'T'
};

function LayersPanel({
  layers,
  selectedLayerId,
  selectedLayer,
  setSelectedLayerId,
  updateLayer,
  deleteLayer,
  duplicateLayer,
  toggleLayerVisibility,
  reorderLayers,
  currentTheme
}) {
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, toIndex) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== toIndex) {
      reorderLayers(fromIndex, toIndex);
    }
  };

  return (
    <div className="layers-panel">
      <div className="panel-header">
        <h3>Layers</h3>
      </div>

      <div className="layers-list">
        {[...layers].reverse().map((layer, reverseIndex) => {
          const index = layers.length - 1 - reverseIndex;
          return (
            <div
              key={layer.id}
              className={`layer-item ${selectedLayerId === layer.id ? 'selected' : ''} ${!layer.visible ? 'hidden-layer' : ''}`}
              onClick={() => setSelectedLayerId(layer.id)}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <button
                className="visibility-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerVisibility(layer.id);
                }}
              >
                {layer.visible ? '👁' : '○'}
              </button>
              <span className="layer-icon">{typeIcons[layer.type]}</span>
              <span className="layer-name">
                {layer.type === 'text' ? layer.text?.substring(0, 15) || 'Text' : layer.type}
              </span>
              <div className="layer-actions">
                <button
                  className="layer-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateLayer(layer.id);
                  }}
                  title="Duplicate"
                >
                  ⧉
                </button>
                <button
                  className="layer-action-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLayer(layer.id);
                  }}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
        {layers.length === 0 && (
          <div className="no-layers">No annotations yet</div>
        )}
      </div>

      {selectedLayer && (
        <div className="layer-properties">
          <h4>Properties</h4>

          <div className="property-row">
            <label>Color</label>
            <input
              type="color"
              value={selectedLayer.color}
              onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value, customColor: true })}
            />
          </div>

          <div className="property-row">
            <label>Size</label>
            <input
              type="range"
              min="1"
              max="20"
              value={selectedLayer.size}
              onChange={(e) => updateLayer(selectedLayer.id, { size: parseInt(e.target.value) })}
            />
          </div>

          <div className="property-row">
            <label>Theme</label>
            <select
              value={selectedLayer.theme || currentTheme}
              onChange={(e) => {
                const theme = themes[e.target.value];
                updateLayer(selectedLayer.id, {
                  theme: e.target.value,
                  color: selectedLayer.customColor ? selectedLayer.color : theme.color,
                  size: theme.strokeWidth
                });
              }}
            >
              {Object.entries(themes).map(([key, theme]) => (
                <option key={key} value={key}>{theme.name}</option>
              ))}
            </select>
          </div>

          {selectedLayer.type === 'text' && (
            <>
              <div className="property-row">
                <label>Text</label>
                <input
                  type="text"
                  value={selectedLayer.text || ''}
                  onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                />
              </div>
              <div className="property-row">
                <label>Font Size</label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={selectedLayer.fontSize || 24}
                  onChange={(e) => updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) })}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default LayersPanel;
