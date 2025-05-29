import './EditorPage.css';
import React, { useRef, useEffect, useState } from 'react';
import { initCanvas } from '../../func/initCanvas';
import Toolbox from '../../components/Toolbox';
import EditorCanvas from '../../components/EditorCanvas';
import CanvasSettingsPanel from '../../components/CanvasSettingsPanel';
import ObjectSettingsPanel from '../../components/ObjectSettingsPanel';
import BriefPanel from '../../components/BriefPanel';
import { useUndoRedo } from '../../func/useUndoRedo';

function EditorPage({ user }) {
  const canvasRef = useRef(null);
  const canvasBoxRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [currentFilter, setCurrentFilter] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [version, setVersion] = useState(0);
  const [questions, setQuestions] = useState([
    { id: 1, question: 'Какая цель проекта?', answer: '' },
    { id: 2, question: 'Какая целевая аудитория?', answer: '' },
    { id: 3, question: 'Какой стиль/настроение вы хотите передать?', answer: '' },
  ]);
  const { undo, redo } = useUndoRedo(canvas);
  const [projectTitle, setProjectTitle] = useState('Без названия');


  useEffect(() => {
    const canvas = initCanvas(canvasRef.current);
    setCanvas(canvas);

    setSelectedObject(null);
    setShowRightPanel(false);

    function handleSelection(e) {
      const obj = canvas.getActiveObject();
      setSelectedObject(obj || null);
      const filter = obj?.filters?.at(0);
      setCurrentFilter(filter ? filter.type.toLowerCase() : null);
      setShowRightPanel(!!obj);
    }

    const updateSelected = () => {
      const obj = canvas.getActiveObject();
      setSelectedObject(obj || null);
      setVersion((v) => v + 1); // форсируем перерендер
    };

    canvas.on({
      'selection:created': handleSelection,
      'selection:updated': handleSelection,
      'selection:cleared': () => {
        setSelectedObject(null);
        setShowRightPanel(false);
      },
      'object:modified': updateSelected,
      'object:scaling': updateSelected,
      'object:moving': updateSelected,
      'object:rotating': updateSelected,
      'object:changed': updateSelected
    });

    const handleResize = () => {
      const isSmall = window.innerWidth <= 768;
      if (isSmall) {
        setShowLeftPanel(false);
        setShowRightPanel(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      canvas.off({
        'selection:created': handleSelection,
        'selection:updated': handleSelection,
        'object:modified': updateSelected,
        'object:scaling': updateSelected,
        'object:moving': updateSelected,
        'object:rotating': updateSelected,
        'object:changed': updateSelected
      });
    };
  }, [canvasRef, setCanvas]);

  return (
    <div className="editor">
      <BriefPanel questions={questions ?? []} setQuestions={setQuestions} />
      <div className="toolbar">
        <Toolbox
            canvas={canvas}
            canvasBoxRef={canvasBoxRef}
            currentFilter={currentFilter}
            setCurrentFilter={setCurrentFilter}
            setShowLeftPanel={setShowLeftPanel}
            showLeftPanel={showLeftPanel}
            setShowRightPanel={setShowRightPanel}
            showRightPanel={showRightPanel}
            undo={undo}
            redo={redo}
            brief={questions}
            setBrief={setQuestions}
            projectTitle={projectTitle}
            setProjectTitle={setProjectTitle}
        />
      </div>
      <div className="workspace">
        <div className={`sidebar left ${showLeftPanel ? 'active' : 'hidden'}`}>
          {showLeftPanel && <CanvasSettingsPanel canvas={canvas} zoom={zoom} setZoom={setZoom} />}
        </div>
        <div className="canvasbox" ref={canvasBoxRef}>
          <EditorCanvas
            ref={canvasRef}
            canvas={canvas}
            setCurrentFilter={setCurrentFilter}
            zoom={zoom}
            setZoom={setZoom}
          />
        </div>
        <div className={`sidebar right ${showRightPanel ? 'active' : 'hidden'}`}>
          {showRightPanel && <ObjectSettingsPanel selected={selectedObject} canvas={canvas} />}
        </div>
      </div>
    </div>
  );
}

export default EditorPage;