import { Canvas, PencilBrush  } from 'fabric';

export function initCanvas(ref) {
  const canvas = new Canvas(ref, { backgroundColor: 'white' });
  
  canvas.setDimensions({
    width: 1000,
    height: 500,
  });

  // Настройка карандаша
  const brush = new PencilBrush(canvas);
  brush.color = 'black';
  brush.width = 2;
  canvas.freeDrawingBrush = brush;

  return canvas;
}
