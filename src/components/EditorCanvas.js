import { forwardRef, useEffect } from 'react';


const EditorCanvas = forwardRef(({ canvas, setCurrentFilter, isDrawingTextMode  }, ref) => {
  useEffect(() => {
    if(!canvas) return;
  
     
    function handleKeyDown(e) {
      if(e.key === 'Delete') {
        for(const obj of canvas.getActiveObjects()) {
          canvas.remove(obj);
          canvas.discardActiveObject();
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown, false);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
    }
  
  }, [canvas, setCurrentFilter]);


  
  return (
    <div className="canvasbox">
      <canvas ref={ref} width="1000" height="500"></canvas>
    </div>
  );
});
  
export default EditorCanvas;