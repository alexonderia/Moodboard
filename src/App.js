// import React, { useEffect, useRef, useState } from 'react';
// import { Canvas, Image } from 'fabric'; // Импортируем Canvas
// import { Line } from 'fabric'; // Импортируем Line
// import { Text } from 'fabric'; // Импортируем Text
// import './App.css'; // Подключаем стили

// function App() {
//   const canvasRef = useRef(null);
//   const [canvas, setCanvas] = useState(null);
//   const [isDrawing, setIsDrawing] = useState(false); // Флаг для рисования линии
//   const [lineStart, setLineStart] = useState(null); // Стартовые координаты для линии
//   const [lineColor, setLineColor] = useState('#000000'); // Цвет линии по умолчанию

//   useEffect(() => {
//     // Инициализация холста
//     const fabricCanvas = new Canvas(canvasRef.current);

//     // Установка размеров холста
//     fabricCanvas.setWidth(window.innerWidth);
//     fabricCanvas.setHeight(window.innerHeight);

//     setCanvas(fabricCanvas);

//     // Функция очистки
//     return () => {
//       fabricCanvas.dispose(); // Очищаем холст при выходе
//     };
//   }, []);

//   // Функция для добавления текста на холст
//   const addText = () => {
//     const text = new Text('Hello, Moodboard!', { left: 50, top: 50 });
//     canvas.add(text);
//   };

//   // Функция для добавления линии на холст
//   const addLine = () => {
//     const line = new Line([100, 100, 400, 400], {
//       left: 100,
//       top: 100,
//       stroke: lineColor,
//     });
//     canvas.add(line);
//   };

//   // Функция для добавления изображения
//   const addImage = () => {
//     Image.fromURL('https://example.com/image.jpg', (img) => {
//       img.set({
//         left: 400,
//         top: 100,
//       });
//       canvas.add(img);
//     });
//   };

//   return (
//     <div className="App">
//       {/* Панель инструментов */}
//       <div className="controls">
//         <button onClick={addText}>Добавить текст</button>
//         <button onClick={addLine}>Добавить линию</button>
//         <button onClick={addImage}>Добавить изображение</button>

//         {/* Выбор цвета линии */}
//         <label>Выберите цвет линии:</label>
//         <input
//           type="color"
//           value={lineColor}
//           onChange={(e) => setLineColor(e.target.value)}
//         />
//       </div>

//       {/* Холст */}
//       <canvas ref={canvasRef}></canvas>
//     </div>
//   );
// }

// export default App;

import Toolbox from './Toolbox';
import EditorCanvas from './EditorCanvas';
import './App.css';
import { useRef, useEffect, useState } from 'react';
import { Canvas, PencilBrush } from 'fabric';

function App() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [currentFilter, setCurrentFilter] = useState(null);

  useEffect(() => {
    const canvas = new Canvas(canvasRef.current, { backgroundColor: 'white' });
    canvas.setDimensions({ width: 1000, height: 500 });
    setCanvas(canvas);

    const brush = new PencilBrush(canvas);
    brush.color = 'black';
    brush.width = 5;
    canvas.freeDrawingBrush = brush;

    return () => canvas.dispose();

  }, [canvasRef, setCanvas]);

  return (
    <div className="editor">
      <Toolbox 
        canvas={canvas} 
        currentFilter={currentFilter} 
        setCurrentFilter={setCurrentFilter}
      />
      <EditorCanvas 
        ref={canvasRef} 
        canvas={canvas} 
        setCurrentFilter={setCurrentFilter}
      />
    </div>
  );
}

export default App;