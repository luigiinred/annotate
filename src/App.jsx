import { useState, useCallback, useRef } from 'react';
import './App.css';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import LayersPanel from './components/LayersPanel';
import DropZone from './components/DropZone';
import HomeScreen from './components/HomeScreen';
import { themes } from './utils/themes';
import { autoSave, setCurrentProject, getProject } from './utils/storage';

function App() {
  const [image, setImage] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [currentTool, setCurrentTool] = useState('select');
  const [currentTheme, setCurrentTheme] = useState('sketch');
  const [selectedAssets, setSelectedAssets] = useState({
    arrow: 'arrow-straight',
    circle: 'circle-solid',
    rect: 'rect-solid',
    highlight: 'highlight-solid',
    line: 'line-solid'
  });
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const layerIdCounter = useRef(1);

  const saveHistory = useCallback((newLayers) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(newLayers));
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const updateLayers = useCallback((newLayers, addToHistory = true) => {
    setLayers(newLayers);
    if (addToHistory) {
      saveHistory(newLayers);
    }
    if (imageData) {
      autoSave(imageData, newLayers);
    }
  }, [saveHistory, imageData]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setLayers(JSON.parse(history[newIndex]));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setLayers(JSON.parse(history[newIndex]));
    }
  }, [history, historyIndex]);

  const handleImageLoad = useCallback((img, dataUrl) => {
    setImage(img);
    setImageData(dataUrl);
    setLayers([]);
    setSelectedLayerId(null);
    setHistory([]);
    setHistoryIndex(-1);
    setCurrentProject(null);
  }, []);

  const handleLoadProject = useCallback((projectId) => {
    const project = getProject(projectId);
    if (project) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setImageData(project.imageData);
        setLayers(project.layers || []);
        setSelectedLayerId(null);
        setHistory([JSON.stringify(project.layers || [])]);
        setHistoryIndex(0);
        setCurrentProject(projectId);
      };
      img.src = project.imageData;
    }
  }, []);

  const addLayer = useCallback((type, props = {}) => {
    const id = layerIdCounter.current++;
    const theme = themes[currentTheme];

    const baseLayer = {
      id,
      type,
      visible: true,
      theme: currentTheme,
      color: theme.color,
      size: theme.strokeWidth,
      assetId: selectedAssets[type] || null,
      ...props
    };

    const newLayers = [...layers, baseLayer];
    updateLayers(newLayers);
    setSelectedLayerId(id);
    return id;
  }, [layers, currentTheme, selectedAssets, updateLayers]);

  const updateLayer = useCallback((id, updates) => {
    const newLayers = layers.map(layer =>
      layer.id === id ? { ...layer, ...updates } : layer
    );
    updateLayers(newLayers);
  }, [layers, updateLayers]);

  const deleteLayer = useCallback((id) => {
    const newLayers = layers.filter(layer => layer.id !== id);
    updateLayers(newLayers);
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  }, [layers, selectedLayerId, updateLayers]);

  const duplicateLayer = useCallback((id) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      const newId = layerIdCounter.current++;
      const newLayer = { ...layer, id: newId };
      if (newLayer.x !== undefined) newLayer.x += 20;
      if (newLayer.y !== undefined) newLayer.y += 20;
      if (newLayer.x1 !== undefined) {
        newLayer.x1 += 20;
        newLayer.y1 += 20;
        newLayer.x2 += 20;
        newLayer.y2 += 20;
      }
      const newLayers = [...layers, newLayer];
      updateLayers(newLayers);
      setSelectedLayerId(newId);
    }
  }, [layers, updateLayers]);

  const toggleLayerVisibility = useCallback((id) => {
    const newLayers = layers.map(layer =>
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    );
    updateLayers(newLayers, false);
  }, [layers, updateLayers]);

  const reorderLayers = useCallback((fromIndex, toIndex) => {
    const newLayers = [...layers];
    const [removed] = newLayers.splice(fromIndex, 1);
    newLayers.splice(toIndex, 0, removed);
    updateLayers(newLayers);
  }, [layers, updateLayers]);

  const clearAll = useCallback(() => {
    setImage(null);
    setImageData(null);
    setLayers([]);
    setSelectedLayerId(null);
    setHistory([]);
    setHistoryIndex(-1);
    setCurrentProject(null);
  }, []);

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  // Show home screen if no image loaded
  if (!image) {
    return (
      <div className="app">
        <HomeScreen
          onLoadProject={handleLoadProject}
          onImageLoad={handleImageLoad}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <Toolbar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        selectedAssets={selectedAssets}
        setSelectedAssets={setSelectedAssets}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={undo}
        onRedo={redo}
        onClearAll={clearAll}
      />
      <div className="main-content">
        <Canvas
          image={image}
          layers={layers}
          selectedLayerId={selectedLayerId}
          setSelectedLayerId={setSelectedLayerId}
          currentTool={currentTool}
          currentTheme={currentTheme}
          addLayer={addLayer}
          updateLayer={updateLayer}
        />
        <LayersPanel
          layers={layers}
          selectedLayerId={selectedLayerId}
          selectedLayer={selectedLayer}
          setSelectedLayerId={setSelectedLayerId}
          updateLayer={updateLayer}
          deleteLayer={deleteLayer}
          duplicateLayer={duplicateLayer}
          toggleLayerVisibility={toggleLayerVisibility}
          reorderLayers={reorderLayers}
          currentTheme={currentTheme}
        />
      </div>
      <DropZone onImageLoad={handleImageLoad} />
    </div>
  );
}

export default App;
