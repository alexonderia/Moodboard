import { useEffect, useRef } from 'react';
import { createUndoRedoStack } from '../UndoRedoStack';

export function useUndoRedo(canvas) {
  const history = useRef(createUndoRedoStack());
  const isRestoring = useRef(false);

  const saveState = () => {
    if (!canvas || isRestoring.current) return;
    const json = JSON.stringify(canvas.toJSON());
    history.current.push(json);
  };

  const undo = () => {
    if (!canvas) return;

    const undoList = history.current.getValues().undo;
    if (undoList.length < 2) return;

    const current = undoList[undoList.length - 1];
    history.current.undo();

    const previous = history.current.getValues().undo.slice(-1)[0];
    if (previous) {
      isRestoring.current = true;
      canvas.loadFromJSON(JSON.parse(previous), () => {
        canvas.renderAll();
        setTimeout(() => canvas.renderAll(), 20);
        isRestoring.current = false;
      });
    }
  };

  const redo = () => {
    if (!canvas) return;

    const redoList = history.current.getValues().redo;
    if (!redoList.length) return;

    const current = redoList[redoList.length - 1];
    history.current.redo();

    if (current) {
      isRestoring.current = true;
      canvas.loadFromJSON(JSON.parse(current), () => {
        canvas.renderAll();
        setTimeout(() => canvas.renderAll(), 20);
        isRestoring.current = false;
      });
    }
  };

  useEffect(() => {
    if (!canvas) return;

    const handleChange = () => {
      if (!isRestoring.current) saveState();
    };

    saveState();

    canvas.on('object:added', handleChange);
    canvas.on('object:modified', handleChange);
    canvas.on('object:removed', handleChange);
    canvas.on('path:created', handleChange);

    return () => {
      canvas.off('object:added', handleChange);
      canvas.off('object:modified', handleChange);
      canvas.off('object:removed', handleChange);
      canvas.off('path:created', handleChange);
    };
  }, [canvas]);


  return { undo, redo };
}
