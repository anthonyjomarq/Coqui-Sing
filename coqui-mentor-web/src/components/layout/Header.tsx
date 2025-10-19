import { useState } from 'react';
import { MicrophoneSelector } from '../audio/MicrophoneSelector';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [micSelectorOpen, setMicSelectorOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    onMenuToggle?.();
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 mr-2"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-display font-bold">M</span>
              </div>
              <span className="text-xl font-display font-semibold text-gray-900">
                MelodyMentor
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            <a
              href="#dashboard"
              className="text-gray-700 hover:text-primary-500 px-3 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#exercises"
              className="text-gray-700 hover:text-primary-500 px-3 py-2 text-sm font-medium transition-colors"
            >
              Exercises
            </a>
            <a
              href="#progress"
              className="text-gray-700 hover:text-primary-500 px-3 py-2 text-sm font-medium transition-colors"
            >
              Progress
            </a>
            <a
              href="#library"
              className="text-gray-700 hover:text-primary-500 px-3 py-2 text-sm font-medium transition-colors"
            >
              Library
            </a>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Microphone Button */}
            <div className="relative">
              <button
                onClick={() => setMicSelectorOpen(!micSelectorOpen)}
                className="hidden sm:inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                aria-label="Microphone settings"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>

              {/* Microphone Selector Dropdown */}
              {micSelectorOpen && (
                <div className="absolute right-0 mt-2 w-96 z-50">
                  <ErrorBoundary
                    fallback={
                      <div className="card p-4 border-red-200 bg-red-50">
                        <p className="text-sm text-red-800">
                          Unable to load microphone settings. Please refresh the page.
                        </p>
                      </div>
                    }
                    onError={(error) => {
                      console.error('Microphone selector error:', error);
                    }}
                  >
                    <MicrophoneSelector
                      onDeviceSelected={(deviceId) => {
                        console.log('Selected device:', deviceId);
                      }}
                      onPermissionGranted={() => {
                        console.log('Microphone permission granted');
                      }}
                    />
                  </ErrorBoundary>
                </div>
              )}
            </div>

            <button className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
              Start Practice
            </button>

            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">U</span>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-in">
                  <div className="py-1">
                    <a
                      href="#profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </a>
                    <a
                      href="#settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </a>
                    <a
                      href="#subscription"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Subscription
                    </a>
                    <hr className="my-1" />
                    <a
                      href="#logout"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 animate-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="#dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-100"
            >
              Dashboard
            </a>
            <a
              href="#exercises"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-100"
            >
              Exercises
            </a>
            <a
              href="#progress"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-100"
            >
              Progress
            </a>
            <a
              href="#library"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-100"
            >
              Library
            </a>
            <button className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600">
              Start Practice
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
