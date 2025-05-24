import { Line, Path } from 'fabric';

export function toggleDrawingMode(canvas, setDrawingMode) {
  if (!canvas) return;
  canvas.isDrawingMode = !canvas.isDrawingMode;
  setDrawingMode(canvas.isDrawingMode);
}

export function initializeLineDrawing(canvas) {
  if (!canvas) return;

  let isDrawingLine = false;
  let lineToDraw = null;
  let pointerPoints = [];

  function onMouseDown(o) {
    if (!canvas.isDrawingLineMode) return;

    isDrawingLine = true;
    const pointer = canvas.getPointer(o.e);
    pointerPoints = [pointer.x, pointer.y, pointer.x, pointer.y];

    lineToDraw = new Line(pointerPoints, {
      strokeWidth: 2,
      stroke: '#000000',
      selectable: false,
      evented: false,
      strokeUniform: true,
    });

    canvas.add(lineToDraw);
    canvas.selection = true;
  }

  function onMouseMove(o) {
    if (!isDrawingLine) return;

    const pointer = canvas.getPointer(o.e);

    if (o.e.shiftKey) {
      const startX = pointerPoints[0];
      const startY = pointerPoints[1];
      const x2 = pointer.x - startX;
      const y2 = pointer.y - startY;
      const r = Math.sqrt(x2 * x2 + y2 * y2);
      let angle = (Math.atan2(y2, x2) / Math.PI) * 180;

      angle = parseInt(((angle + 7.5) % 360) / 15) * 15;

      const cosx = r * Math.cos((angle * Math.PI) / 180);
      const sinx = r * Math.sin((angle * Math.PI) / 180);

      lineToDraw.set({
        x2: cosx + startX,
        y2: sinx + startY,
      });
    } else {
      lineToDraw.set({
        x2: pointer.x,
        y2: pointer.y,
      });
    }

    canvas.renderAll();
  }

  function onMouseUp() {
    if (!isDrawingLine) return;

    lineToDraw.setCoords();
    isDrawingLine = false;

    lineToDraw.set({
      selectable: true,
      evented: true
    });

    canvas.setActiveObject(lineToDraw); // выделяем созданную линию

    canvas.fire('object:modified');
  }

  // Вешаем обработчики
  canvas.on('mouse:down', onMouseDown);
  canvas.on('mouse:move', onMouseMove);
  canvas.on('mouse:up', onMouseUp);

  // Возвращаем функцию для отключения, чтобы можно было отписаться при выключении инструмента
  return () => {
    canvas.off('mouse:down', onMouseDown);
    canvas.off('mouse:move', onMouseMove);
    canvas.off('mouse:up', onMouseUp);
  };
}

export function toggleLineDrawingMode(canvas, setDrawingMode, setCleanupHandler) {
  if (!canvas) return;

  // Переключаем режим
  canvas.isDrawingLineMode = !canvas.isDrawingLineMode;
  setDrawingMode(canvas.isDrawingLineMode);

  // Если включили, инициализируем инструмент
  if (canvas.isDrawingLineMode) {
    const cleanup = initializeLineDrawing(canvas);
    setCleanupHandler(() => cleanup);
  } else {
    // Если выключили - отписываемся от событий
    setCleanupHandler((cleanup) => {
      if (cleanup) cleanup();
      return null;
    });
  }
}

export function togglePathDrawingMode(canvas, setDrawingMode, setCleanupHandler) {
  if (!canvas) return;

  canvas.isDrawingPathMode = !canvas.isDrawingPathMode;
  setDrawingMode(canvas.isDrawingPathMode);

  if (canvas.isDrawingPathMode) {
    const cleanup = initializePathDrawing(canvas);
    setCleanupHandler(() => cleanup);
  } else {
    setCleanupHandler((cleanup) => {
      if (cleanup) cleanup();
      return null;
    });
  }
}

const inRange = (radius, cursorX, cursorY, targetX, targetY) => {
  return Math.abs(cursorX - targetX) <= radius && Math.abs(cursorY - targetY) <= radius;
};

export function initializePathDrawing(canvas) {
  if (!canvas) return;

  let isDrawingPath = false;
  let pathToDraw = null;
  let pointer = null;
  let updatedPath = null;
  let isMouseDown = false;
  let isDrawingCurve = false;
  let rememberX, rememberY;

  function onMouseDown(o) {
    if (!canvas.isDrawingPathMode) return;

    isMouseDown = true;
    isDrawingPath = true;
    pointer = canvas.getPointer(o.e);

    if (!pathToDraw) {
      pathToDraw = new Path(`M${pointer.x} ${pointer.y} L${pointer.x} ${pointer.y}`, {
        strokeWidth: 2,
        stroke: '#000000',
        fill: false,
        selectable: false,
        evented: false,
        strokeUniform: true,
      });
      canvas.add(pathToDraw);
      return;
    }

    if (pathToDraw) {
      pathToDraw.path.push(['L', pointer.x, pointer.y]);
      updatePathDimensions(pathToDraw, canvas);
    }
  }

  function onMouseMove(o) {
    if (!canvas.isDrawingPathMode || !isDrawingPath) return;

    pointer = canvas.getPointer(o.e);

    if (!isDrawingCurve) {
      updatedPath = ['L', pointer.x, pointer.y];
    }

    pathToDraw.path.pop();

    // Shift key - фиксированные углы
    if (o.e.shiftKey && !isDrawingCurve) {
      const lastPoint = pathToDraw.path[pathToDraw.path.length - 1];
      const startX = lastPoint[1];
      const startY = lastPoint[2];

      const x2 = pointer.x - startX;
      const y2 = pointer.y - startY;
      const r = Math.sqrt(x2 * x2 + y2 * y2);
      let angle = (Math.atan2(y2, x2) / Math.PI) * 180;
      angle = parseInt(((angle + 7.5) % 360) / 15) * 15;

      const cosx = r * Math.cos((angle * Math.PI) / 180);
      const sinx = r * Math.sin((angle * Math.PI) / 180);

      updatedPath[1] = cosx + startX;
      updatedPath[2] = sinx + startY;
    }

    // Прилипание к ближайшей точке
    if (pathToDraw.path.length > 1 && !isDrawingCurve) {
      const snapPoints = pathToDraw.path.slice(0, -1);
      for (const p of snapPoints) {
        if ((p[0] === 'L' || p[0] === 'M') && inRange(10, pointer.x, pointer.y, p[1], p[2])) {
          updatedPath[1] = p[1];
          updatedPath[2] = p[2];
          break;
        }
        if (p[0] === 'Q' && inRange(10, pointer.x, pointer.y, p[3], p[4])) {
          updatedPath[1] = p[3];
          updatedPath[2] = p[4];
          break;
        }
      }
    }

    if (isMouseDown) {
      if (!isDrawingCurve && pathToDraw.path.length > 1) {
        isDrawingCurve = true;

        const lastPath = pathToDraw.path.pop();

        if (lastPath[0] === 'Q') {
          updatedPath = ['Q', lastPath[3], lastPath[4], lastPath[3], lastPath[4]];
          rememberX = lastPath[3];
          rememberY = lastPath[4];
        } else {
          updatedPath = ['Q', lastPath[1], lastPath[2], lastPath[1], lastPath[2]];
          rememberX = lastPath[1];
          rememberY = lastPath[2];
        }
      } else if (isDrawingCurve) {
        const mouseMoveX = pointer.x - updatedPath[3];
        const mouseMoveY = pointer.y - updatedPath[4];

        updatedPath = [
          'Q',
          rememberX - mouseMoveX,
          rememberY - mouseMoveY,
          rememberX,
          rememberY,
        ];
      }
    }

    pathToDraw.path.push(updatedPath);
    updatePathDimensions(pathToDraw, canvas);
  }

  function onMouseUp(o) {
    if (!canvas.isDrawingPathMode) {
      isMouseDown = false;
      isDrawingCurve = false;
      return;
    }

    isMouseDown = false;

    if (isDrawingCurve) {
      pointer = canvas.getPointer(o.e);
      pathToDraw.path.push(['L', pointer.x, pointer.y]);
      updatePathDimensions(pathToDraw, canvas);
      pathToDraw.setCoords();
      canvas.renderAll();
    }

    isDrawingCurve = false;

    // if (pathToDraw) {
    //   pathToDraw.set({
    //     selectable: true,
    //     evented: true,
    //   });
    //   pathToDraw.setCoords();
    //   canvas.setActiveObject(pathToDraw);
    // }
  }

  function cancelDrawing() {
    if (!pathToDraw) return;

    pathToDraw.path.pop();
    
    pathToDraw.set({
      selectable: true,
      evented: true,
    });
    pathToDraw.setCoords();
    canvas.setActiveObject(pathToDraw);

    if (pathToDraw.path.length > 1) {
      updatePathDimensions(pathToDraw, canvas);
    } else {
      canvas.remove(pathToDraw);
    }
    canvas.renderAll();
    canvas.fire('object:modified');

    pathToDraw = null;
    isDrawingPath = false;
  }

  function onKeyDown(e) {
    if (!isDrawingPath) return;

    if (e.key === 'Escape' || e.keyCode === 27) {
      cancelDrawing();
    }
  }

  function onDocumentMouseDown(e) {
    if (!isDrawingPath) return;

    if (!document.querySelector('.canvas-container').contains(e.target)) {
      cancelDrawing();
    }
  }

  function updatePathDimensions(path, canvas) {
    const dims = path._calcDimensions();
    path.set({
      width: dims.width,
      height: dims.height,
      left: dims.left,
      top: dims.top,
      pathOffset: {
        x: dims.width / 2 + dims.left,
        y: dims.height / 2 + dims.top,
      },
      dirty: true,
    });
    canvas.renderAll();
  }

  canvas.on('mouse:down', onMouseDown);
  canvas.on('mouse:move', onMouseMove);
  canvas.on('mouse:up', onMouseUp);

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('mousedown', onDocumentMouseDown);

  // Возвращаем функцию очистки обработчиков
  return () => {
    canvas.off('mouse:down', onMouseDown);
    canvas.off('mouse:move', onMouseMove);
    canvas.off('mouse:up', onMouseUp);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('mousedown', onDocumentMouseDown);
  };
}


