import React, { useState, useEffect } from 'react';
import { RefreshCw, X, Rocket } from 'lucide-react';
import { Button } from './ui/button';

export default function UpdateNotification() {
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          setShowUpdateToast(true);
        });
      });
      
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdateToast(false);
    localStorage.setItem('update-dismissed', Date.now().toString());
  };

  if (!showUpdateToast) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">新版本可用</h3>
            <p className="text-sm text-muted-foreground mt-1">
              忆闪已更新到最新版本，带来更好的学习体验！
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleUpdate}>
                <RefreshCw size={14} className="mr-1" />
                刷新更新
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                <X size={14} className="mr-1" />
                稍后
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}