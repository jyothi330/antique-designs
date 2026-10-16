import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface Props {
  message: string;
  type?:   ToastType;
  onClose: () => void;
  duration?: number; // ms, default 3500
}

export default function Toast({ message, type = 'success', onClose, duration = 3500 }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const colours = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    info:    'bg-blue-600',
  };
  const icons = {
    success: '✓',
    error:   '✕',
    info:    'ℹ',
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold ${colours[type]}`}>
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
          {icons[type]}
        </span>
        {message}
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-xs">✕</button>
      </div>
    </div>
  );
}
