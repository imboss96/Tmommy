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
    sm: 'w-36 h-18',
    md: 'w-48 h-24',
    lg: 'w-64 h-32',
    xl: 'w-72 h-36'
  }[size];

  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
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
