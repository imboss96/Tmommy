import React from 'react';

interface MommyCareLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  colorScheme?: 'default' | 'white' | 'light';
  className?: string;
  iconClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showLocationBadge?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const MommyCareLogo: React.FC<MommyCareLogoProps> = ({
  variant = 'compact',
  colorScheme = 'default',
  className = '',
  iconClassName = '',
  size = 'md',
  showTagline = true,
  showLocationBadge = true,
  onClick
}) => {
  const logoDimensions = {
    sm: 'w-44 h-22',
    md: 'w-56 h-28',
    lg: 'w-72 h-36',
    xl: 'w-80 h-40'
  }[size];

  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  }[size];

  if (variant === 'icon') {
    return (
      <a href="/" onClick={onClick} className={`inline-flex items-center cursor-pointer ${className}`} aria-label="Go to MommyCare home page">
        <img src="/logo-icon.svg" alt="MommyCare" className={`${iconDimensions} object-contain ${iconClassName}`} />
      </a>
    );
  }

  return (
    <a
      href="/"
      onClick={onClick}
      className={`inline-flex items-center cursor-pointer group select-none ${className}`}
    >
      <img
        src="/mommycare-logo.svg"
        alt="MommyCare - Quality Care. Safer Homes."
        className={`${logoDimensions} object-contain object-left`}
      />
    </a>
  );
};
