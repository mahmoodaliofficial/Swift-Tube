'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DownloadHistoryItem } from '@/lib/types';

const STORAGE_KEY = 'swifttube_history';
const MAX_HISTORY = 50;

function loadHistory(): DownloadHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: DownloadHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage may be unavailable in some envs
  }
}

export function useHistory() {
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const addToHistory = useCallback((item: Omit<DownloadHistoryItem, 'downloadedAt'>) => {
    setHistory((prev) => {
      const newItem: DownloadHistoryItem = {
        ...item,
        downloadedAt: new Date().toISOString(),
      };
      // Remove duplicate by id+format
      const filtered = prev.filter(
        (h) => !(h.videoId === item.videoId && h.format === item.format)
      );
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    saveHistory([]);
    setHistory([]);
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
