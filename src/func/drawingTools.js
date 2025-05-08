import { IText } from 'fabric';

export function addText(canvas) {
  if (!canvas) return;
  const text = new IText('Edit this text');
  canvas.add(text);
  canvas.centerObject(text);
  canvas.setActiveObject(text); 
}