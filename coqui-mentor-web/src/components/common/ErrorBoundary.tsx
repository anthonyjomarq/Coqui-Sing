import { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="card p-6 border-red-200 bg-red-50">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>

            <div className="flex-1">
              <h3 className="text-lg font-display font-semibold text-red-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-sm text-red-800 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>

              <button
                onClick={this.resetError}
                className="btn btn-outline border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2"
              >
                Try Again
              </button>
            </div>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <details className="mt-4 p-3 bg-white rounded border border-red-300">
              <summary className="text-sm font-medium text-red-900 cursor-pointer">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 text-xs text-red-800 overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
