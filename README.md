# Coqui Sing

**AI-Powered Real-Time Vocal Training Platform**

A sophisticated web application for vocal training featuring real-time pitch detection, advanced audio visualization, and comprehensive progress tracking. Built with modern web technologies and optimized for performance, this project demonstrates advanced audio processing, state management, and responsive UI design.

Named after the Coqui frog native to Puerto Rico—known for its distinctive nighttime singing—this platform helps singers develop their voice with professional-grade tools accessible directly in the browser.

---

## Key Features

- **Real-Time Pitch Detection** - Sub-50ms latency using autocorrelation algorithm with confidence scoring
- **Advanced Audio Visualization** - Dual-mode visualizer with waveform and chromatic scale spectrogram (C2-C6 range)
- **Recording & Playback** - Capture practice sessions with automatic analysis and scoring
- **Exercise Library** - Curated vocal exercises with difficulty progression and filtering
- **Progress Tracking** - Comprehensive analytics including streak tracking, score trends, and practice history
- **Responsive Design** - Mobile-first UI with dark mode and smooth animations

---

## Technical Highlights

### Audio Processing

- **Web Audio API Integration** - Custom audio context management with proper cleanup and state handling
- **YIN-Based Pitch Detection** - Autocorrelation algorithm for accurate fundamental frequency extraction
- **FFT Spectral Analysis** - 8192-point FFT for high-resolution frequency visualization
- **Web Workers** - Off-thread audio processing to maintain 60fps UI performance
- **MediaRecorder API** - Professional recording with automatic MIME type detection

### Frontend Architecture

- **React 18** with TypeScript for type-safe component development
- **Redux Toolkit** for predictable state management with middleware
- **React Query** (@tanstack/react-query) for efficient data fetching and caching
- **Custom Hooks** - Reusable logic for audio context, microphone, pitch detection, and keyboard shortcuts
- **React Router** for client-side routing with error boundaries

### Performance Optimizations

- **Memory Leak Prevention** - Comprehensive cleanup in all useEffect hooks
- **Throttled Updates** - Optimized re-renders for high-frequency audio data
- **Lazy Loading** - Code splitting for faster initial load times
- **Canvas Rendering** - Hardware-accelerated visualization with ImageData manipulation

### UI/UX

- **Tailwind CSS** - Utility-first styling with custom animations
- **Accessibility** - WCAG-compliant color contrast and semantic HTML
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Dark Mode** - Professionally designed gradient theme

---

## Tech Stack

| Category             | Technologies                                  |
| -------------------- | --------------------------------------------- |
| **Frontend**         | React 18, TypeScript, Vite                    |
| **State Management** | Redux Toolkit, React Query                    |
| **Audio Processing** | Web Audio API, MediaRecorder API, Web Workers |
| **Styling**          | Tailwind CSS, CSS Animations                  |
| **Routing**          | React Router v6                               |
| **Build Tools**      | Vite, ESLint, PostCSS                         |

---

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Modern browser with Web Audio API support (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/anthonyjomarq/Coqui-Sing.git
cd Coqui-Sing/coqui-mentor-web

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to view the application.

### Production Build

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```
coqui-mentor-web/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── audio/        # Audio-specific components
│   │   ├── common/       # Shared components (Button, Card, Loader)
│   │   └── layout/       # Layout components (Header, Sidebar)
│   ├── hooks/            # Custom React hooks
│   │   ├── data/         # Data fetching hooks (React Query)
│   │   ├── useAudioContext.ts
│   │   ├── useMicrophone.ts
│   │   ├── usePitchDetection.ts
│   │   └── useAudioRecorder.ts
│   ├── pages/            # Route pages
│   ├── store/            # Redux store and slices
│   │   ├── slices/       # Redux slices (audio, session, UI)
│   │   └── middleware/   # Custom middleware
│   ├── services/         # API services and mock data
│   ├── utils/            # Utility functions
│   │   └── audio/        # Audio processing utilities
│   ├── workers/          # Web Workers for off-thread processing
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── package.json
```

---

## Features in Detail

### Real-Time Pitch Detection

Utilizes a custom implementation of the YIN algorithm for fundamental frequency detection with:

- Autocorrelation analysis for pitch extraction
- Confidence scoring to filter unreliable detections
- Musical note mapping with cent deviation
- Sub-50ms latency for real-time feedback

### Chromatic Scale Visualization

Advanced spectrogram with:

- Pixel-by-pixel scrolling animation using Canvas ImageData API
- Frequency-to-note mapping across 5 octaves (C2-C6)
- HSL-to-RGB color conversion for intensity visualization
- 8192-point FFT for high frequency resolution

### State Management

- **Redux Toolkit** for audio state, recording sessions, and UI preferences
- **React Query** for server state with automatic caching and invalidation
- **localStorage** persistence for exercises, recordings, and user progress

---

## Browser Compatibility

| Browser | Version | Support |
| ------- | ------- | ------- |
| Chrome  | 90+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 90+     | ✅ Full |

Requires modern browser with:

- Web Audio API
- MediaRecorder API
- Canvas API
- ES2020+ JavaScript features

---

## Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Audio Latency**: < 50ms
- **Frame Rate**: Consistent 60fps during visualization
- **Bundle Size**: ~250KB gzipped

---

## Contributing

This is a personal portfolio project, but suggestions and feedback are welcome! Feel free to open issues or submit pull requests.

---

## License

MIT License - feel free to use this project for learning or inspiration.

---

## About

Built by Anthony Colon Dominguez as a portfolio project showcasing full-stack development skills, advanced audio processing, and modern React patterns.

Inspired by the Coquí frog of Puerto Rico—representing the island's rich musical heritage and the journey of finding one's voice.

**GitHub**: https://github.com/anthonyjomarq/Coqui-Sing.git

---

## Acknowledgments

- Web Audio API for enabling browser-based audio processing
- YIN algorithm research for pitch detection methodology
- The singing community for inspiration and feedback
