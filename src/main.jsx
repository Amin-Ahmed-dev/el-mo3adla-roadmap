import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { SUBJECTS } from './data/catalog.js';
import { validateSubjects } from './data/validate.js';

// While developing, print content mistakes in the browser console.
if (import.meta.env && import.meta.env.DEV) {
  const { errors, warnings } = validateSubjects(SUBJECTS);
  errors.forEach((e) => console.error('[content]', e));
  warnings.forEach((w) => console.warn('[content]', w));
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
