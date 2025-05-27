export function applyCanvasSize(canvas, width, height) {
  if (!canvas) return;
  canvas.setWidth(width);
  canvas.setHeight(height);
  canvas.renderAll();
}

export function applyBackgroundColor(canvas, color) {
  if (!canvas) return;
  canvas.backgroundColor = color;
  canvas.renderAll();
}

