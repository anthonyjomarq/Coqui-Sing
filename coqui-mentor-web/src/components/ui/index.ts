/**
 * UI Components
 * Reusable, accessible UI components built with TypeScript and Tailwind CSS
 *
 * @example
 * import { Button, Card, Modal, Input } from '@/components/ui';
 */

// Button
export { Button } from './Button';
export type { ButtonProps } from './Button';

// Card
export { Card, CardHeader, CardBody, CardFooter } from './Card';
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './Card';

// Modal
export { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
export type {
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
} from './Modal';

// Input
export { Input, Textarea } from './Input';
export type { InputProps, TextareaProps } from './Input';

// Loader
export { Loader } from './Loader';
export type { LoaderProps } from './Loader';
