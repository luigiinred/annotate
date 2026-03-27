// Sketchy drawing functions for hand-drawn effect

export function drawSketchyLine(ctx, x1, y1, x2, y2, iterations = 2) {
  const len = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const wobble = Math.min(len * 0.02, 3);

  for (let i = 0; i < iterations; i++) {
    ctx.beginPath();
    ctx.moveTo(x1 + (Math.random() - 0.5) * wobble, y1 + (Math.random() - 0.5) * wobble);
    const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * wobble * 2;
    const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * wobble * 2;
    ctx.quadraticCurveTo(midX, midY, x2 + (Math.random() - 0.5) * wobble, y2 + (Math.random() - 0.5) * wobble);
    ctx.stroke();
  }
}

export function drawSketchyEllipse(ctx, cx, cy, rx, ry, iterations = 2) {
  const wobble = Math.min(Math.max(rx, ry) * 0.03, 4);

  for (let i = 0; i < iterations; i++) {
    ctx.beginPath();
    const startAngle = (Math.random() - 0.5) * 0.2;

    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.1) {
      const wobbleX = (Math.random() - 0.5) * wobble;
      const wobbleY = (Math.random() - 0.5) * wobble;
      const x = cx + (rx + wobbleX) * Math.cos(a + startAngle);
      const y = cy + (ry + wobbleY) * Math.sin(a + startAngle);

      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

export function drawSketchyRect(ctx, x, y, w, h, iterations = 2) {
  for (let i = 0; i < iterations; i++) {
    drawSketchyLine(ctx, x, y, x + w, y);
    drawSketchyLine(ctx, x + w, y, x + w, y + h);
    drawSketchyLine(ctx, x + w, y + h, x, y + h);
    drawSketchyLine(ctx, x, y + h, x, y);
  }
}

export function drawRoundedRect(ctx, x, y, width, height, radius) {
  radius = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function drawArrow(ctx, fromX, fromY, toX, toY, size, color, curveX, curveY, drawStyle) {
  const hasCurve = curveX !== undefined && curveY !== undefined;
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const isCurved = hasCurve && (Math.abs(curveX - midX) > 5 || Math.abs(curveY - midY) > 5);
  const isSketchy = drawStyle === 'sketchy' || drawStyle === 'marker';

  if (isSketchy) {
    const angle = isCurved
      ? Math.atan2(toY - curveY, toX - curveX)
      : Math.atan2(toY - fromY, toX - fromX);
    const headLength = Math.max(size * 4, 15);

    if (isCurved) {
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.quadraticCurveTo(curveX, curveY, toX, toY);
      ctx.stroke();
    } else {
      drawSketchyLine(ctx, fromX, fromY, toX, toY, drawStyle === 'marker' ? 1 : 2);
    }

    const head1X = toX - headLength * Math.cos(angle - Math.PI / 6);
    const head1Y = toY - headLength * Math.sin(angle - Math.PI / 6);
    const head2X = toX - headLength * Math.cos(angle + Math.PI / 6);
    const head2Y = toY - headLength * Math.sin(angle + Math.PI / 6);

    drawSketchyLine(ctx, toX, toY, head1X, head1Y, 1);
    drawSketchyLine(ctx, toX, toY, head2X, head2Y, 1);
    return;
  }

  const headLength = Math.max(size * 5, 20);
  const headWidth = Math.max(size * 3.5, 14);

  if (isCurved) {
    const t = 0.99;
    const tangentX = 2 * (1 - t) * (curveX - fromX) + 2 * t * (toX - curveX);
    const tangentY = 2 * (1 - t) * (curveY - fromY) + 2 * t * (toY - curveY);
    const endAngle = Math.atan2(tangentY, tangentX);

    ctx.lineWidth = size * 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.quadraticCurveTo(curveX, curveY, toX - headLength * 0.7 * Math.cos(endAngle), toY - headLength * 0.7 * Math.sin(endAngle));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(endAngle - Math.PI / 7), toY - headLength * Math.sin(endAngle - Math.PI / 7));
    ctx.lineTo(toX - headLength * 0.7 * Math.cos(endAngle), toY - headLength * 0.7 * Math.sin(endAngle));
    ctx.lineTo(toX - headLength * Math.cos(endAngle + Math.PI / 7), toY - headLength * Math.sin(endAngle + Math.PI / 7));
    ctx.closePath();
    ctx.fill();
  } else {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const shaftWidth = size;
    const shaftEndX = toX - headLength * Math.cos(angle);
    const shaftEndY = toY - headLength * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(fromX, fromY, shaftWidth, angle + Math.PI / 2, angle - Math.PI / 2, true);
    ctx.lineTo(shaftEndX + shaftWidth * Math.cos(angle - Math.PI / 2), shaftEndY + shaftWidth * Math.sin(angle - Math.PI / 2));
    ctx.lineTo(shaftEndX + headWidth * Math.cos(angle - Math.PI / 2), shaftEndY + headWidth * Math.sin(angle - Math.PI / 2));
    ctx.lineTo(toX, toY);
    ctx.lineTo(shaftEndX + headWidth * Math.cos(angle + Math.PI / 2), shaftEndY + headWidth * Math.sin(angle + Math.PI / 2));
    ctx.lineTo(shaftEndX + shaftWidth * Math.cos(angle + Math.PI / 2), shaftEndY + shaftWidth * Math.sin(angle + Math.PI / 2));
    ctx.closePath();
    ctx.fill();
  }
}

export function getLayerBounds(layer, ctx) {
  switch (layer.type) {
    case 'circle':
    case 'rect':
    case 'highlight':
      return { x: layer.x, y: layer.y, width: layer.width, height: layer.height };
    case 'arrow':
    case 'line':
      return {
        x: Math.min(layer.x1, layer.x2),
        y: Math.min(layer.y1, layer.y2),
        width: Math.abs(layer.x2 - layer.x1) || 1,
        height: Math.abs(layer.y2 - layer.y1) || 1
      };
    case 'text':
      ctx.font = `bold ${layer.fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
      const metrics = ctx.measureText(layer.text);
      return {
        x: layer.x,
        y: layer.y - layer.fontSize,
        width: metrics.width,
        height: layer.fontSize * 1.2
      };
    default:
      return { x: 0, y: 0, width: 0, height: 0 };
  }
}

export function getHandlePositions(layer, ctx) {
  const handles = [];

  switch (layer.type) {
    case 'arrow':
    case 'line':
      handles.push({ x: layer.x1, y: layer.y1, type: 'endpoint', pos: 'start', cursor: 'move' });
      handles.push({ x: layer.x2, y: layer.y2, type: 'endpoint', pos: 'end', cursor: 'move' });
      const midX = layer.curveX !== undefined ? layer.curveX : (layer.x1 + layer.x2) / 2;
      const midY = layer.curveY !== undefined ? layer.curveY : (layer.y1 + layer.y2) / 2;
      handles.push({ x: midX, y: midY, type: 'curve', pos: 'curve', cursor: 'move' });
      break;

    case 'circle': {
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      const rx = layer.width / 2;
      const ry = layer.height / 2;
      handles.push({ x: cx, y: cy - ry, type: 'resize', pos: 'n', cursor: 'n-resize' });
      handles.push({ x: cx, y: cy + ry, type: 'resize', pos: 's', cursor: 's-resize' });
      handles.push({ x: cx - rx, y: cy, type: 'resize', pos: 'w', cursor: 'w-resize' });
      handles.push({ x: cx + rx, y: cy, type: 'resize', pos: 'e', cursor: 'e-resize' });
      break;
    }

    case 'rect':
    case 'highlight':
      handles.push({ x: layer.x, y: layer.y, type: 'resize', pos: 'nw', cursor: 'nw-resize' });
      handles.push({ x: layer.x + layer.width, y: layer.y, type: 'resize', pos: 'ne', cursor: 'ne-resize' });
      handles.push({ x: layer.x, y: layer.y + layer.height, type: 'resize', pos: 'sw', cursor: 'sw-resize' });
      handles.push({ x: layer.x + layer.width, y: layer.y + layer.height, type: 'resize', pos: 'se', cursor: 'se-resize' });
      break;

    case 'text': {
      ctx.font = `bold ${layer.fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
      const metrics = ctx.measureText(layer.text);
      handles.push({ x: layer.x, y: layer.y - layer.fontSize / 2, type: 'move', pos: 'move', cursor: 'move' });
      handles.push({ x: layer.x + metrics.width, y: layer.y, type: 'resize', pos: 'se', cursor: 'se-resize' });
      break;
    }
  }

  return handles;
}

export function hitTest(x, y, layer, ctx) {
  const bounds = getLayerBounds(layer, ctx);
  const padding = Math.max(layer.size || 0, 5);
  return x >= bounds.x - padding &&
         x <= bounds.x + bounds.width + padding &&
         y >= bounds.y - padding &&
         y <= bounds.y + bounds.height + padding;
}

export function hitTestHandle(x, y, layer, ctx) {
  const handles = getHandlePositions(layer, ctx);
  const hitRadius = 10;

  for (const handle of handles) {
    const dist = Math.sqrt(Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2));
    if (dist < hitRadius) {
      return handle;
    }
  }
  return null;
}
