import { forwardRef, useEffect, useState } from 'react';

const EditorCanvas = forwardRef(({ canvas, setCurrentFilter, zoom, setZoom  }, ref) => {
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if(!canvas) return;

    if (!canvas.originalWidth) {
      canvas.originalWidth = canvas.getWidth();
      canvas.originalHeight = canvas.getHeight();
    }
    
    function handleKeyDown(e) {
      if(e.key === 'Delete') {
        for(const obj of canvas.getActiveObjects()) {
          canvas.remove(obj);
          canvas.discardActiveObject();
        }
      }
    }    
    document.addEventListener('keydown', handleKeyDown, false);

    function handleWheel(e) {
      e.preventDefault();

      if (!e.ctrlKey) return; // масштабируем только с Ctrl

      
      // Получаем позицию курсора относительно контейнера с canvas
      const rect = canvas.wrapperEl.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      // Устанавливаем новую точку origin в процентах, чтобы transform-origin корректно работал
      const originX = (offsetX / rect.width) * 100;
      const originY = (offsetY / rect.height) * 100;

      setOrigin({ x: originX, y: originY });

      const zoomStep = 0.02;
      let newZoom = zoom;

      if (e.deltaY < 0) {
        newZoom = zoom + zoomStep;
      } else {
        newZoom = zoom - zoomStep;
      }

      newZoom = Math.min(Math.max(newZoom, 0.1), 2);

      setZoom(newZoom);
    }


    canvas.wrapperEl.addEventListener('wheel', handleWheel, { passive: false });


    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
      if (canvas.wrapperEl) {
        canvas.wrapperEl.removeEventListener('wheel', handleWheel);
      }
    }  
  }, [canvas, setCurrentFilter, zoom]);

  
  return (
    <div className="canvasbox" style={{ width: '1000px', height: '500px',
        transform: `scale(${zoom})`,
        transformOrigin: `${origin.x}% ${origin.y}%`,
        overflow: 'visible' }}>
      <canvas
        ref={ref}
        width={canvas?.originalWidth || 1000}
        height={canvas?.originalHeight || 500}
        style={{ width: '100%', height: '100%', border: '1px solid #ccc' }}
      />
    </div>
  );
});
  
export default EditorCanvas;