import { TextSettings } from '../func/textSelectionSettings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActiveSelection, Group, filters, Gradient} from 'fabric';
import { useState, useEffect } from 'react';
import ColorPicker, { useColorPicker } from 'react-best-gradient-color-picker';


const ObjectSettingsPanel = ({ selected, canvas }) => {
  const object = selected;
  const [blur, setBlur] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [gamma, setGamma] = useState({ r: 50, g: 50, b: 50 });
  const [color, setColor] = useState('#ffffff');
  
  const { setSolid, setGradient } = useColorPicker(color, setColor);

  useEffect(() => {
    if (!selected) return;

    const currentFill = selected.fill;

    if (typeof currentFill === 'string' && currentFill !== color) {
      setColor(currentFill);
    } else if (currentFill?.colorStops) {
      const gradientString = buildGradientString(currentFill);
      if (gradientString !== color) {
        setColor(gradientString);
      }
    }
  }, [selected]);


  useEffect(() => {
    if (!selected || !color) return;

    if (selected.type === 'group' || selected.type === 'activeSelection') return;

    const currentFill = selected.fill;

    if (typeof color === 'string' && 
      (color.startsWith('linear-gradient') || color.startsWith('radial-gradient'))) {
      
      // Не применять, если текущий градиент уже совпадает
      if (typeof currentFill !== 'object' || buildGradientString(currentFill) !== color) {
        applyGradientToSelected(selected, color);
      }

    } else {
      // Сплошной цвет
      if (currentFill !== color) {
        selected.set('fill', color);
      }
    }

    canvas.renderAll();
    canvas.fire('object:modified');
  }, [color]);

  useEffect(() => {

    if (!selected) return;
    // Для фильтров: если у объекта уже есть фильтры, можно инициализировать значения из них
    const objFilters  = selected.filters || [];
    // Можно попробовать извлечь значения, если есть
    const blurFilter = objFilters.find(f => f instanceof filters.Blur);
    setBlur(blurFilter ? blurFilter.blur * 100 : 0);

    const brightnessFilter = objFilters.find(f => f instanceof filters.Brightness);
    setBrightness(brightnessFilter ? brightnessFilter.brightness * 100 : 0);

    const saturationFilter = objFilters.find(f => f instanceof filters.Saturation);
    setSaturation(saturationFilter ? saturationFilter.saturation * 100 : 0);

    const gammaFilter = objFilters.find(f => f instanceof filters.Gamma);
    if (gammaFilter) {
      setGamma({
        r: gammaFilter.gamma[0] * 50,
        g: gammaFilter.gamma[1] * 50,
        b: gammaFilter.gamma[2] * 50,
      });
    } else {
      setGamma({ r: 50, g: 50, b: 50 });
    }
    }, [selected]);

  const applyGradientToSelected = (selected, gradientStr) => {
    if (!selected) return;
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
        coords: {x1: 0, y1: 0, x2: selected.width, y2: 0 },
        colorStops: stops,
      });
    } else if (type === 'radial') {
      const width = selected.width * selected.scaleX;
      const height = selected.height * selected.scaleY;

      gradient = new Gradient({
        type: 'radial',
        coords: {
          x1: width / 2, y1: height / 2,
          r1: 0,
          x2: width / 2, y2: height / 2,
          r2: Math.max(width, height) / 2
        },
        colorStops: stops,
      });
    } 

    selected.set('fill', gradient);
    canvas.renderAll();
  };

  function buildGradientString(gradient) {
    const stops = gradient.colorStops.map(stop => stop.color).join(', ');
    if (gradient.type === 'linear') {
      return `linear-gradient(90deg, ${stops})`;
    } else if (gradient.type === 'radial') {
      return `radial-gradient(circle, ${stops})`;
    }
    return '';
  }

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

  const handleFilterChange = (effect, value) => {
    if (!selected) return;
    const val = parseFloat(value);

    // Обновляем локальные состояния для фильтров
    switch (effect) {
      case 'blur': setBlur(val); break;
      case 'brightness': setBrightness(val); break;
      case 'saturation': setSaturation(val); break;
      case 'gamma.r': setGamma(prev => ({ ...prev, r: val })); break;
      case 'gamma.g': setGamma(prev => ({ ...prev, g: val })); break;
      case 'gamma.b': setGamma(prev => ({ ...prev, b: val })); break;
      default: break;
    }

    const currentEffect = getCurrentEffect(selected);
    selected.filters = getUpdatedFilter(currentEffect, effect, val);
    selected.applyFilters();
    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  if (!selected) return null;

  const alignObject = (pos) => {
    const canvasW = canvas.getWidth();
    const canvasH = canvas.getHeight();
    const w = object.getScaledWidth();
    const h = object.getScaledHeight();

    switch (pos) {
      case 'left': object.set({ left: 0 }); break;
      case 'center-h': object.set({ left: (canvasW - w) / 2 }); break;
      case 'right': object.set({ left: canvasW - w }); break;
      case 'top': object.set({ top: 0 }); break;
      case 'center-v': object.set({ top: (canvasH - h) / 2 }); break;
      case 'bottom': object.set({ top: canvasH - h }); break;
      default: return;
    }

    object.setCoords();
    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  const handleFlip = (axis) => {
    if (!object) return;
    const key = axis === 'X' ? 'flipX' : 'flipY';
    object.set(key, !object[key]);
    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  const bringForward = () => {
    const obj = canvas.getActiveObject();
    if (!obj) return;
    canvas.bringObjectForward(obj);
    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  const sendBackward = () => {
    const obj = canvas.getActiveObject();
    if (!obj) return;

    canvas.sendObjectBackwards(obj, true);
    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  const duplicate = () => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type === 'activeSelection' || activeObject.type === 'group') return;

    let _clipboard;

    activeObject.clone().then((cloned) => {
      _clipboard = cloned;

      _clipboard.clone().then((clonedObj) => {
        canvas.discardActiveObject();
        clonedObj.set({
          left: clonedObj.left + 10,
          top: clonedObj.top + 10,
          evented: true,
        });

        if (clonedObj instanceof ActiveSelection) {
          clonedObj.canvas = canvas;
          clonedObj.forEachObject((obj) => {
            canvas.add(obj);
          });
          clonedObj.setCoords();
        } else {
          canvas.add(clonedObj);
        }

        _clipboard.top += 10;
        _clipboard.left += 10;
        canvas.setActiveObject(clonedObj);
        canvas.requestRenderAll();
        canvas.fire('object:modified');
      });
    });
  };

  const deleteObject = () => {
    canvas.remove(...canvas.getActiveObjects());
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  const groupObjects = () => {
    const objs = canvas.getActiveObjects();
    if (objs.length < 2) return;
    const group = new Group(objs);
    canvas.discardActiveObject();
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  const ungroupObjects = () => {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== 'group') return;

    canvas.add(...activeObj.removeAll());
    canvas.remove(activeObj);

    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  const getCurrentEffect = (object) => object.filters || [];

  function getUpdatedFilter(currentFilters, effect, value) {
    const { Blur, Brightness, Saturation, Gamma } = filters;
    const updatedFilters = [...(currentFilters || [])];

    const effectClassMap = {
      blur: Blur,
      brightness: Brightness,
      saturation: Saturation,
      gamma: Gamma,
    };

    const effectType = effect.includes('gamma') ? 'gamma' : effect;
    const FilterClass = effectClassMap[effectType];
    if (!FilterClass) return updatedFilters;

    const existingIndex = updatedFilters.findIndex(f => f instanceof FilterClass);

    let filter;
    if (effectType === 'gamma') {
      const oldGamma = existingIndex >= 0 ? updatedFilters[existingIndex].gamma : [1, 1, 1];
      const channelMap = { r: 0, g: 1, b: 2 };
      const gammaArray = [...oldGamma];
      const channel = effect.split('.')[1];
      gammaArray[channelMap[channel]] = value / 50;

      filter = new Gamma({ gamma: gammaArray });
    } else {
      const paramsMap = {
        blur: { blur: value / 100 },
        brightness: { brightness: value / 100 },
        saturation: { saturation: value / 100 },
      };
      filter = new FilterClass(paramsMap[effectType]);
    }

    if (existingIndex >= 0) {
      updatedFilters[existingIndex] = filter;
    } else {
      updatedFilters.push(filter);
    }

    return updatedFilters;
  }

  return (
    <div className="panel">
      <TextSettings object={selected} canvas={canvas} />
     
      <h3>Настройки объекта</h3>
      {['rect', 'circle', 'path', 'line'].includes(selected.type) && (
        <>
          <label>Толщина линии</label>
          <input
            type="number"
            min="0"
            max="20"
            value={selected.strokeWidth || 1}
            onChange={(e) => {
              selected.set('strokeWidth', parseInt(e.target.value));
              canvas.requestRenderAll();
              canvas.fire('object:changed');
            }}
          />

          <label>Цвет обводки</label>
          <input
            type="color"
            value={selected.stroke || '#000000'}
            onChange={(e) => {
              selected.set('stroke', e.target.value);
              canvas.requestRenderAll();
              canvas.fire('object:changed');
            }}
          />

          {['rect', 'circle', 'path', 'line'].includes(selected.type) && selected.type !== 'group' && (
            <>
              <label>Цвет заливки</label>
              <div style={{ marginBottom: '1em' }}>
                <button onClick={() => setSolid('#ffffff')}>Сплошной</button>
                <button
                  onClick={() =>
                    setGradient('linear-gradient(90deg, rgba(96,93,93,1) 0%, rgba(255,255,255,1) 100%)')
                  }
                >Градиент</button>
              </div>
              <ColorPicker value={color} onChange={setColor} hideColorTypeBtns={true} />
            </>
          )}

        </>
      )}

      <label>Поворот (градусы)</label>
      <input
        type="number"
        value={selected.angle ?? 0}
        onChange={(e) => {
          selected.rotate(parseFloat(e.target.value));
          canvas.requestRenderAll();
          canvas.fire('object:changed');
        }}
      />

      <label>Выравнивание объекта</label>
      <div className="alignment-buttons">
        <button onClick={() => alignObject('left')}>⭰</button>
        <button onClick={() => alignObject('center-h')}>⇔</button>
        <button onClick={() => alignObject('right')}>⭲</button>
        <button onClick={() => alignObject('top')}>⭱</button>
        <button onClick={() => alignObject('center-v')}>⇕</button>
        <button onClick={() => alignObject('bottom')}>⭳</button>
      </div>

      <label>Действия</label>
      <div className="object-options">
        <button onClick={() => handleFlip('X')} title="Отразить по Х">
          <FontAwesomeIcon icon={"left-right"} />
        </button>
        <button onClick={() => handleFlip('Y')} title="Отразить по Y">
          <FontAwesomeIcon icon={"up-down"} />
        </button>
        <button onClick={bringForward} title="На передний план">
          <FontAwesomeIcon icon={"arrow-up"} />
        </button>
        <button onClick={sendBackward} title="На задний план">
          <FontAwesomeIcon icon={'arrow-down'} />
        </button>
        <button onClick={duplicate} title="Дублировать">
          <FontAwesomeIcon icon={"clone"} />
        </button>
        <button onClick={deleteObject} title="Удалить">
          <FontAwesomeIcon icon={"trash-can"} />
        </button>
        <button onClick={groupObjects} title="Группировать">
          <FontAwesomeIcon icon={"layer-group"} />
        </button>
        <button onClick={ungroupObjects} title="Разгруппировать">
          <FontAwesomeIcon icon={"object-ungroup"} />
        </button>
      </div>

      <label>Непрозрачность</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={selected.opacity ?? 1}
        onChange={(e) => {
          selected.set('opacity', parseFloat(e.target.value));
          canvas.requestRenderAll();
          canvas.fire('object:changed');
        }}
      />
     
      {selected.type === 'image' && (
        <>          
          <label>Размытие</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={blur}
              onChange={(e) => handleFilterChange('blur', e.target.value)}
            />
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={blur}
              onChange={(e) => handleFilterChange('blur', e.target.value)}
              style={{ width: 50, marginLeft: 8 }}
            />
          </div>

          <label>Яркость</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={brightness}
              onChange={(e) => handleFilterChange('brightness', e.target.value)}
            />
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={brightness}
              onChange={(e) => handleFilterChange('brightness', e.target.value)}
              style={{ width: 50, marginLeft: 8 }}
            />
          </div>

          <label>Насыщенность</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={saturation}
              onChange={(e) => handleFilterChange('saturation', e.target.value)}
            />
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={saturation}
              onChange={(e) => handleFilterChange('saturation', e.target.value)}
              style={{ width: 50, marginLeft: 8 }}
            />
          </div>
                
          <h5>Gamma</h5>
          {['r', 'g', 'b'].map(channel => (
            <div key={channel} style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ width: 20 }}>{channel.toUpperCase()}</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={gamma[channel]}
                onChange={(e) => handleFilterChange(`gamma.${channel}`, e.target.value)}
              />
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={gamma[channel]}
                onChange={(e) => handleFilterChange(`gamma.${channel}`, e.target.value)}
                style={{ width: 50, marginLeft: 8 }}
              />
            </div>
          ))}
        </>        
      )}
    </div>    
  );
};

export default ObjectSettingsPanel;
