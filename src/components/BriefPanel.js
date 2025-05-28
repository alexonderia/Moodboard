import React, { useState, useRef, useEffect } from 'react';
import './BriefPanel.css';

let nextId = 4;

export default function BriefPanel({ questions, setQuestions }) {
  const [collapsed, setCollapsed] = useState(false);
  const panelRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const panel = panelRef.current;
    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    const onMouseDown = (e) => {
      if (e.target.closest('.brief-panel')) {
        isDragging = true;
        offsetX = e.clientX - panel.offsetLeft;
        offsetY = e.clientY - panel.offsetTop;
      }
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    panel.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      panel.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, { id: nextId++, question: '', answer: '' }]);
  };

  const updateField = (id, field, value) => {
    setQuestions(q =>
      q.map(q => q.id === id ? { ...q, [field]: value } : q)
    );
  };

  const removeQuestion = (id) => {
    setQuestions(q => q.filter(q => q.id !== id));
  };

  function autoResize(e) {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  return (
    <div
      ref={panelRef}
      className={`brief-panel ${collapsed ? 'collapsed' : ''}`}
      style={{ top: '100px', left: '50px' }}
    >
      <div className="brief-header">
        <h3>📝</h3>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '⮞' : '⮜'}
        </button>
      </div>

      {!collapsed && (
        <div className="brief-body">
          <h3>Семантический мудборд</h3>
          <div className="questions-list">
            {questions.map(({ id, question, answer }) => (
              <div key={id} className="question-block">
                <textarea
                  value={question}
                  onChange={e => updateField(id, 'question', e.target.value)}
                  onInput={autoResize}
                  placeholder="Вопрос..."
                />
                <textarea
                  value={answer}
                  onChange={e => updateField(id, 'answer', e.target.value)}
                  onInput={autoResize}
                  placeholder="Ответ..."
                />
                <button onClick={() => removeQuestion(id)}>Удалить</button>
              </div>
            ))}
          </div>
          <button className="add-btn" onClick={addQuestion}>➕ Добавить вопрос</button>
        </div>
      )}
    </div>
  );
}
