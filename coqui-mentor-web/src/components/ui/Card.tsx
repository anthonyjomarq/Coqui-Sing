import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'flat';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white shadow-md',
  bordered: 'bg-white border-2 border-gray-300',
  flat: 'bg-gray-50',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = ({
  header,
  children,
  footer,
  variant = 'default',
  hoverable = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) => {
  const hoverStyles = hoverable ? 'transition-shadow hover:shadow-lg cursor-pointer' : '';

  const baseStyles = 'rounded-lg overflow-hidden';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`;

  return (
    <div className={combinedClassName} {...props}>
      {header && (
        <div
          className={`border-b border-gray-200 ${padding === 'none' ? 'p-4' : paddingStyles[padding]}`}
        >
          {typeof header === 'string' ? (
            <h3 className="text-lg font-display font-semibold text-gray-900">{header}</h3>
          ) : (
            header
          )}
        </div>
      )}

      <div className={padding !== 'none' ? paddingStyles[padding] : ''}>{children}</div>

      {footer && (
        <div
          className={`border-t border-gray-200 bg-gray-50 ${padding === 'none' ? 'p-4' : paddingStyles[padding]}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export const CardHeader = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  ...props
}: CardHeaderProps) => {
  return (
    <div className={`flex items-start justify-between ${className}`} {...props}>
      <div className="flex-1">
        {title && <h3 className="text-lg font-display font-semibold text-gray-900">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
};

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardBody = ({ children, className = '', ...props }: CardBodyProps) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter = ({
  children,
  align = 'right',
  className = '',
  ...props
}: CardFooterProps) => {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={`flex items-center ${alignStyles[align]} ${className}`} {...props}>
      {children}
    </div>
  );
};
