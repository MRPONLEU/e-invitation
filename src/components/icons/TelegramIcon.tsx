import React from 'react';

interface TelegramIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * Custom Telegram Paper Plane Icon
 * Matches the outline paper airplane styling requested by the user.
 */
export const TelegramIcon: React.FC<TelegramIconProps> = ({ 
  className = "w-4 h-4", 
  size, 
  ...props 
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size || undefined}
      height={size || undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Main wings and fold */}
      <polygon points="22 2 2 9.5 8.5 13.5 22 2" />
      <polygon points="22 2 14.5 22 8.5 13.5 22 2" />
      {/* Downward triangle rudder */}
      <polyline points="8.5 13.5 9.5 18.5 12.2 15.5" />
    </svg>
  );
};
