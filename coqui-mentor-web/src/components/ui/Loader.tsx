import { CSSProperties, useEffect, useState } from 'react';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  speed?: number;
  fullscreen?: boolean;
  text?: string;
  variant?: 'rotate' | 'pulse';
  show?: boolean;
  backdropOpacity?: number;
}

const sizeValues = {
  sm: '30px',
  md: '45px',
  lg: '60px',
};

const particleConfig = [
  { rotation: 8, delay: 0 },
  { rotation: 36, delay: -0.4 },
  { rotation: 72, delay: -0.9 },
  { rotation: 90, delay: -0.5 },
  { rotation: 144, delay: -0.3 },
  { rotation: 180, delay: -0.2 },
  { rotation: 216, delay: -0.6 },
  { rotation: 252, delay: -0.7 },
  { rotation: 300, delay: -0.1 },
  { rotation: 324, delay: -0.8 },
  { rotation: 335, delay: -1.2 },
  { rotation: 290, delay: -0.5 },
  { rotation: 240, delay: -0.2 },
];

const isTailwindClass = (color: string): boolean => {
  return color.startsWith('bg-') || color.startsWith('text-');
};

const getTailwindColor = (): string => {
  return '#2E7D32';
};

export const Loader = ({
  size = 'md',
  color = '#2E7D32',
  className = '',
  speed = 1.75,
  fullscreen = false,
  text,
  variant = 'rotate',
  show = true,
  backdropOpacity = 50,
}: LoaderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(show);
  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);
  useEffect(() => {
    if (fullscreen && shouldRender) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [fullscreen, shouldRender]);

  if (!shouldRender) return null;

  const sizeValue = sizeValues[size];
  const useTailwindColor = isTailwindClass(color);
  const particleColor = useTailwindColor ? getTailwindColor() : color;

  const getAnimation = () => {
    if (variant === 'pulse') {
      return `loaderPulse ${speed}s ease-in-out infinite`;
    }
    return `loaderRotate ${speed * 4}s linear infinite`;
  };

  const containerStyle: CSSProperties = {
    position: 'relative',
    height: sizeValue,
    width: sizeValue,
    animation: getAnimation(),
  };

  const loaderContent = (
    <>
      <style>{`
        @keyframes loaderRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes loaderPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes loaderOrbit {
          0% {
            transform: translate(calc(var(--loader-size) * 0.5)) scale(0.73684);
            opacity: 0.65;
          }
          5% {
            transform: translate(calc(var(--loader-size) * 0.4)) scale(0.684208);
            opacity: 0.58;
          }
          10% {
            transform: translate(calc(var(--loader-size) * 0.3)) scale(0.631576);
            opacity: 0.51;
          }
          15% {
            transform: translate(calc(var(--loader-size) * 0.2)) scale(0.578944);
            opacity: 0.44;
          }
          20% {
            transform: translate(calc(var(--loader-size) * 0.1)) scale(0.526312);
            opacity: 0.37;
          }
          25% {
            transform: translate(0%) scale(0.47368);
            opacity: 0.3;
          }
          30% {
            transform: translate(calc(var(--loader-size) * -0.1)) scale(0.526312);
            opacity: 0.37;
          }
          35% {
            transform: translate(calc(var(--loader-size) * -0.2)) scale(0.578944);
            opacity: 0.44;
          }
          40% {
            transform: translate(calc(var(--loader-size) * -0.3)) scale(0.631576);
            opacity: 0.51;
          }
          45% {
            transform: translate(calc(var(--loader-size) * -0.4)) scale(0.684208);
            opacity: 0.58;
          }
          50% {
            transform: translate(calc(var(--loader-size) * -0.5)) scale(0.73684);
            opacity: 0.65;
          }
          55% {
            transform: translate(calc(var(--loader-size) * -0.4)) scale(0.789472);
            opacity: 0.72;
          }
          60% {
            transform: translate(calc(var(--loader-size) * -0.3)) scale(0.842104);
            opacity: 0.79;
          }
          65% {
            transform: translate(calc(var(--loader-size) * -0.2)) scale(0.894736);
            opacity: 0.86;
          }
          70% {
            transform: translate(calc(var(--loader-size) * -0.1)) scale(0.947368);
            opacity: 0.93;
          }
          75% {
            transform: translate(0%) scale(1);
            opacity: 1;
          }
          80% {
            transform: translate(calc(var(--loader-size) * 0.1)) scale(0.947368);
            opacity: 0.93;
          }
          85% {
            transform: translate(calc(var(--loader-size) * 0.2)) scale(0.894736);
            opacity: 0.86;
          }
          90% {
            transform: translate(calc(var(--loader-size) * 0.3)) scale(0.842104);
            opacity: 0.79;
          }
          95% {
            transform: translate(calc(var(--loader-size) * 0.4)) scale(0.789472);
            opacity: 0.72;
          }
          100% {
            transform: translate(calc(var(--loader-size) * 0.5)) scale(0.73684);
            opacity: 0.65;
          }
        }

        .loader-particle {
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
        }

        .loader-particle::before {
          content: '';
          position: absolute;
          height: 17.5%;
          width: 17.5%;
          border-radius: 50%;
          background-color: var(--loader-color);
          flex-shrink: 0;
          transition: background-color 0.3s ease;
          animation: loaderOrbit var(--loader-speed) linear var(--loader-delay) infinite;
        }
      `}</style>

      <div className="flex flex-col items-center justify-center">
        <div
          className={`${useTailwindColor ? color.replace('bg-', 'loader-tailwind-') : ''} ${className}`}
          style={
            {
              ...containerStyle,
              '--loader-size': sizeValue,
              '--loader-color': particleColor,
              '--loader-speed': `${speed}s`,
            } as CSSProperties
          }
          role="status"
          aria-label={text || 'Loading'}
        >
          {particleConfig.map((particle, index) => (
            <div
              key={index}
              className={`loader-particle ${useTailwindColor ? color : ''}`}
              style={
                {
                  transform: `rotate(${particle.rotation}deg)`,
                  '--loader-delay': `${particle.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
        {text && (
          <p className="mt-4 text-sm font-medium text-gray-700 animate-pulse">{text}</p>
        )}
      </div>
    </>
  );

  // Fullscreen mode
  if (fullscreen) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundColor: `rgba(0, 0, 0, ${backdropOpacity / 100})`,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Loading"
      >
        {loaderContent}
      </div>
    );
  }

  return (
    <div
      className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {loaderContent}
    </div>
  );
};
