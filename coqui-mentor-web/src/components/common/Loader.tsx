/**
 * Loader Component - Loading spinner
 */

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

export function Loader({ size = 'md', className = '' }: LoaderProps) {
  return (
    <div
      className={`${sizeClasses[size]} border-purple-600 border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
