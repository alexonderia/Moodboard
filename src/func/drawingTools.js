import { IText, Textbox, Rect } from 'fabric';

export function addText(canvas) {
  if (!canvas) return;
  const text = new IText('Новый текст');
  canvas.add(text);
  canvas.centerObject(text);
  canvas.setActiveObject(text); 
}

export function toggleDrawingTextMode(canvas, setDrawingTextMode) {
  if (!canvas) return;
  canvas.isDrawingTextMode = !canvas.isDrawingTextMode;
  setDrawingTextMode(canvas.isDrawingTextMode);
}

export const initTextTool = (canvas, setDrawingTextMode) => {
  if (!canvas) return;
  canvas.isDrawingTextMode = !canvas.isDrawingTextMode;
  setDrawingTextMode(canvas.isDrawingTextMode);

  let isDrawing = false;
  let rect = null;
  let startX = 0;
  let startY = 0;

  const onMouseDown = (opt) => {
    if (!canvas.isDrawingTextMode) return;

    isDrawing = true;
    const pointer = canvas.getPointer(opt.e);
    startX = pointer.x;
    startY = pointer.y;

    rect = new Rect({
      left: startX,
      top: startY,
      width: 0,
      height: 0,
      stroke: '#C00000',
      fill: 'rgba(192, 0, 0, 0.2)',
      strokeWidth: 1,
      selectable: false,
    });

    canvas.add(rect);
  };

  const onMouseMove = (opt) => {
    if (!isDrawing || !rect) return;

    const pointer = canvas.getPointer(opt.e);
    rect.set({
      left: Math.min(startX, pointer.x),
      top: Math.min(startY, pointer.y),
      width: Math.abs(startX - pointer.x),
      height: Math.abs(startY - pointer.y),
    });

    canvas.renderAll();
  };

  const onMouseUp = () => {
    if (!isDrawing || !rect) return;

    isDrawing = false;

    const textbox = new Textbox('Новый текст', {
      left: rect.left,
      top: rect.top,
      width: rect.width < 80 ? 80 : rect.width,
      fontSize: 18,
      fontFamily: 'Open Sans',
      lockScalingFlip: true,
    });

    canvas.remove(rect);
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    textbox.setControlsVisibility({ 
      mt: true,
      mb: true,
    });
    //canvas.isDrawingTextMode = false;
    canvas.requestRenderAll();
  };

  // Подписываемся на масштабирование текста только один раз
  const handleObjectScaling = (e) => {
    const obj = e.target;
    if (!(obj instanceof Textbox)) return;

    const corner = obj.__corner;
    if (!corner) return;

    if (corner === 'ml' || corner === 'mr') {
      // Изменение только ширины
      const scaleX = obj.scaleX;
      obj.set({
        width: obj.width * scaleX,
        scaleX: 1,
        // высота оставляем без изменений
      });
    } else if (corner === 'mt' || corner === 'mb') {
      // Изменение только высоты
      const scaleY = obj.scaleY;
      obj.set({
        height: obj.height * scaleY,
        scaleY: 1,
        // ширина оставляем без изменений
      });
    } else if (['tl','tr','bl','br'].includes(corner)) {
      // Изменение ширины и высоты вместе
      const scaleX = obj.scaleX;
      const scaleY = obj.scaleY;
      obj.set({
        width: obj.width * scaleX,
        height: obj.height * scaleY,
        scaleX: 1,
        scaleY: 1,
      });
    }
    obj.setCoords();
  };


  // Если уже подписаны, не подписываемся повторно
  canvas.off('object:scaling', handleObjectScaling);
  canvas.on('object:scaling', handleObjectScaling);

  canvas.on('mouse:down', onMouseDown);
  canvas.on('mouse:move', onMouseMove);
  canvas.on('mouse:up', onMouseUp);
};
