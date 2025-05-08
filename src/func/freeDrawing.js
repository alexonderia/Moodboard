export function toggleDrawingMode(canvas, setDrawingMode) {
  if (!canvas) return;
  canvas.isDrawingMode = !canvas.isDrawingMode;
  setDrawingMode(canvas.isDrawingMode);
}