/**
 * Card Component - Reusable container with styling
 */

import { ReactNode, CSSProperties } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Card({ children, className = '', style }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`} style={style}>
      {children}
    </div>
  );
}
