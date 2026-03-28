import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';

const updateSW = registerSW({
  onNeedRefresh() {
    toast('新版本已发布，是否重新加载？', {
      action: {
        label: '确定',
        onClick: () => updateSW(true)
      }
    });
  },
  onOfflineReady() {
    console.log('应用已准备好离线使用');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
