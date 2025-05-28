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
  faBezierCurve,
  faHandPaper,
  faGear,
  faArrowRotateLeft,
  faArrowRotateRight,
  faFloppyDisk,
  faFolderOpen,
  faFileUpload
} from '@fortawesome/free-solid-svg-icons';

library.add(faImage, 
  faFont, faHandPaper,
  faPencil, 
  faFilter, 
  faTrash, faGear, faArrowRotateLeft,  faArrowRotateRight,
  faDownload, 
  faPenToSquare, 
  faBold,
  faItalic, faFloppyDisk, faFolderOpen, faFileUpload,
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

