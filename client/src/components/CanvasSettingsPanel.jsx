import React, { useState, useEffect, useRef } from 'react';
import { applyCanvasSize, applyBackgroundColor } from '../func/canvasSettings';
import { Gradient } from 'fabric';
import ColorPicker, { useColorPicker } from 'react-best-gradient-color-picker';

const CanvasSettingsPanel = ({ canvas, zoom, setZoom }) => {
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(500);
  const [color, setColor] = useState('#ffffff');
  const initialized = useRef(false);

  const { setSolid, setGradient } = useColorPicker(color, setColor);

  const gradientToCss = (gradient) => {
    if (!gradient || !gradient.colorStops) return '#ffffff';

    const stops = gradient.colorStops.map(
      (stop) => `${stop.color} ${Math.round(stop.offset * 100)}%`
    );

    if (gradient.type === 'linear') {
      return `linear-gradient(90deg, ${stops.join(', ')})`;
    } else if (gradient.type === 'radial') {
      return `radial-gradient(circle, ${stops.join(', ')})`;
    }

    return '#ffffff';
  };

  useEffect(() => {
    if (!canvas || initialized.current) return;

    const bg = canvas.backgroundColor;

    if (typeof bg === 'string') {
      setColor(bg);
    } else if (bg && typeof bg.toLive === 'function') {
      const cssGradient = gradientToCss(bg);
      setColor(cssGradient);
    }

    initialized.current = true;
  }, [canvas]);

  const handleSizeChange = () => {
    applyCanvasSize(canvas, width, height);
  };

  const parseGradient = (gradientStr) => {
    const colorStops = gradientStr.match(/#(?:[0-9a-f]{3}){1,2}|rgba?\([^)]+\)/gi);
    if (!colorStops || colorStops.length < 2) return null;

    return colorStops.map((color, i) => ({
      offset: i / (colorStops.length - 1),
      color,
    }));
  };

  const getGradientType = (gradientStr) => {
    if (gradientStr.startsWith('linear-gradient')) return 'linear';
    if (gradientStr.startsWith('radial-gradient')) return 'radial';
    return null;
  };

  const applyGradientToCanvas = (canvas, gradientStr) => {
    if (!canvas) return;

    const w = canvas.getWidth();
    const h = canvas.getHeight();

    const stops = parseGradient(gradientStr);
    if (!stops) {
      console.warn('Не удалось распарсить цвета из градиента');
      return;
    }

    const type = getGradientType(gradientStr);

    let gradient;

    if (type === 'linear') {
      gradient = new Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: w, y2: 0 },
        colorStops: stops,
      });
    } else if (type === 'radial') {
      gradient = new Gradient({
        type: 'radial',
        coords: {
          r1: 0,
          r2: Math.max(w, h) / 2,
          x1: w / 2,
          y1: h / 2,
          x2: w / 2,
          y2: h / 2,
        },
        colorStops: stops,
      });
    } else {
      return;
    }

    canvas.set('backgroundColor', gradient);
    canvas.renderAll();
  };

  const updateCanvasBackground = (value) => {
    if (!canvas) return;

    if (
      typeof value === 'string' &&
      (value.startsWith('linear-gradient') || value.startsWith('radial-gradient'))
    ) {
      applyGradientToCanvas(canvas, value);
    } else {
      applyBackgroundColor(canvas, value);
    }
  };

  useEffect(() => {
    updateCanvasBackground(color);
  }, [color, canvas]);

  const zoomStep = 0.1;

  const increaseZoom = () => {
    if (zoom < 2) {
      setZoom(Math.min(2, zoom + zoomStep));
    }
  };

  const decreaseZoom = () => {
    if (zoom > 0.1) {
      setZoom(Math.max(0.1, zoom - zoomStep));
    }
  };

  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <div
      className="panel"
    >
      <h3>Настройки холста</h3>
      <label>Ширина</label>
      <input type="number" value={width} onChange={(e) => setWidth(+e.target.value)} />
      <label>Высота</label>
      <input type="number" value={height} onChange={(e) => setHeight(+e.target.value)} />
      <button onClick={handleSizeChange}>Сохранить</button>

      <hr />

      <label>Управление зумом</label>
      <button onClick={decreaseZoom}>-</button>
      <span style={{ margin: '0 1em' }}>{(zoom * 100).toFixed(0)}%</span>
      <button onClick={increaseZoom}>+</button>
      <button onClick={resetZoom} style={{ marginLeft: '1em' }}>
        Сбросить
      </button>

      <hr />

      <label>Цвет фона</label>
      <div style = {{marginBottom: 1 + 'em'}}>
        <button onClick={() => setSolid('#ffffff')}>Сплошной</button>

        <button
          onClick={() =>
            setGradient('linear-gradient(90deg, rgba(96,93,93,1) 0%, rgba(255,255,255,1) 100%)')
          }
        >Градиент</button>  
      </div>

      <ColorPicker value={color} onChange={setColor} hideColorTypeBtns={true} />

    </div>
  );
};

export default CanvasSettingsPanel;
