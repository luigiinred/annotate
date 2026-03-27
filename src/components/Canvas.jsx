import { useRef, useEffect, useState, useCallback } from 'react';
import { themes, getLayerStyle, defaultSizes } from '../utils/themes';
import { getAsset } from '../utils/svgAssets';
import {
  drawSketchyLine,
  drawSketchyEllipse,
  drawSketchyRect,
  drawRoundedRect,
  drawArrow,
  hitTest,
  hitTestHandle,
  getHandlePositions
} from '../utils/drawing';

// Cache for rendered SVG images
const svgImageCache = new Map();

function getSvgImage(cacheKey, svgString, width, height) {
  if (svgImageCache.has(cacheKey)) {
    return svgImageCache.get(cacheKey);
  }

  // Create image from SVG
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  // Store promise in cache
  const promise = new Promise((resolve) => {
    img.onload = () => {
      URL.revokeObjectURL(url);
      svgImageCache.set(cacheKey, img);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });

  svgImageCache.set(cacheKey, promise);
  return promise;
}

function Canvas({
  image,
  layers,
  selectedLayerId,
  setSelectedLayerId,
  currentTool,
  setCurrentTool,
  currentTheme,
  addLayer,
  updateLayer
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState(null);
  const [textInput, setTextInput] = useState(null);
  const [, forceUpdate] = useState(0);

  // Use ref to track the dragging layer ID synchronously
  const draggingLayerIdRef = useRef(null);

  // Fit image to container on load
  useEffect(() => {
    if (image && containerRef.current) {
      const container = containerRef.current;
      const scaleX = (container.clientWidth - 40) / image.width;
      const scaleY = (container.clientHeight - 40) / image.height;
      const scale = Math.min(scaleX, scaleY, 1);
      setZoom(scale);
      setPan({ x: 0, y: 0 });
    }
  }, [image]);

  // Draw canvas (image + annotations + handles)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Track if we need to re-render after SVG loads
    let needsRerender = false;

    // Draw layers
    layers.forEach(layer => {
      if (!layer.visible) return;

      const style = getLayerStyle(layer, currentTheme);
      ctx.strokeStyle = style.color;
      ctx.fillStyle = style.color;
      ctx.lineWidth = style.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Apply shadow
      if (style.shadow && style.shadow.blur > 0) {
        ctx.shadowColor = style.shadow.color;
        ctx.shadowBlur = style.shadow.blur;
        ctx.shadowOffsetX = style.shadow.offsetX;
        ctx.shadowOffsetY = style.shadow.offsetY;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      // Check if layer has an SVG asset
      const asset = layer.assetId ? getAsset(layer.type, layer.assetId) : null;

      if (asset) {
        const drawn = renderSvgAsset(ctx, layer, asset, style);
        if (!drawn) needsRerender = true;
      } else {
        renderCanvasShape(ctx, layer, style);
      }

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    });

    // Draw selection handles
    const selectedLayer = layers.find(l => l.id === selectedLayerId);
    if (selectedLayer && selectedLayer.visible) {
      ctx.strokeStyle = '#3b82f6';
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'transparent';

      const handles = getHandlePositions(selectedLayer, ctx);
      handles.forEach(handle => {
        ctx.beginPath();
        if (handle.type === 'curve') {
          ctx.arc(handle.x, handle.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
        } else {
          ctx.arc(handle.x, handle.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
        }
        ctx.fill();
        ctx.stroke();
      });
    }

    // If SVGs are still loading, re-render when ready
    if (needsRerender) {
      const timeout = setTimeout(() => forceUpdate(n => n + 1), 50);
      return () => clearTimeout(timeout);
    }
  }, [image, layers, selectedLayerId, currentTheme]);

  // Render SVG asset to canvas
  function renderSvgAsset(ctx, layer, asset, style) {
    let x, y, width, height, angle = 0;

    if (layer.type === 'arrow' || layer.type === 'line') {
      const dx = layer.x2 - layer.x1;
      const dy = layer.y2 - layer.y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      angle = Math.atan2(dy, dx);

      const vbParts = asset.viewBox.split(' ').map(Number);
      const svgWidth = vbParts[2];
      const svgHeight = vbParts[3];
      const scale = length / svgWidth;

      x = layer.x1;
      y = layer.y1;
      width = length;
      height = svgHeight * scale;
    } else {
      x = layer.x;
      y = layer.y;
      width = Math.abs(layer.width);
      height = Math.abs(layer.height);
    }

    // Generate SVG string
    const svgContent = asset.render(style.color, style.strokeWidth, style.highlightOpacity);
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${asset.viewBox}" width="${width}" height="${height}">${svgContent}</svg>`;

    // Create cache key
    const cacheKey = `${asset.id}-${style.color}-${style.strokeWidth}-${Math.round(width)}-${Math.round(height)}`;

    const cached = svgImageCache.get(cacheKey);

    if (cached instanceof Image) {
      // Image is ready, draw it
      ctx.save();
      if (layer.type === 'arrow' || layer.type === 'line') {
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.drawImage(cached, 0, -height / 2, width, height);
      } else {
        ctx.drawImage(cached, x, y, width, height);
      }
      ctx.restore();
      return true;
    } else if (cached instanceof Promise) {
      // Still loading, fall back to canvas drawing
      renderCanvasShape(ctx, layer, style);
      return false;
    } else {
      // Not cached, start loading
      getSvgImage(cacheKey, svgString, width, height).then(() => {
        forceUpdate(n => n + 1);
      });
      // Fall back to canvas drawing while loading
      renderCanvasShape(ctx, layer, style);
      return false;
    }
  }

  // Render shape using canvas drawing (fallback)
  function renderCanvasShape(ctx, layer, style) {
    switch (layer.type) {
      case 'circle':
        if (style.style === 'sketchy' || style.style === 'marker') {
          drawSketchyEllipse(ctx, layer.x + layer.width / 2, layer.y + layer.height / 2, layer.width / 2, layer.height / 2, style.style === 'marker' ? 1 : 2);
        } else {
          ctx.beginPath();
          ctx.ellipse(layer.x + layer.width / 2, layer.y + layer.height / 2, Math.abs(layer.width / 2), Math.abs(layer.height / 2), 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case 'rect':
        if (style.style === 'sketchy' || style.style === 'marker') {
          drawSketchyRect(ctx, layer.x, layer.y, layer.width, layer.height, style.style === 'marker' ? 1 : 2);
        } else {
          ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
        }
        break;

      case 'highlight':
        ctx.fillStyle = style.color + style.highlightOpacity;
        drawRoundedRect(ctx, layer.x, layer.y, layer.width, layer.height, 4);
        ctx.fill();
        break;

      case 'arrow':
        drawArrow(ctx, layer.x1, layer.y1, layer.x2, layer.y2, layer.size, style.color, layer.curveX, layer.curveY, style.style);
        break;

      case 'line':
        if (style.style === 'sketchy' || style.style === 'marker') {
          drawSketchyLine(ctx, layer.x1, layer.y1, layer.x2, layer.y2, style.style === 'marker' ? 1 : 2);
        } else {
          ctx.beginPath();
          ctx.moveTo(layer.x1, layer.y1);
          ctx.lineTo(layer.x2, layer.y2);
          ctx.stroke();
        }
        break;

      case 'text':
        ctx.font = `bold ${layer.fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText(layer.text, layer.x, layer.y);
        break;
    }
  }

  const getCanvasCoords = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  }, [zoom]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();

    if (e.ctrlKey) {
      // Pinch zoom
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(z => Math.max(0.1, Math.min(5, z * delta)));
    } else {
      // Two-finger scroll = pan
      setPan(p => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY
      }));
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;

    const coords = getCanvasCoords(e);
    const ctx = canvasRef.current.getContext('2d');

    if (currentTool === 'select') {
      // Check if clicking on a handle of currently selected layer
      const currentSelected = layers.find(l => l.id === selectedLayerId);
      if (currentSelected && currentSelected.visible) {
        const handle = hitTestHandle(coords.x, coords.y, currentSelected, ctx);
        if (handle) {
          draggingLayerIdRef.current = selectedLayerId;
          setActiveHandle(handle);
          setIsDragging(true);
          setDragStart(coords);
          return;
        }
      }

      // Check if clicking on any layer (iterate from top to bottom)
      for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i];
        if (layer.visible && hitTest(coords.x, coords.y, layer, ctx)) {
          // Store the layer ID in ref for immediate access
          draggingLayerIdRef.current = layer.id;
          setSelectedLayerId(layer.id);
          setActiveHandle({ type: 'move' });
          setIsDragging(true);
          setDragStart(coords);
          return;
        }
      }

      // Clicked on nothing
      draggingLayerIdRef.current = null;
      setSelectedLayerId(null);
    } else if (currentTool === 'text') {
      setTextInput({ x: coords.x, y: coords.y });
    } else {
      // Create new shape
      let newLayer;

      switch (currentTool) {
        case 'circle':
          newLayer = {
            x: coords.x - defaultSizes.circle.width / 2,
            y: coords.y - defaultSizes.circle.height / 2,
            width: defaultSizes.circle.width,
            height: defaultSizes.circle.height
          };
          break;
        case 'rect':
          newLayer = {
            x: coords.x - defaultSizes.rect.width / 2,
            y: coords.y - defaultSizes.rect.height / 2,
            width: defaultSizes.rect.width,
            height: defaultSizes.rect.height
          };
          break;
        case 'highlight':
          newLayer = {
            x: coords.x - defaultSizes.highlight.width / 2,
            y: coords.y - defaultSizes.highlight.height / 2,
            width: defaultSizes.highlight.width,
            height: defaultSizes.highlight.height
          };
          break;
        case 'arrow':
        case 'line':
          newLayer = {
            x1: coords.x,
            y1: coords.y,
            x2: coords.x + defaultSizes.arrow.length,
            y2: coords.y
          };
          break;
      }

      if (newLayer) {
        addLayer(currentTool, newLayer);
        // Switch back to select mode after adding
        setCurrentTool('select');
      }
    }
  }, [currentTool, layers, selectedLayerId, getCanvasCoords, addLayer, setSelectedLayerId, setCurrentTool]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !activeHandle) return;

    const coords = getCanvasCoords(e);
    const dx = coords.x - dragStart.x;
    const dy = coords.y - dragStart.y;

    // Use the ref to get the layer ID (synchronous)
    const layerId = draggingLayerIdRef.current;
    const targetLayer = layers.find(l => l.id === layerId);

    if (!targetLayer) return;

    let updates = {};

    if (activeHandle.type === 'move') {
      if (targetLayer.x !== undefined) {
        updates = { x: targetLayer.x + dx, y: targetLayer.y + dy };
      } else if (targetLayer.x1 !== undefined) {
        updates = {
          x1: targetLayer.x1 + dx,
          y1: targetLayer.y1 + dy,
          x2: targetLayer.x2 + dx,
          y2: targetLayer.y2 + dy,
          ...(targetLayer.curveX !== undefined && {
            curveX: targetLayer.curveX + dx,
            curveY: targetLayer.curveY + dy
          })
        };
      }
    } else if (activeHandle.type === 'endpoint') {
      if (activeHandle.pos === 'start') {
        updates = { x1: coords.x, y1: coords.y };
      } else {
        updates = { x2: coords.x, y2: coords.y };
      }
    } else if (activeHandle.type === 'curve') {
      updates = { curveX: coords.x, curveY: coords.y };
    } else if (activeHandle.type === 'resize') {
      const { pos } = activeHandle;
      if (targetLayer.type === 'circle') {
        const cx = targetLayer.x + targetLayer.width / 2;
        const cy = targetLayer.y + targetLayer.height / 2;
        if (pos === 'n' || pos === 's') {
          const newRy = Math.abs(coords.y - cy);
          updates = { y: cy - newRy, height: newRy * 2 };
        } else {
          const newRx = Math.abs(coords.x - cx);
          updates = { x: cx - newRx, width: newRx * 2 };
        }
      } else {
        // Rectangle resize
        if (pos.includes('n')) {
          updates.y = coords.y;
          updates.height = targetLayer.y + targetLayer.height - coords.y;
        }
        if (pos.includes('s')) {
          updates.height = coords.y - targetLayer.y;
        }
        if (pos.includes('w')) {
          updates.x = coords.x;
          updates.width = targetLayer.x + targetLayer.width - coords.x;
        }
        if (pos.includes('e')) {
          updates.width = coords.x - targetLayer.x;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      updateLayer(layerId, updates);
      setDragStart(coords);
    }
  }, [isDragging, activeHandle, dragStart, layers, getCanvasCoords, updateLayer]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
    draggingLayerIdRef.current = null;
  }, []);

  const handleTextSubmit = useCallback((text) => {
    if (text && textInput) {
      addLayer('text', {
        x: textInput.x,
        y: textInput.y,
        text,
        fontSize: 24
      });
      setCurrentTool('select');
    }
    setTextInput(null);
  }, [textInput, addLayer, setCurrentTool]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const cursorStyle = currentTool === 'select' ? 'default' : 'crosshair';

  return (
    <div className="canvas-container" ref={containerRef}>
      <div
        className="canvas-wrapper"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            cursor: cursorStyle
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {textInput && (
        <div
          className="text-input-overlay"
          style={{
            left: textInput.x * zoom + pan.x,
            top: textInput.y * zoom + pan.y
          }}
        >
          <input
            type="text"
            autoFocus
            placeholder="Enter text..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTextSubmit(e.target.value);
              } else if (e.key === 'Escape') {
                setTextInput(null);
              }
            }}
            onBlur={(e) => handleTextSubmit(e.target.value)}
          />
        </div>
      )}

      <div className="zoom-controls">
        <button onClick={() => setZoom(z => Math.min(5, z * 1.2))}>+</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(0.1, z / 1.2))}>-</button>
        <button onClick={() => {
          if (image && containerRef.current) {
            const container = containerRef.current;
            const scaleX = (container.clientWidth - 40) / image.width;
            const scaleY = (container.clientHeight - 40) / image.height;
            setZoom(Math.min(scaleX, scaleY, 1));
            setPan({ x: 0, y: 0 });
          }
        }}>Fit</button>
      </div>
    </div>
  );
}

export default Canvas;
