export function downloadImage(canvas) {
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = 'Moodboard.png';
  link.href = canvas.toDataURL();
  link.click();
}