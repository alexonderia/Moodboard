import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faImage, faFont, 
  faPencil, 
  faFilter, 
  faTrash, 
  faDownload,
  faPenToSquare,
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faSuperscript,
  faSubscript, faClone, faTrashAlt, faLayerGroup, faObjectUngroup,
  faArrowUp, faArrowDown, faArrowsAltH, faArrowsAltV,
  faSlash,
  faBezierCurve
} from '@fortawesome/free-solid-svg-icons';

library.add(faImage, 
  faFont, 
  faPencil, 
  faFilter, 
  faTrash, 
  faDownload, 
  faPenToSquare, 
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faSuperscript,
  faSubscript, faClone, faTrashAlt, faLayerGroup, faObjectUngroup,
  faArrowUp, faArrowDown, faArrowsAltH, faArrowsAltV, faSlash, faBezierCurve
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

