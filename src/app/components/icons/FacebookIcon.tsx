

import React from 'react';

const FacebookIcon: React.FC<{ size?: number }> = ({ size = 20, ...props }) => {
  const pathSize = 24; 
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox={`0 0 ${pathSize} ${pathSize}`} 
      width={size} 
      height={size} 
      fill="none" 
      aria-hidden="true" 
      {...props}
    >
      <path 
        fill="white" 
        d="M14 11.5h2.5l.5-3.5h-3v-2c0-.73.4-1.35 1.15-1.35H17V1H14c-3.1 0-4 1.8-4 4v2.5H7.5V11h2.5V23h4V11.5z"
      />
    </svg>
  );
};

export default FacebookIcon;