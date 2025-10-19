import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  showRequired?: boolean;
}

const variantStyles = {
  default:
    'border border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500',
  filled:
    'border-0 bg-gray-100 focus:bg-white focus:ring-primary-500',
  outlined:
    'border-2 border-gray-300 bg-transparent focus:border-primary-500 focus:ring-0',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      variant = 'default',
      inputSize = 'md',
      startIcon,
      endIcon,
      fullWidth = false,
      showRequired = false,
      disabled = false,
      className = '',
      id,
      required = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const baseInputStyles =
      'w-full rounded-md transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500';

    const errorStyles = hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : '';

    const iconPaddingStyles = startIcon ? 'pl-10' : endIcon ? 'pr-10' : '';

    const inputClassName = `${baseInputStyles} ${variantStyles[variant]} ${sizeStyles[inputSize]} ${errorStyles} ${iconPaddingStyles} ${className}`;

    const containerWidth = fullWidth ? 'w-full' : '';

    return (
      <div className={containerWidth}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {(showRequired || required) && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">{startIcon}</span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            className={inputClassName}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500">{endIcon}</span>
            </div>
          )}
        </div>

        {(helperText || error) && (
          <p
            id={error ? `${inputId}-error` : `${inputId}-helper`}
            className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-600'}`}
            role={error ? 'alert' : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps
  extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  rows?: number;
  fullWidth?: boolean;
  showRequired?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      rows = 4,
      fullWidth = false,
      showRequired = false,
      disabled = false,
      className = '',
      id,
      required = false,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const baseStyles =
      'w-full px-4 py-2 text-base rounded-md border border-gray-300 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500 resize-y';

    const errorStyles = hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : '';

    const textareaClassName = `${baseStyles} ${errorStyles} ${className}`;

    const containerWidth = fullWidth ? 'w-full' : '';

    return (
      <div className={containerWidth}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {(showRequired || required) && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          required={required}
          className={textareaClassName}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />

        {(helperText || error) && (
          <p
            id={error ? `${textareaId}-error` : `${textareaId}-helper`}
            className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-600'}`}
            role={error ? 'alert' : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
