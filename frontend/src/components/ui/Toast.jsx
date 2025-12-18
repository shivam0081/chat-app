import { Check, X, AlertCircle, Info } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const Toast = ({ type = 'info', message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const typeConfig = {
    success: {
      icon: Check,
      bgColor: 'bg-green-500',
      borderColor: 'border-green-400',
      textColor: 'text-white'
    },
    error: {
      icon: X,
      bgColor: 'bg-red-500',
      borderColor: 'border-red-400',
      textColor: 'text-white'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-500',
      borderColor: 'border-yellow-400',
      textColor: 'text-white'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-400',
      textColor: 'text-white'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`
      fixed top-4 right-4 z-50 
      ${config.bgColor} ${config.borderColor} ${config.textColor}
      border rounded-lg shadow-lg p-4 
      flex items-center space-x-3 
      animate-fade-in
      max-w-sm
    `}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 text-white/80 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

Toast.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired
};

export default Toast;