import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 disabled:bg-primary-300',
  secondary:
    'bg-secondary-500 text-white hover:bg-secondary-600 focus-visible:ring-secondary-500 disabled:bg-secondary-300',
  accent:
    'bg-accent-500 text-gray-900 hover:bg-accent-600 focus-visible:ring-accent-500 disabled:bg-accent-300',
  danger:
    'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 disabled:bg-red-300',
  outline:
    'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white focus-visible:ring-primary-500 disabled:border-gray-300 disabled:text-gray-300',
  ghost:
    'text-primary-500 hover:bg-primary-50 focus-visible:ring-primary-500 disabled:text-gray-300',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

  const widthStyles = fullWidth ? 'w-full' : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={combinedClassName}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
