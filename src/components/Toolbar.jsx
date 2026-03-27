import { themes } from '../utils/themes';

const tools = [
  { id: 'select', icon: '↖', label: 'Select' },
  { id: 'circle', icon: '○', label: 'Circle' },
  { id: 'rect', icon: '□', label: 'Rectangle' },
  { id: 'arrow', icon: '→', label: 'Arrow' },
  { id: 'line', icon: '/', label: 'Line' },
  { id: 'highlight', icon: '▬', label: 'Highlight' },
  { id: 'text', icon: 'T', label: 'Text' },
];

function Toolbar({
  currentTool,
  setCurrentTool,
  currentTheme,
  setCurrentTheme,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearAll
}) {
  return (
    <div className="toolbar">
      <div className="tool-group">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
            onClick={() => setCurrentTool(tool.id)}
            title={tool.label}
          >
            {tool.icon}
          </button>
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
        <button className="tool-btn danger" onClick={onClearAll} title="Clear All">
          ✕
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
