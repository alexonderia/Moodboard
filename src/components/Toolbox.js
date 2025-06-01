import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateProject } from '../api/projects';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addText, toggleDrawingTextMode } from '../func/drawingTextTools';
import { applyFilter} from '../func/filters';
import { clearAll } from '../func/clearAll';
import { loadImage, loadCanvasFromJSON } from '../func/import';
import { downloadCanvasAsImage, downloadCanvasAsSVG, downloadAsJSON } from '../func/export';
import { saveInBrowser } from '../func/saveInBrowser';
import { toggleDrawingMode, toggleLineDrawingMode, togglePathDrawingMode  } from '../func/drawingTools';

const Toolbox = ({
  canvas,
  canvasBoxRef,
  currentFilter,
  setCurrentFilter,
  setShowLeftPanel,
  showLeftPanel,
  setShowRightPanel,
  showRightPanel,
  undo,
  redo,
  brief,
  setBrief,
  projectTitle,
  setProjectTitle
}) => {
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingTextMode, setDrawingTextMode] = useState(false);
  const [drawingLineMode, setDrawingLineMode] = useState(false);
  const [drawingPathMode, setDrawingPathMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [cleanupHandler, setCleanupHandler] = useState(null);
  const { id } = useParams();
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const navigate = useNavigate();

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

  function getThumbnailFromCanvas(canvas, maxWidth = 200, maxHeight = 150) {
    // Создаём временный канвас для превью
    const thumbCanvas = document.createElement('canvas');
    const ctx = thumbCanvas.getContext('2d');

    const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);

    thumbCanvas.width = canvas.width * scale;
    thumbCanvas.height = canvas.height * scale;

    // Рисуем оригинальный canvas на временный с масштабом
    ctx.scale(scale, scale);
    ctx.drawImage(canvas.lowerCanvasEl, 0, 0);

    return thumbCanvas.toDataURL('image/png');
  }

    
  const updateProjectOnServer = async () => {
    if (!canvas) return alert('Холст не загружен');
    if (!id) return alert('Нет ID проекта для обновления');

    try {
      // Собираем полные данные
      const canvasData = canvas.toJSON(['selectable', 'name']);
      const fullData = {
        canvas: canvasData,
        brief: brief || null,
      };

      // Сериализация как строка (тоже можно, как альтернатива: отправлять объект напрямую)
      const serializedData = JSON.stringify(fullData);

      // Отправляем обновлённые данные на сервер
      await updateProject(id, {
        title: projectTitle || 'Без названия',
        preview: getThumbnailFromCanvas(canvas),
        data: serializedData,
      });

      alert('Проект успешно обновлён!');
    } catch (error) {
      console.error(error);
      alert('Ошибка при обновлении проекта');
    }
  };


  return (
    <div className="toolbox">
      <div className="toolbox-left">
        <div className="toolbox-section">
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

          <button title="Свободное рисование" onClick={() => toggleDrawingMode(canvas, setDrawingMode)} className={drawingMode ? 'active' : ''}>
            <FontAwesomeIcon icon="pencil" />
          </button>

          <button title="Рисовать линии" onClick={() => toggleLineDrawingMode(canvas, setDrawingLineMode, setCleanupHandler)} className={drawingLineMode ? 'active' : ''}>
            <FontAwesomeIcon icon="slash" />
          </button>

          <button title="Рисовать кривые" onClick={() => togglePathDrawingMode(canvas, setDrawingPathMode, setCleanupHandler)} className={drawingPathMode ? 'active' : ''}>
            <FontAwesomeIcon icon="bezier-curve" />
          </button>

          <button title="Текст" onClick={() => addText(canvas)}>
            <FontAwesomeIcon icon="font" />
          </button>

          <button title="Текст в рамке" onClick={() => toggleDrawingTextMode(canvas, setDrawingTextMode)} className={drawingTextMode ? 'active' : ''}>
            <FontAwesomeIcon icon="pen-to-square" />
          </button>
        </div>

        <div className="toolbox-section">
          <button title="Загрузить изображение">
            <FontAwesomeIcon icon="image" />
            <input type="file" accept=".png, .jpg, .jpeg, .svg" onChange={loadImage(canvas)} />
          </button>

          <button title="Фильтр" onClick={() => setCurrentFilter(currentFilter ? null : 'sepia')} className={currentFilter ? 'active' : ''}>
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
        </div>

        <div className="toolbox-section">
          <button title="Очистить" onClick={() => clearAll(canvas)}>
            <FontAwesomeIcon icon="trash" />
          </button>
          <button title="Настройки холста" onClick={() => setShowLeftPanel(!showLeftPanel)}>
            <FontAwesomeIcon icon="gear" />
          </button>
        </div>

        <div className="toolbox-section">
          <button title="Отменить" onClick={undo}>
            <FontAwesomeIcon icon="arrow-rotate-left" />
          </button>
          <button title="Повторить" onClick={redo}>
            <FontAwesomeIcon icon="arrow-rotate-right" />
          </button>
        </div>

        <div className="toolbox-section">
          <button title="Сохранить в браузере" onClick={() => {
            if (canvas) {
              saveInBrowser.save('canvasState', canvas.toJSON());
              alert('Проект сохранён в браузере!\nВнимание! Данное действие не сохраняет проект на сервере.');
            }
          }}>
            <FontAwesomeIcon icon="cloud-arrow-down" />
          </button>

          <button title="Загрузить из браузера" onClick={() => {
            const saved = saveInBrowser.load('canvasState');
            if (saved && canvas) {
              canvas.loadFromJSON(saved, () => canvas.renderAll());
              setTimeout(() => canvas.renderAll(), 20);
              alert('Проект загружен!');
            } else {
              alert('Нет сохранённых данных.');
            }
          }}>
            <FontAwesomeIcon icon="cloud-arrow-up" />
          </button>

          <button title="Скачать как.." onClick={() => {
            document.querySelector('.custom-modal-container')?.remove();
            const modal = document.createElement('div');
            modal.className = 'custom-modal-container';
            modal.innerHTML = `
              <div class="custom-modal-content">            
                <div class="button-download" id="png">Скачать PNG</div>
                <div class="button-download" id="jpg">Скачать JPG</div>
                <div class="button-download" id="svg">Скачать SVG</div>
                <div class="button-download" id="json">Скачать JSON</div>
              </div>
            `;
            document.body.appendChild(modal);
            modal.addEventListener('click', () => modal.remove());
            modal.querySelectorAll('.button-download').forEach(btn => {
              btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!canvas) return;
                const type = btn.id;
                if (type === 'svg') downloadCanvasAsSVG(canvas);
                else if (type === 'png') downloadCanvasAsImage(canvas);
                else if (type === 'jpg') downloadCanvasAsImage(canvas, 'jpg');
                else if (type === 'json') downloadAsJSON(canvas, brief);
                modal.remove();
              });
            });
          }}>
            <FontAwesomeIcon icon="download" />
          </button>

          <button title="Открыть JSON">
            <FontAwesomeIcon icon="upload" />
            <input type="file" accept=".json" onChange={loadCanvasFromJSON(canvas, setBrief)} />
          </button>
        </div>
      </div>
      <div className="toolbox-section project-header">
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          placeholder="Название проекта"
          className="project-title-input"
        />
        <button onClick={updateProjectOnServer} title="Сохранить проект">
          <FontAwesomeIcon icon="floppy-disk" />
        </button>
        <button onClick={() => navigate('/projects')} title="К списку проектов">
          <FontAwesomeIcon icon="house" />
        </button>
      </div>
    </div>
  );

};
  
export default Toolbox;