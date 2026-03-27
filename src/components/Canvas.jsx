import { useRef, useEffect, useState, useCallback } from 'react';
import { themes, getLayerStyle, defaultSizes } from '../utils/themes';
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

function Canvas({
  image,
  layers,
  selectedLayerId,
  setSelectedLayerId,
  currentTool,
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

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');

    // Draw image
    ctx.drawImage(image, 0, 0);

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
  }, [image, layers, selectedLayerId, currentTheme]);

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
      // Check if clicking on a handle
      const selectedLayer = layers.find(l => l.id === selectedLayerId);
      if (selectedLayer) {
        const handle = hitTestHandle(coords.x, coords.y, selectedLayer, ctx);
        if (handle) {
          setActiveHandle(handle);
          setIsDragging(true);
          setDragStart(coords);
          return;
        }
      }

      // Check if clicking on any layer
      for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i];
        if (layer.visible && hitTest(coords.x, coords.y, layer, ctx)) {
          setSelectedLayerId(layer.id);
          setActiveHandle({ type: 'move' });
          setIsDragging(true);
          setDragStart(coords);
          return;
        }
      }

      // Clicked on nothing
      setSelectedLayerId(null);
    } else if (currentTool === 'text') {
      setTextInput({ x: coords.x, y: coords.y });
    } else {
      // Create new shape
      const theme = themes[currentTheme];
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
      }
    }
  }, [currentTool, layers, selectedLayerId, getCanvasCoords, addLayer, currentTheme, setSelectedLayerId]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !activeHandle) return;

    const coords = getCanvasCoords(e);
    const dx = coords.x - dragStart.x;
    const dy = coords.y - dragStart.y;
    const selectedLayer = layers.find(l => l.id === selectedLayerId);

    if (!selectedLayer) return;

    let updates = {};

    if (activeHandle.type === 'move') {
      if (selectedLayer.x !== undefined) {
        updates = { x: selectedLayer.x + dx, y: selectedLayer.y + dy };
      } else if (selectedLayer.x1 !== undefined) {
        updates = {
          x1: selectedLayer.x1 + dx,
          y1: selectedLayer.y1 + dy,
          x2: selectedLayer.x2 + dx,
          y2: selectedLayer.y2 + dy,
          ...(selectedLayer.curveX !== undefined && {
            curveX: selectedLayer.curveX + dx,
            curveY: selectedLayer.curveY + dy
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
      if (selectedLayer.type === 'circle') {
        const cx = selectedLayer.x + selectedLayer.width / 2;
        const cy = selectedLayer.y + selectedLayer.height / 2;
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
          updates.height = selectedLayer.y + selectedLayer.height - coords.y;
        }
        if (pos.includes('s')) {
          updates.height = coords.y - selectedLayer.y;
        }
        if (pos.includes('w')) {
          updates.x = coords.x;
          updates.width = selectedLayer.x + selectedLayer.width - coords.x;
        }
        if (pos.includes('e')) {
          updates.width = coords.x - selectedLayer.x;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      updateLayer(selectedLayerId, updates);
      setDragStart(coords);
    }
  }, [isDragging, activeHandle, dragStart, layers, selectedLayerId, getCanvasCoords, updateLayer]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
  }, []);

  const handleTextSubmit = useCallback((text) => {
    if (text && textInput) {
      addLayer('text', {
        x: textInput.x,
        y: textInput.y,
        text,
        fontSize: 24
      });
    }
    setTextInput(null);
  }, [textInput, addLayer]);

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
