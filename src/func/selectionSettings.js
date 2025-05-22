import FontSelect from '../components/FontSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const TextSettings = ({ object, canvas }) => {

  if (!object) return null;
  
  const toggleStyle = (prop, value) => {
    object.set(prop, object.get(prop) === value ? '' : value);
    canvas.requestRenderAll();
    canvas.fire('object:changed');
  };

  function toggleSuperscript(object, canvas) {
    if (!object || typeof object.getSelectionStyles !== 'function') return;

    const style = object.getSelectionStyles()[0] || {};
    const isSuperscript = style.deltaY < 0;

    if (isSuperscript) {
      object.setSelectionStyles({
        fontSize: object.fontSize,
        deltaY: 0
      });
    } else {
      object.setSelectionStyles({
        fontSize: object.fontSize * 0.65,
        deltaY: -0.4 * object.fontSize
      });
    }

    canvas.requestRenderAll();
    canvas.fire('object:changed');
  }

  function toggleSubscript(object, canvas) {
    if (!object || typeof object.getSelectionStyles !== 'function') return;

    const style = object.getSelectionStyles()[0] || {};
    const isSubscript = style.deltaY > 0;

    if (isSubscript) {
      object.setSelectionStyles({
        fontSize: object.fontSize,
        deltaY: 0
      });
    } else {
      object.setSelectionStyles({
        fontSize: object.fontSize * 0.65,
        deltaY: 0.25 * object.fontSize
      });
    }

    canvas.requestRenderAll();
    canvas.fire('object:changed');
  }

  return (
    <>
      <h3>Текст</h3>
      <button onClick={() => toggleStyle('fontWeight', 'bold')}>
        <FontAwesomeIcon icon="bold" />
      </button>
      <button onClick={() => toggleStyle('fontStyle', 'italic')}>
        <FontAwesomeIcon icon="italic" />
      </button>
      <button onClick={() => toggleStyle('underline', true)}>
        <FontAwesomeIcon icon="underline" />
      </button>
      <button onClick={() => toggleStyle('linethrough', true)}>
        <FontAwesomeIcon icon="strikethrough" />
      </button>
      <button onClick={() => toggleSuperscript(object, canvas)}>
        <FontAwesomeIcon icon="superscript" />
      </button>
      <button onClick={() => toggleSubscript(object, canvas)}>
        <FontAwesomeIcon icon="subscript" />
      </button>

      <label>Шрифт</label>
      <FontSelect object={object} canvas={canvas} />

      <label>Размер шрифта</label>
      <input
        type="number"
        min="8"
        max="200"
        value={object.fontSize || 18}
        onChange={(e) => {
          object.set('fontSize', parseInt(e.target.value));
          canvas.requestRenderAll();
          canvas.fire('object:changed');
        }}
      />

      <label>Цвет текста</label>
      <input
        type="color"
        value={object.fill || '#000000'}
        onChange={(e) => {
          object.set('fill', e.target.value);
          canvas.requestRenderAll();
          canvas.fire('object:changed');
        }}
      />
    </>
  );
};

export default TextSettings;
