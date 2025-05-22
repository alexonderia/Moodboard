import { TextSettings } from '../func/selectionSettings';

const ObjectSettingsPanel = ({ selected, canvas }) => {


  if (!selected) return null;

  return (
    <div className="panel">
      <TextSettings object={selected} canvas={canvas} />
     
      {['rect', 'circle', 'path', 'line'].includes(selected.type) && (
        <>
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
        </>
      )}

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

    </div>
  );
};

export default ObjectSettingsPanel;
