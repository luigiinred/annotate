import { useState, useRef, useEffect } from 'react';
import { themes } from '../utils/themes';
import { getAssetsForType } from '../utils/svgAssets';

const tools = [
  { id: 'select', icon: '↖', label: 'Select', hasVariants: false },
  { id: 'circle', icon: '○', label: 'Circle', hasVariants: true },
  { id: 'rect', icon: '□', label: 'Rectangle', hasVariants: true },
  { id: 'arrow', icon: '→', label: 'Arrow', hasVariants: true },
  { id: 'line', icon: '/', label: 'Line', hasVariants: true },
  { id: 'highlight', icon: '▬', label: 'Highlight', hasVariants: true },
  { id: 'text', icon: 'T', label: 'Text', hasVariants: false },
];

function ToolButton({ tool, isActive, onClick, selectedAsset, onAssetChange }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const assets = tool.hasVariants ? getAssetsForType(tool.id) : [];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = () => {
    onClick(tool.id);
  };

  const handleContextMenu = (e) => {
    if (tool.hasVariants) {
      e.preventDefault();
      setShowDropdown(!showDropdown);
    }
  };

  const renderPreview = (asset, color = '#666', size = 24) => {
    const scale = Math.min(size / parseInt(asset.viewBox.split(' ')[2]), size / parseInt(asset.viewBox.split(' ')[3]));
    return (
      <svg
        viewBox={asset.viewBox}
        width={parseInt(asset.viewBox.split(' ')[2]) * scale}
        height={parseInt(asset.viewBox.split(' ')[3]) * scale}
        dangerouslySetInnerHTML={{ __html: asset.render(color, 2) }}
      />
    );
  };

  return (
    <div className="tool-btn-wrapper" ref={buttonRef}>
      <button
        className={`tool-btn ${isActive ? 'active' : ''} ${tool.hasVariants ? 'has-variants' : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        title={`${tool.label}${tool.hasVariants ? ' (right-click for styles)' : ''}`}
      >
        {tool.icon}
        {tool.hasVariants && <span className="dropdown-indicator">▾</span>}
      </button>

      {showDropdown && assets.length > 0 && (
        <div className="tool-dropdown" ref={dropdownRef}>
          <div className="dropdown-header">{tool.label} Styles</div>
          <div className="dropdown-grid">
            {assets.map(asset => (
              <button
                key={asset.id}
                className={`dropdown-item ${selectedAsset === asset.id ? 'selected' : ''}`}
                onClick={() => {
                  onAssetChange(tool.id, asset.id);
                  setShowDropdown(false);
                  onClick(tool.id);
                }}
                title={asset.name}
              >
                {renderPreview(asset)}
                <span className="asset-name">{asset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Toolbar({
  currentTool,
  setCurrentTool,
  currentTheme,
  setCurrentTheme,
  selectedAssets,
  setSelectedAssets,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onGoHome
}) {
  const handleAssetChange = (toolId, assetId) => {
    setSelectedAssets(prev => ({ ...prev, [toolId]: assetId }));
  };

  return (
    <div className="toolbar">
      <div className="tool-group">
        {tools.map(tool => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={currentTool === tool.id}
            onClick={setCurrentTool}
            selectedAsset={selectedAssets[tool.id]}
            onAssetChange={handleAssetChange}
          />
        ))}
      </div>

      <div className="tool-group">
        <select
          value={currentTheme}
          onChange={(e) => setCurrentTheme(e.target.value)}
          className="theme-select"
        >
          {Object.entries(themes).map(([key, theme]) => (
            <option key={key} value={key}>{theme.name}</option>
          ))}
        </select>
      </div>

      <div className="tool-group">
        <button
          className="tool-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          ↩
        </button>
        <button
          className="tool-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          ↪
        </button>
      </div>

      <div className="tool-group">
        <button className="tool-btn" onClick={onGoHome} title="Back to Home">
          ⌂
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
