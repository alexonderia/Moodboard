export function clearAll(canvas) {
  if (!canvas) return;
  if(window.confirm('Уверены, что хотите очистить весь холст?')) {
    canvas.remove(...canvas.getObjects());
  }
}