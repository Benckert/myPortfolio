// Dev-only Interaction Lab entry. Separate Vite multi-page entry from the app;
// pulls in the real design tokens so specimens render in the site's context.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/globals.css';
import Lab from './Lab';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Lab />
  </StrictMode>,
);
