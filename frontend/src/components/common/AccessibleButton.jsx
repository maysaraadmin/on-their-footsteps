import React from 'react';
import PropTypes from 'prop-types';

/**
 * Accessible Button component with comprehensive ARIA support
 * Follows WCAG 2.1 AA guidelines for accessibility
 */

const AccessibleButton = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  ariaLabel,
  ariaDescribedBy,
  ariaPressed,
  ariaExpanded,
  ariaControls,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-gray-300 disabled:text-gray-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300 disabled:text-gray-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 disabled:border-gray-300 disabled:text-gray-400',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500 disabled:text-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-300 disabled:text-gray-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    disabled && 'cursor-not-allowed opacity-50',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (event) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    
    onClick?.(event);
  };

  const handleKeyDown = (event) => {
    // Handle keyboard interactions
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleClick(event);
    }
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    const IconComponent = icon;
    const iconClasses = [
      iconSizeClasses[size],
      iconPosition === 'left' && 'mr-2',
      iconPosition === 'right' && 'ml-2',
      loading && 'animate-spin'
    ].filter(Boolean).join(' ');

    return <IconComponent className={iconClasses} aria-hidden="true" />;
  };

  const renderLoadingState = () => {
    if (!loading) return null;
    
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  };

  return (
    <button
      type={type}
      className={classes}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-disabled={disabled}
      aria-busy={loading}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {loading ? renderLoadingState() : children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

AccessibleButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  ariaPressed: PropTypes.bool,
  ariaExpanded: PropTypes.bool,
  ariaControls: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string
};

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
