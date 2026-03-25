import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Prevent AdminDashboard from being tree-shaken
import AdminDashboard from './components/AdminDashboard';
(window as any).__AdminDashboard = AdminDashboard;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
