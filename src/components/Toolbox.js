import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addText, toggleDrawingTextMode } from '../func/drawingTextTools';
import { applyFilter} from '../func/filters';
import { clearAll } from '../func/clearAll';
import { loadImage, loadCanvasFromJSON } from '../func/import';
import { downloadCanvasAsImage, downloadCanvasAsSVG, downloadCanvasAsJSON } from '../func/export';
import { saveInBrowser } from '../func/saveInBrowser';
import { toggleDrawingMode, toggleLineDrawingMode, togglePathDrawingMode  } from '../func/drawingTools';


const Toolbox = ({ canvas, canvasBoxRef, currentFilter, setCurrentFilter, setShowLeftPanel, showLeftPanel, setShowRightPanel, showRightPanel, undo, redo }) => {
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingTextMode, setDrawingTextMode] = useState(false);
  const [drawingLineMode, setDrawingLineMode] = useState(false);
  const [drawingPathMode, setDrawingPathMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [cleanupHandler, setCleanupHandler] = useState(null);


   // Состояние для хранения смещения контейнера
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const canvasbox = canvasBoxRef?.current;

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (drawingMode) toggleDrawingMode(canvas, setDrawingMode);
        if (drawingTextMode) toggleDrawingTextMode(canvas, setDrawingTextMode); 
        if (drawingLineMode) toggleLineDrawingMode(canvas, setDrawingLineMode, setCleanupHandler);
        if (drawingPathMode) togglePathDrawingMode(canvas, setDrawingPathMode, setCleanupHandler);
        if (isPanning) setIsPanning(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawingMode, drawingTextMode, drawingLineMode, drawingPathMode, isPanning, canvas, setCleanupHandler]);

  useEffect(() => {
    if (canvas && currentFilter) {
      applyFilter(canvas, currentFilter);
    }
    return () => {
      if (cleanupHandler) cleanupHandler();
    };
  }, [canvas, currentFilter, cleanupHandler]);

  useEffect(() => {
      if (!isPanning || !canvasbox) return;

      setDrawingMode(false);
      setDrawingTextMode(false);
      setDrawingLineMode(false);
      setDrawingPathMode(false);

      // События мыши на window для плавного перетаскивания
      function onMouseDown(e) {
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
      }

      function onMouseMove(e) {
        if (!isDragging.current) return;

        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;

        setPanOffset(prev => {
          const newX = prev.x + dx;
          const newY = prev.y + dy;

          // Обновляем стиль контейнера
          if (canvasbox) {
            canvasbox.style.transform = `translate(${newX}px, ${newY}px)`;
          }

          return { x: newX, y: newY };
        });

        lastPos.current = { x: e.clientX, y: e.clientY };
      }

      function onMouseUp() {
        isDragging.current = false;
      }

      // Добавляем слушатели
      canvasbox.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      // При выключении режима — сброс трансформации (по желанию)
      return () => {
        canvasbox.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        isDragging.current = false;
      };
    }, [isPanning, canvasbox]);
    
  return (
    <div className="toolbox">

      <button
        title="Перемещение холста"
        onClick={() => {
          setIsPanning(!isPanning);
          setDrawingMode(false);
          setDrawingTextMode(false);
          setDrawingLineMode(false);
          setDrawingPathMode(false);
        }}
        className={isPanning ? 'active' : ''}
      >
        <FontAwesomeIcon icon="hand-paper" />
      </button>
      
      <button title="Добавить текст" onClick={() => addText(canvas)}>
        <FontAwesomeIcon icon="font" />
      </button>

      <button title="Добавить текст в рамке" onClick={() => toggleDrawingTextMode(canvas, setDrawingTextMode)} className={drawingTextMode ? 'active' : ''}>
        <FontAwesomeIcon icon="pen-to-square" />
      </button>

      <button title="Режим свободного рисования" onClick={() => toggleDrawingMode(canvas, setDrawingMode)} className={drawingMode ? 'active' : ''}>
        <FontAwesomeIcon icon="pencil" />
      </button>

      <button title="Режим рисования прямых"
        onClick={() => toggleLineDrawingMode(canvas, setDrawingLineMode, setCleanupHandler)}
        className={drawingLineMode ? 'active' : ''}
      >
        <FontAwesomeIcon icon="slash" />
      </button>

      <button title="Режим рисования кривых"
        onClick={() => togglePathDrawingMode(canvas, setDrawingPathMode, setCleanupHandler)}
        className={drawingPathMode ? 'active' : ''}
      >
        <FontAwesomeIcon icon="bezier-curve" />
      </button>

      <button title="Загрузить изображение">
        <FontAwesomeIcon icon="image" />
        <input
          type="file"
          accept=".png, .jpg, .jpeg, .svg"
          onChange={loadImage(canvas)} />
      </button>

      <button title="Фильтры" 
        onClick={() => setCurrentFilter(currentFilter ? null : 'sepia')} 
        className={currentFilter ? 'active' : ''}>
        <FontAwesomeIcon icon="filter" />
      </button>
      
      {currentFilter && 
        <select onChange={(e) => setCurrentFilter(e.target.value)} value={currentFilter}>
          <option value="sepia">Sepia</option>
          <option value="vintage">Vintage</option>
          <option value="invert">Invert</option>
          <option value="polaroid">Polaroid</option>
          <option value="grayscale">Grayscale</option>
        </select>
      }

      <button title="Очистить холст" onClick={() => clearAll(canvas)}>
        <FontAwesomeIcon icon="trash" />
      </button>
      
      <button title="Настройки холста" onClick={() => setShowLeftPanel(!showLeftPanel)}>
        <FontAwesomeIcon icon="gear" />
      </button>

      <button title="Отменить (Ctrl+Z)" onClick={undo}>
        <FontAwesomeIcon icon="arrow-rotate-left" />
      </button>

      <button title="Повторить (Ctrl+Y)" onClick={redo}>
        <FontAwesomeIcon icon="arrow-rotate-right" />
        
      </button>

      <button title="Сохранить в браузере" onClick={() => {
        if (canvas) {
          const json = canvas.toJSON();
          saveInBrowser.save('canvasState', json);
          alert('Холст сохранён в браузере!');
        }
      }}>
        <FontAwesomeIcon icon="floppy-disk" />
      </button>

      <button title="Загрузить из браузера" onClick={() => {
        const saved = saveInBrowser.load('canvasState');
        
        if (saved && canvas) {
          canvas.loadFromJSON(saved, () => {
            canvas.renderAll();
            alert('Холст загружен!');
          });
        } else {
          alert('Нет сохранённого холста.');
        }
      }}>
        <FontAwesomeIcon icon="folder-open" />
      </button>

      <button title="Скачать как..." onClick={() => {
        // Удаляем старую модалку, если есть
        document.querySelector('.custom-modal-container')?.remove();

        const modal = document.createElement('div');
        modal.className = 'custom-modal-container';
        modal.innerHTML = `
          <div class="custom-modal-content">            
            <div class="button-download" id="png">Скачать как PNG</div>
            <div class="button-download" id="jpg">Скачать как JPG</div>
            <div class="button-download" id="svg">Скачать как SVG</div>
            <div class="button-download" id="json">Скачать как JSON</div>
          </div>
        `;

        document.body.appendChild(modal);

        // Закрытие по клику вне
        modal.addEventListener('click', () => modal.remove());

        // Клик по кнопкам внутри
        modal.querySelectorAll('.button-download').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const type = btn.id;
            if (!canvas) return;

            if (type === 'svg') {
              downloadCanvasAsSVG(canvas);
            } else if (type === 'png') {
              downloadCanvasAsImage(canvas);
            } else if (type === 'jpg') {
              downloadCanvasAsImage(canvas, 'jpg');
            } else if (type === 'json') {
              downloadCanvasAsJSON(canvas);
            }
            modal.remove();
          });
        });
      }}>
        <FontAwesomeIcon icon="download" />
      </button>

      <button title="Открыть JSON">
        <FontAwesomeIcon icon="file-upload" />
        <input
          type="file"
          accept=".json"
          onChange={loadCanvasFromJSON(canvas)}
        />
      </button>


    </div>
  );
};
  
export default Toolbox;