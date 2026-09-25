import React from 'react';

interface WorkfyLogoProps {
  className?: string;
  size?: number;
}

export const WorkfyLogo: React.FC<WorkfyLogoProps> = ({ className = 'h-9 w-9', size }) => {
  return (
    <img
      src="/favicon.svg"
      alt="Workfy Logo"
      width={size}
      height={size}
      className={`${className} rounded-xl shadow-2xs object-contain select-none`}
      referrerPolicy="no-referrer"
    />
  );
};
