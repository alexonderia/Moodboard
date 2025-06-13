export function stack(state = []) {
  return {
    push: val => state.push(val),
    pop: () => state.pop(),
    isEmpty: () => state.length < 1,
    clear: () => state.splice(0),
    current: () => state[state.length - 1],
    getValues: () => [...state],
  };
}

export function createUndoRedoStack() {
  const undoStack = stack();
  const redoStack = stack();

  return {
    push: val => {
      undoStack.push(val);
      redoStack.clear();
    },
    undo: () => {
      if (!undoStack.isEmpty()) {
        redoStack.push(undoStack.pop());
      }
    },
    redo: () => {
      if (!redoStack.isEmpty()) {
        undoStack.push(redoStack.pop());
      }
    },
    clear: () => {
      undoStack.clear();
      redoStack.clear();
    },
    latest: () => undoStack.current(),
    getValues: () => ({
      undo: undoStack.getValues(),
      redo: redoStack.getValues(),
    }),
  };
}
