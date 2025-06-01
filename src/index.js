import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faFloppyDisk, faHouse,faHandPaper,faPencil,
  faSlash, faBezierCurve, faFont, faPenToSquare, faImage,
  faFilter, faTrash, faGear, faArrowRotateLeft, faArrowRotateRight,
  faCloudArrowDown, faCloudArrowUp, faDownload, faUpload,
  faBold, faItalic, faUnderline, faStrikethrough, faSuperscript, faSubscript, 
  faLeftRight, faUpDown, faArrowUp, faArrowDown, faClone,
  faTrashCan, faLayerGroup, faObjectUngroup,
  faUser, faRightToBracket
} from '@fortawesome/free-solid-svg-icons';

library.add(faFloppyDisk, faHouse,faHandPaper,faPencil,
  faSlash, faBezierCurve, faFont, faPenToSquare, faImage,
  faFilter, faTrash, faGear, faArrowRotateLeft, faArrowRotateRight,
  faCloudArrowDown, faCloudArrowUp, faDownload, faUpload,
  faBold, faItalic, faUnderline, faStrikethrough, faSuperscript, faSubscript, 
  faLeftRight, faUpDown, faArrowUp, faArrowDown, faClone,
  faTrashCan, faLayerGroup, faObjectUngroup,
  faUser, faRightToBracket
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

