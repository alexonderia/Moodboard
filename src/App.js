import './App.css';
import { useRef, useEffect, useState } from 'react';
import { initCanvas } from './func/initCanvas';

import Toolbox from './components/Toolbox';
import EditorCanvas from './components/EditorCanvas';

function App() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [currentFilter, setCurrentFilter] = useState(null);

  useEffect(() => {
    const canvas = initCanvas(canvasRef.current);
    setCanvas(canvas);

    function handleSelection(e) {
      const obj = e.selected?.length === 1 ? e.selected[0] : null;
      const filter = obj?.filters?.at(0);
      setCurrentFilter(filter ? filter.type.toLowerCase() : null);
    }
  
    canvas.on({
      'selection:created': handleSelection,
      'selection:updated': handleSelection,
      'selection:cleared': handleSelection
    });
    
    return () => {
      canvas.dispose();

      canvas.off({
        'selection:created': handleSelection,
        'selection:updated': handleSelection,
        'selection:cleared': handleSelection
      });
    }
  }, [canvasRef, setCanvas]);

  return (
    <div className="editor">
      <Toolbox 
        canvas={canvas} 
        currentFilter={currentFilter} 
        setCurrentFilter={setCurrentFilter}
      />
      <EditorCanvas 
        ref={canvasRef} 
        canvas={canvas} 
        setCurrentFilter={setCurrentFilter}
      />
    </div>
  );
}

export default App;