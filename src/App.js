import './App.css';
import { useRef, useEffect, useState } from 'react';
import { initCanvas } from './func/initCanvas';

import Toolbox from './components/Toolbox';
import EditorCanvas from './components/EditorCanvas';
import CanvasSettingsPanel from './components/CanvasSettingsPanel';
import ObjectSettingsPanel from './components/ObjectSettingsPanel';

function App() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [currentFilter, setCurrentFilter] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);

  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [version, setVersion] = useState(0);


  useEffect(() => {
    const canvas = initCanvas(canvasRef.current);
    setCanvas(canvas);

    function handleSelection(e) {
      const obj = canvas.getActiveObject();
      setSelectedObject(obj || null);
      const filter = obj?.filters?.at(0);
      setCurrentFilter(filter ? filter.type.toLowerCase() : null);
    }

    const updateSelected = () => {
      const obj = canvas.getActiveObject();
      setSelectedObject(obj || null);
      setVersion((v) => v + 1); // форсируем перерендер
    };
  
    canvas.on({
      'selection:created': handleSelection,
      'selection:updated': handleSelection,
      'selection:cleared': () => setSelectedObject(null),
      'object:modified': updateSelected,
      'object:scaling': updateSelected,
      'object:moving': updateSelected,
      'object:rotating': updateSelected,
      'object:changed': updateSelected
    });
    
    const handleResize = () => {
    const isSmall = window.innerWidth <= 768;

    // При переходе на мобилку — закрыть панели
    if (isSmall) {
      setShowLeftPanel(false);
      setShowRightPanel(false);
    }

    
  };

  window.addEventListener('resize', handleResize);

  // Вызовем один раз при загрузке
  handleResize();

  return () => {
    window.removeEventListener('resize', handleResize);
    canvas.dispose();

    canvas.off({
      'selection:created': handleSelection,
      'selection:updated': handleSelection,

      'object:modified': updateSelected,
      'object:scaling': updateSelected,
      'object:moving': updateSelected,
      'object:rotating': updateSelected,
      'object:changed': updateSelected
    });
  }
  }, [canvasRef, setCanvas]);

  return (
    <div className="editor">
      <div className="toolbar">
        <Toolbox 
          canvas={canvas} 
          currentFilter={currentFilter} 
          setCurrentFilter={setCurrentFilter}
          setShowLeftPanel={setShowLeftPanel}
          showLeftPanel={showLeftPanel}
          setShowRightPanel={setShowRightPanel}
          showRightPanel={showRightPanel}
        />   
      </div>
      <div className="workspace">
        <div className={`sidebar left ${showLeftPanel ? 'active' : 'hidden'}`}>
          {showLeftPanel && (
            <CanvasSettingsPanel canvas={canvas} />
          )}
        </div>
        <div className="canvasbox">
          <EditorCanvas 
            ref={canvasRef} 
            canvas={canvas} 
            setCurrentFilter={setCurrentFilter}
          />
        </div>
      
        <div className={`sidebar right ${showRightPanel ? 'active' : 'hidden'}`}>
          {showRightPanel && (
            <ObjectSettingsPanel selected={selectedObject} canvas={canvas} />
          )}
        </div>

      </div>
    </div>
  );
}

export default App;