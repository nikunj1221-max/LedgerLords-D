import React, { useEffect } from 'react';
import { CheckCircle, Info, AlertCircle, X } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';

export const NotificationToast: React.FC = () => {
  const { notification, clearNotification } = useWorkspaceStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isError = notification.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slideUp">
      <div
        className={`p-3.5 rounded-xl border shadow-xl backdrop-blur-md flex items-center justify-between gap-3 text-xs ${
          isSuccess
            ? 'bg-mint/15 border-mint/40 text-mint'
            : isError
            ? 'bg-coral/15 border-coral/40 text-coral'
            : 'bg-primary/15 border-primary/40 text-gray-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isSuccess && <CheckCircle className="w-4 h-4 text-mint shrink-0" />}
          {isError && <AlertCircle className="w-4 h-4 text-coral shrink-0" />}
          {!isSuccess && !isError && <Info className="w-4 h-4 text-primary shrink-0" />}
          <span className="font-medium leading-snug">{notification.message}</span>
        </div>

        <button
          onClick={clearNotification}
          className="p-1 rounded text-gray-400 hover:text-white transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
