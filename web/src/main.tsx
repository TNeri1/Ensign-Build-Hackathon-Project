// Theme + app CSS first so component CSS (imported by the components below) comes later in the cascade.
import './theme/index.css';
import './styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { applyTheme, readSavedTheme } from './components/ThemeToggle';

// index.html already applies the saved theme inline (no flash); this keeps it correct if that script is removed.
applyTheme(readSavedTheme());

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
