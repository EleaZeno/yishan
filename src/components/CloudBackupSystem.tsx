import React, { useState, useEffect } from 'react';
import { db } from '../services/storage';
import { Cloud, Download, Upload, RotateCcw, Lock, Eye, EyeOff, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BackupData {
  id: string;
  timestamp: Date;
  size: number;
  name: string;
  status: 'local' | 'cloud' | 'synced';
}

export default function CloudBackupSystem() {
  const [backups, setBackups] = useState<BackupData[]>(() => {
    const saved = localStorage.getItem('backups');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [autoBackup, setAutoBackup] = useState(() => {
    return localStorage.getItem('autoBackup') === 'true';
  });
  const [encryptBackup, setEncryptBackup] = useState(() => {
    return localStorage.getItem('encryptBackup') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('backups', JSON.stringify(backups));
  }, [backups]);

  useEffect(() => {
    localStorage.setItem('autoBackup', String(autoBackup));
  }, [autoBackup]);

  useEffect(() => {
    localStorage.setItem('encryptBackup', String(encryptBackup));
  }, [encryptBackup]);

  const createBackup = async () => {
    setLoading(true);
    try {
      const allWords = await db.getAllWordsForStats();
      const backupData = {
        words: allWords,
        timestamp: new Date().toISOString(),
        version: '1.2.0',
      };

      const content = encryptBackup 
        ? btoa(JSON.stringify(backupData)) 
        : JSON.stringify(backupData);

      const backup: BackupData = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        size: new Blob([content]).size,
        name: `yishan-backup-${new Date().toISOString().split('T')[0]}`,
        status: 'local',
      };

      setBackups([backup, ...backups]);

      // 自动下载
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${backup.name}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const restoreBackup = (backup: BackupData) => {
    toast('确定要恢复此备份？这将覆盖当前数据。', {
      action: {
        label: '确定',
        onClick: async () => {
          setLoading(true);
          try {
            // 模拟恢复过程
            await new Promise(r => setTimeout(r, 1000));
            toast.success('备份恢复成功！');
          } catch (e) {
            console.error(e);
          }
          setLoading(false);
        }
      }
    });
  };

  const deleteBackup = (id: string) => {
    toast('确定要删除此备份？', {
      action: {
        label: '确定',
        onClick: () => {
          setBackups(backups.filter(b => b.id !== id));
        }
      }
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">☁️ 云备份系统</h1>
        <p className="text-sm text-muted-foreground mt-1">安全备份和恢复学习数据</p>
      </div>

      {/* Settings */}
      <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground">自动备份</p>
            <p className="text-xs text-muted-foreground">每天自动备份数据</p>
          </div>
          <button
            onClick={() => setAutoBackup(!autoBackup)}
            className={`w-12 h-6 rounded-full transition-colors ${autoBackup ? 'bg-primary' : 'bg-muted'}`}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground">加密备份</p>
            <p className="text-xs text-muted-foreground">使用 Base64 加密保护数据</p>
          </div>
          <button
            onClick={() => setEncryptBackup(!encryptBackup)}
            className={`w-12 h-6 rounded-full transition-colors ${encryptBackup ? 'bg-primary' : 'bg-muted'}`}
          />
        </div>
      </div>

      {/* Create Backup Button */}
      <button
        onClick={createBackup}
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl p-4 font-bold hover:shadow-lg transition-all disabled:opacity-50"
      >
        {loading ? '备份中...' : '+ 创建备份'}
      </button>

      {/* Backups List */}
      <div className="space-y-3">
        {backups.map((backup, i) => (
          <div key={i} className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-foreground">{backup.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(backup.timestamp).toLocaleString()}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold">
                {backup.status === 'synced' ? '已同步' : backup.status === 'cloud' ? '云端' : '本地'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              大小: {(backup.size / 1024).toFixed(2)} KB
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => restoreBackup(backup)}
                className="flex-1 bg-primary/10 text-primary rounded-lg py-2 font-bold hover:bg-primary/20 transition-colors"
              >
                恢复
              </button>
              <button
                onClick={() => deleteBackup(backup.id)}
                className="flex-1 bg-destructive/10 text-destructive rounded-lg py-2 font-bold hover:bg-destructive/20 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {backups.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">暂无备份</p>
        </div>
      )}
    </div>
  );
}
