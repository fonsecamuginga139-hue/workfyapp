import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Block pinch / double-tap zoom on iOS Safari (ignores user-scalable=no)
['gesturestart', 'gesturechange', 'gestureend'].forEach((evt) =>
  document.addEventListener(evt, (e) => e.preventDefault(), { passive: false } as AddEventListenerOptions)
);
document.addEventListener(
  'touchmove',
  (e) => {
    if ((e as TouchEvent).touches.length > 1) e.preventDefault();
  },
  { passive: false }
);
let lastTouchEnd = 0;
document.addEventListener(
  'touchend',
  (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  },
  { passive: false }
);
