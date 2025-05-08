import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faImage, 
  faFont, 
  faPencil, 
  faFilter, 
  faTrash, 
  faDownload 
} from '@fortawesome/free-solid-svg-icons';

library.add(faImage, faFont, faPencil, faFilter, faTrash, faDownload);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

