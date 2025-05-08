import { filters } from 'fabric';

export function getSelectedFilter(type) {
  switch(type) {
    case 'sepia':
      return new filters.Sepia();
    case 'vintage':
      return new filters.Vintage();
    case 'invert':
      return new filters.Invert();
    case 'polaroid':
      return new filters.Polaroid();
    case 'grayscale':
      return new filters.Grayscale();
    default:
      return null;
  }
}

export function applyFilter(canvas, currentFilter) {
  if (!canvas) return;
  const active = canvas.getActiveObject();
  if (!active || active.type !== 'image') return;

  const filter = getSelectedFilter(currentFilter);
  
  active.filters = filter ? [filter] : [];
  active.applyFilters();
  canvas.renderAll();
}