import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { addText } from '../func/drawingTextTools';
import { applyFilter} from '../func/filters';
import { clearAll } from '../func/clearAll';
import { loadImage } from '../func/manageImage';
import { downloadImage } from '../func/export';
import { toggleDrawingMode, toggleLineDrawingMode, togglePathDrawingMode  } from '../func/drawingTools';
import { initTextTool } from '../func/drawingTextTools';

const Toolbox = ({ canvas, currentFilter, setCurrentFilter, setShowLeftPanel, showLeftPanel, setShowRightPanel, showRightPanel }) => {
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingTextMode, setDrawingTextMode] = useState(false);
  const [drawingLineMode, setDrawingLineMode] = useState(false);
  const [drawingPathMode, setDrawingPathMode] = useState(false);
  const [cleanupHandler, setCleanupHandler] = useState(null);

  useEffect(() => {
    if (canvas && currentFilter) {
      applyFilter(canvas, currentFilter);
    }
    return () => {
      if (cleanupHandler) cleanupHandler();
    };
  }, [canvas, currentFilter, cleanupHandler]);
  
  return (
    <div className="toolbox">
      
      <button title="Добавить текст" onClick={() => addText(canvas)}>
        <FontAwesomeIcon icon="font" />
      </button>

      <button title="Добавить текст в рамке" onClick={() => initTextTool(canvas, setDrawingTextMode)} className={drawingTextMode ? 'active' : ''}>
        <FontAwesomeIcon icon="pen-to-square" />
      </button>

      <button title="Режим свободного рисования" onClick={() => toggleDrawingMode(canvas, setDrawingMode)} className={drawingMode ? 'active' : ''}>
        <FontAwesomeIcon icon="pencil" />
      </button>

      <button
        title="Режим рисования прямых"
        onClick={() => toggleLineDrawingMode(canvas, setDrawingLineMode, setCleanupHandler)}
        className={drawingLineMode ? 'active' : ''}
      >
        <FontAwesomeIcon icon="slash" />
      </button>

      <button
        title="Режим рисования кривых"
        onClick={() => togglePathDrawingMode(canvas, setDrawingPathMode, setCleanupHandler)}
        className={drawingPathMode ? 'active' : ''}
      >
        <FontAwesomeIcon icon="bezier-curve" />
      </button>

      <button title="Загрузить изображение">
        <FontAwesomeIcon icon="image" />
        <input
          type="file"
          accept=".png, .jpg, .jpeg"
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

      <button title="Скачать в png" onClick={() => downloadImage(canvas)}>
        <FontAwesomeIcon icon="download" />
      </button>

      <button title="Настройки холста" onClick={() => setShowLeftPanel(!showLeftPanel)}>
        {showLeftPanel ? '←' : '→'}
      </button>

      <button title="Настройки объекта" onClick={() => setShowRightPanel(!showRightPanel)}>
        {showRightPanel ? '→' : '←'}
      </button>


    </div>
  );
};
  
export default Toolbox;