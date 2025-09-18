import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Heart } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'info' | 'danger';
  icon?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'Cancel',
  type = 'info',
  icon
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100',
          iconColor: 'text-amber-600',
          confirmBg: 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500',
          defaultIcon: <AlertTriangle size={24} />
        };
      case 'danger':
        return {
          iconBg: 'bg-gradient-to-br from-red-100 to-pink-100',
          iconColor: 'text-red-600',
          confirmBg: 'bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500',
          defaultIcon: <AlertTriangle size={24} />
        };
      default:
        return {
          iconBg: 'bg-gradient-to-br from-pink-100 to-rose-100',
          iconColor: 'text-pink-600',
          confirmBg: 'bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500',
          defaultIcon: <Heart size={24} />
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={handleCancel}
        />

        {/* Modal */}
        <motion.div
          initial={ { scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ 
            duration: 0.25,
            ease: [0.16, 1, 0.3, 1] // Custom easing for smooth feel
          }}
          className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="p-8 text-center">
            {/* Icon */}
            <div className={`w-16 h-16 ${typeStyles.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <div className={typeStyles.iconColor}>
                {icon || typeStyles.defaultIcon}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-gray-800 mb-3">{title}</h3>

            {/* Message */}
            <p className="text-gray-600 leading-relaxed mb-8 text-sm">{message}</p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-6 py-3 ${typeStyles.confirmBg} text-white rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}