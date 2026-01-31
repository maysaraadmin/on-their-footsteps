import React, { forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';

/**
 * Accessible Input component with comprehensive ARIA support
 * Follows WCAG 2.1 AA guidelines for accessibility
 */

const AccessibleInput = forwardRef(({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  label,
  required = false,
  disabled = false,
  readOnly = false,
  size = 'md',
  className = '',
  id,
  ariaLabel,
  ariaDescribedBy,
  ariaInvalid,
  ariaRequired,
  ...props
}, ref) => {
  const inputRef = useImperativeHandle();
  
  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  
  const baseClasses = 'block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '';
  
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-5 py-4'
  };

  const classes = [
    baseClasses,
    errorClasses,
    disabledClasses,
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  const handleChange = (event) => {
    if (disabled || readOnly) {
      return;
    }
    onChange?.(event.target.value);
  };

  const handleBlur = (event) => {
    if (disabled || readOnly) {
      return;
    }
    onBlur?.(event.target.value);
  };

  const handleFocus = (event) => {
    if (disabled || readOnly) {
      return;
    }
    onFocus?.(event.target.value);
  };

  const handleKeyDown = (event) => {
    // Handle keyboard navigation
    if (event.key === 'Escape') {
      event.target.blur();
    }
  };

  // Expose ref to parent
  React.useImperativeHandle(inputRef, ref);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium text-gray-700 mb-2 ${required ? 'required' : ''}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          id={inputId}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={classes}
          aria-label={ariaLabel || label}
          aria-describedby={[ariaDescribedBy, helperId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={ariaInvalid || !!error}
          aria-required={ariaRequired || required}
          aria-disabled={disabled}
          aria-readonly={readOnly}
          {...props}
        />
        
        {/* Error indicator */}
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 011-2 0 1 1 0 012 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      
      {/* Helper text */}
      {helperText && (
        <p id={helperId} className="mt-1 text-sm text-gray-600">
          {helperText}
        </p>
      )}
      
      {/* Error message */}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

AccessibleInput.displayName = 'AccessibleInput';

AccessibleInput.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'search']),
  placeholder: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  id: PropTypes.string,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  ariaInvalid: PropTypes.bool,
  ariaRequired: PropTypes.bool
};

export default AccessibleInput;
