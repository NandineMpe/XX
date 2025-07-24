import React from 'react';
import { Play } from 'lucide-react';

interface AuditStartButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isRunning?: boolean;
  children?: React.ReactNode;
}

const AuditStartButton: React.FC<AuditStartButtonProps> = ({
  onClick,
  disabled = false,
  isRunning = false,
  children
}) => {
  return (
    <div className="relative">
      <input
        type="checkbox"
        id="audit-checkbox"
        className="hidden"
        checked={isRunning}
        readOnly
      />
      <label
        htmlFor="audit-checkbox"
        className={`
          switch relative w-[70px] h-[70px] bg-gray-600 rounded-full z-10 cursor-pointer
          flex items-center justify-center border-2 border-gray-500
          shadow-[0px_0px_3px_rgb(2,2,2)_inset] transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          ${isRunning ? 'animate-pulse' : ''}
        `}
        onClick={disabled ? undefined : onClick}
        style={{
          boxShadow: isRunning 
            ? '0px 0px 1px rgb(151, 243, 255) inset, 0px 0px 2px rgb(151, 243, 255) inset, 0px 0px 10px rgb(151, 243, 255) inset, 0px 0px 40px rgb(151, 243, 255), 0px 0px 100px rgb(151, 243, 255), 0px 0px 5px rgb(151, 243, 255)'
            : '0px 0px 3px rgb(2, 2, 2) inset',
          borderColor: isRunning ? 'rgb(255, 255, 255)' : 'rgb(126, 126, 126)',
          backgroundColor: isRunning ? 'rgb(146, 180, 184)' : 'rgb(99, 99, 99)'
        }}
      >
        <Play 
          className="w-5 h-5 transition-all duration-300"
          style={{
            filter: isRunning ? 'drop-shadow(0px 0px 5px rgb(151, 243, 255))' : 'none',
            fill: isRunning ? 'rgb(255, 255, 255)' : 'rgb(48, 48, 48)',
            transform: isRunning ? 'scale(1.1)' : 'scale(1)'
          }}
        />
      </label>
      
      {/* Glow effect overlay */}
      {isRunning && (
        <div className="absolute inset-0 w-[70px] h-[70px] rounded-full animate-ping opacity-20"
             style={{
               background: 'radial-gradient(circle, rgb(151, 243, 255) 0%, transparent 70%)',
               filter: 'blur(2px)'
             }}
        />
      )}
      
      {/* Button label */}
      {children && (
        <div className="mt-2 text-center">
          <span className={`text-xs font-medium transition-colors duration-300 ${
            isRunning ? 'text-cyan-300' : 'text-gray-300'
          }`}>
            {children}
          </span>
        </div>
      )}
    </div>
  );
};

export default AuditStartButton; 