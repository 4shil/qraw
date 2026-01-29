import { QRData } from '../types/qr';
import { getHistory, removeFromHistory, clearHistory } from '../utils/storage';
import { useState, useEffect } from 'react';

interface HistoryProps {
  onSelect: (content: string) => void;
  refreshTrigger: number;
}

export function History({ onSelect, refreshTrigger }: HistoryProps) {
  const [history, setHistory] = useState<QRData[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, [refreshTrigger]);

  const handleRemove = (id: string) => {
    removeFromHistory(id);
    setHistory(getHistory());
  };

  const handleClear = () => {
    if (confirm('Clear all history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncate = (text: string, max: number) => {
    return text.length > max ? text.slice(0, max) + '...' : text;
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="brutal-button-secondary w-full flex items-center justify-between"
      >
        <span>History ({history.length})</span>
        <span className="text-xs">{showHistory ? 'Hide' : 'Show'}</span>
      </button>
      
      {showHistory && (
        <div className="brutal-card mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="brutal-heading text-sm">Recent QR Codes</h3>
            <button
              onClick={handleClear}
              className="text-red-500 font-medium text-sm uppercase hover:underline"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border-2 border-[#e5e5e5] hover:border-[#1a1a1a] transition-colors rounded-sm"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelect(item.content)}
                >
                  <p className="font-semibold text-sm uppercase text-[#737373]">{item.type}</p>
                  <p className="text-[#1a1a1a] text-sm">{truncate(item.content, 40)}</p>
                  <p className="text-[#a3a3a3] text-xs">{formatDate(item.timestamp)}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="ml-2 p-2 font-bold hover:bg-red-50 rounded-sm text-[#737373] hover:text-red-500 transition-colors"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
