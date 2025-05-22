import { useState } from 'react';
import { applyCanvasSize, applyBackgroundColor } from '../func/canvasSettings';

const CanvasSettingsPanel = ({ canvas }) => {
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(500);
  const [bgColor, setBgColor] = useState('#ffffff');

  const handleSizeChange = () => {
    applyCanvasSize(canvas, width, height);
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    setBgColor(color);
    applyBackgroundColor(canvas, color);
  };

  return (
    <div className="panel">
      <h3>Настройки холста</h3>
      <label>Ширина</label>
      <input type="number" value={width} onChange={(e) => setWidth(+e.target.value)} />
      <label>Высота</label>
      <input type="number" value={height} onChange={(e) => setHeight(+e.target.value)} />
      <button onClick={handleSizeChange}>Сохранить</button>

      <label>Цвет</label>
      <input type="color" value={bgColor} onChange={handleColorChange} />

      {/* TODO: добавить UI для градиентов через Grapick */}
    </div>
  );
};

export default CanvasSettingsPanel;
