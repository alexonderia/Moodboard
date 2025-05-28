
export const downloadCanvasAsImage = (canvas, extension = 'png') => {
  if (!canvas) return;

  const mimeType = extension === 'jpg' || extension === 'jpeg'
    ? 'image/jpeg'
    : 'image/png';

  const dataURL = canvas.toDataURL({
    format: extension,
    quality: 1.0,
  });

  const imageData = dataURL.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
  const byteCharacters = atob(imageData);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: `${mimeType};base64` });
  const fileURL = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = fileURL;
  link.download = `Moodboard.${extension}`;
  link.dispatchEvent(new MouseEvent('click'));

  setTimeout(() => {
    URL.revokeObjectURL(fileURL);
  }, 100);
};

export const downloadCanvasAsSVG = (canvas) => {
  if (!canvas) return;

  const svgMarkup = canvas.toSVG();
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'Moodboard.svg';
  link.dispatchEvent(new MouseEvent('click'));

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

export function downloadCanvasAsJSON(canvas) {
  if (!canvas) return;

  const json = canvas.toJSON(['selectable', 'name']); // можешь добавить свои свойства
  const jsonString = JSON.stringify(json);

  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'canvas.json';
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 100);
}
