import React from 'react';

interface SwitchProps {
  enabled: boolean;
  onChange: () => void;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ enabled, onChange, label }) => {
  return (
    <div className="flex items-center space-x-2">
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onChange}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
          border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
          focus:ring-blue-500 focus:ring-offset-2
          ${enabled ? 'bg-blue-500' : 'bg-gray-200'}
        `}
      >
        <span className="sr-only">Toggle Table Headers</span>
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full 
            bg-white shadow ring-0 transition duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
};