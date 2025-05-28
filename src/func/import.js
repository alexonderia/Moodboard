import { FabricImage } from 'fabric';

export function loadImage(canvas) {
  return function(e) {
    if (!canvas) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {   
      if (!canvas) return;   

      const image = await FabricImage.fromURL(e.target.result);
      image.scale(0.5);
      canvas.add(image);
      canvas.centerObject(image);
      canvas.setActiveObject(image); 
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };  
}

export function loadCanvasFromJSON(canvas) {
  return function (e) {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        canvas.loadFromJSON(json, () => {
          canvas.renderAll();
          console.log("Холст восстановлен из JSON.");
        });
      } catch (err) {
        console.error("Ошибка при загрузке JSON:", err);
      }
    };

    reader.readAsText(file);
    e.target.value = ''; // сброс input
  };
}
