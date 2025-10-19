# Audio Slice State Machine

This document describes the state machine implementation for the audio slice.

## State Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ┌──────┐                                                        │
│  │ idle │ ◄───────────────────────────────────────┐             │
│  └──┬───┘                                          │             │
│     │                                              │             │
│     │ initialize()                                 │             │
│     │ initializeAudio()                            │             │
│     │                                              │             │
│     ▼                                              │             │
│  ┌──────────────┐                                 │             │
│  │ initializing │                                 │             │
│  └──┬───────┬───┘                                 │             │
│     │       │                                     │             │
│     │       │ initializeError()                   │             │
│     │       │ initializeAudio.rejected            │             │
│     │       │                                     │             │
│     │       ▼                                     │             │
│     │    ┌───────┐                                │             │
│     │    │ error │                                │             │
│     │    └───┬───┘                                │             │
│     │        │                                    │             │
│     │        │ clearError()                       │             │
│     │        │ initialize()                       │             │
│     │        └────────────────────────────────────┘             │
│     │                                                            │
│     │ initializeSuccess()                                       │
│     │ initializeAudio.fulfilled                                 │
│     │                                                            │
│     ▼                                                            │
│  ┌──────┐                                                       │
│  │ idle │                                                       │
│  └──┬───┘                                                       │
│     │                                                            │
│     │ startRecording()                                          │
│     │                                                            │
│     ▼                                                            │
│  ┌───────────┐                                                  │
│  │ recording │ ◄────────────────────────────┐                  │
│  └─┬─────┬───┘                               │                  │
│    │     │                                   │                  │
│    │     │ pauseRecording()                  │                  │
│    │     │                                   │                  │
│    │     ▼                                   │                  │
│    │  ┌────────┐                             │                  │
│    │  │ paused │                             │                  │
│    │  └───┬─┬──┘                             │                  │
│    │      │ │                                │                  │
│    │      │ │ resumeRecording()              │                  │
│    │      │ └────────────────────────────────┘                  │
│    │      │                                                     │
│    │      │ stopRecording()                                     │
│    │      └─────────────────┐                                   │
│    │                        │                                   │
│    │ stopRecording()        │                                   │
│    │ startAnalysis()        │                                   │
│    │                        │                                   │
│    ▼                        ▼                                   │
│  ┌───────────┐                                                  │
│  │ analyzing │                                                  │
│  └─┬─────┬───┘                                                  │
│    │     │                                                      │
│    │     │ analyzeRecording()                                   │
│    │     │                                                      │
│    │     ▼                                                      │
│    │  ┌───────────────────┐                                    │
│    │  │ analyzeRecording  │                                    │
│    │  │   .pending        │                                    │
│    │  └────┬──────────┬───┘                                    │
│    │       │          │                                        │
│    │       │          │ .rejected                              │
│    │       │          └──────┐                                 │
│    │       │                 │                                 │
│    │       │ .fulfilled      ▼                                 │
│    │       │              ┌───────┐                            │
│    │       │              │ error │                            │
│    │       │              └───────┘                            │
│    │       │                                                   │
│    │       │ setAnalysis()                                     │
│    │       └─────────────────────────────────────────────────►│
│    │                                                            │
│    └────────────────────────────────────────────────────────►  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## States

### idle
- **Description**: Default state, ready to start recording or initialize
- **Valid Transitions**:
  - `initialize()` → initializing
  - `initializeAudio()` → initializing
  - `startRecording()` → recording

### initializing
- **Description**: Audio system is being initialized (permissions, device access)
- **Valid Transitions**:
  - `initializeSuccess()` → idle
  - `initializeError()` → error
  - `initializeAudio.fulfilled` → idle
  - `initializeAudio.rejected` → error

### recording
- **Description**: Active recording in progress
- **Valid Transitions**:
  - `pauseRecording()` → paused
  - `stopRecording()` → analyzing
  - `startAnalysis()` → analyzing

### paused
- **Description**: Recording is paused, can be resumed or stopped
- **Valid Transitions**:
  - `resumeRecording()` → recording
  - `stopRecording()` → analyzing
  - `startAnalysis()` → analyzing

### analyzing
- **Description**: Recording is being analyzed for vocal metrics
- **Valid Transitions**:
  - `setAnalysis()` → idle
  - `analyzeRecording.fulfilled` → idle
  - `analyzeRecording.rejected` → error

### error
- **Description**: An error has occurred
- **Valid Transitions**:
  - `clearError()` → idle
  - `initialize()` → initializing
  - `initializeAudio()` → initializing

## Validation Rules

### State Transition Guards

1. **canInitialize(status)**
   - Returns: `status === 'idle' || status === 'error'`
   - Used by: `initialize()`, `initializeAudio()`

2. **canStartRecording(status)**
   - Returns: `status === 'idle'`
   - Additional checks: `!state.isRecording`
   - Used by: `startRecording()`

3. **canPauseRecording(status)**
   - Returns: `status === 'recording'`
   - Additional checks: `state.isRecording && !state.isPaused`
   - Used by: `pauseRecording()`

4. **canResumeRecording(status)**
   - Returns: `status === 'paused'`
   - Additional checks: `state.isPaused`
   - Used by: `resumeRecording()`

5. **canStopRecording(status)**
   - Returns: `status === 'recording' || status === 'paused'`
   - Additional checks: `state.isRecording`
   - Used by: `stopRecording()`

6. **canAnalyze(status)**
   - Returns: `status === 'recording' || status === 'paused'`
   - Additional checks: `state.currentSession !== null`
   - Used by: `startAnalysis()`

## Actions

### Synchronous Actions

#### Initialization
- `initialize()` - Start initialization process
- `initializeSuccess()` - Complete initialization successfully
- `initializeError(error: string)` - Fail initialization with error

#### Recording Control
- `startRecording(sessionId: string)` - Begin recording session
- `pauseRecording()` - Pause active recording
- `resumeRecording()` - Resume paused recording
- `stopRecording(duration: number, audioBlob: Blob | null)` - Stop recording and transition to analyzing

#### Metrics and Analysis
- `updateMetrics(metrics: AudioMetrics)` - Update current metrics (only during recording/paused)
- `updateSessionDuration(duration: number)` - Update session duration (only during recording/paused)
- `setAnalysis(analysis: VocalAnalysis)` - Set analysis results and return to idle
- `startAnalysis()` - Manually trigger analysis state

#### Device Management
- `setDevices(devices: MediaDeviceInfo[])` - Set available audio devices
- `selectDevice(deviceId: string)` - Select active audio device

#### Settings
- `updateSettings(settings: Partial<AudioSettings>)` - Update audio settings
- `resetSettings()` - Reset to default audio settings

#### Error Handling
- `setError(error: string)` - Set error state
- `clearError()` - Clear error and return to idle
- `reset()` - Reset entire state to initial values
- `resetSession()` - Reset current session only

### Async Thunks

#### initializeAudio()
- **Purpose**: Initialize audio system, check permissions, enumerate devices
- **State Flow**:
  - pending: idle/error → initializing
  - fulfilled: initializing → idle
  - rejected: initializing → error
- **Returns**: void
- **Rejects with**: Error message string

#### fetchAudioDevices()
- **Purpose**: Fetch available audio input devices
- **State Flow**: Can be called from any state except error
- **Returns**: MediaDeviceInfo[]
- **Rejects with**: Error message string
- **Note**: Rejection doesn't change state, just logs error

#### analyzeRecording(sessionId, audioBlob)
- **Purpose**: Analyze recorded audio for vocal metrics
- **State Flow**:
  - pending: Must already be in analyzing state
  - fulfilled: analyzing → idle (with analysis results)
  - rejected: analyzing → error
- **Returns**: VocalAnalysis
- **Rejects with**: Error message string

## Usage Examples

### Basic Recording Flow

```typescript
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import {
  initializeAudio,
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  analyzeRecording,
} from '../../store/slices/audioSlice';

function RecordingComponent() {
  const dispatch = useAppDispatch();
  const { status, currentSession } = useAppSelector((state) => state.audio);

  // Initialize on mount
  useEffect(() => {
    dispatch(initializeAudio());
  }, [dispatch]);

  const handleStartRecording = () => {
    const sessionId = `session_${Date.now()}`;
    dispatch(startRecording({ sessionId }));
  };

  const handlePause = () => {
    dispatch(pauseRecording());
  };

  const handleResume = () => {
    dispatch(resumeRecording());
  };

  const handleStop = async () => {
    // Assume we have the audioBlob from MediaRecorder
    const audioBlob = getRecordedAudioBlob();
    const duration = Date.now() - currentSession.startTime;

    dispatch(stopRecording({ duration, audioBlob }));

    // Start analysis
    if (currentSession && audioBlob) {
      await dispatch(analyzeRecording({
        sessionId: currentSession.id,
        audioBlob,
      }));
    }
  };

  return (
    <div>
      <p>Status: {status}</p>
      {status === 'idle' && (
        <button onClick={handleStartRecording}>Start Recording</button>
      )}
      {status === 'recording' && (
        <>
          <button onClick={handlePause}>Pause</button>
          <button onClick={handleStop}>Stop</button>
        </>
      )}
      {status === 'paused' && (
        <>
          <button onClick={handleResume}>Resume</button>
          <button onClick={handleStop}>Stop</button>
        </>
      )}
      {status === 'analyzing' && <p>Analyzing your recording...</p>}
    </div>
  );
}
```

### Error Handling

```typescript
function AudioComponent() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.audio);

  useEffect(() => {
    const init = async () => {
      try {
        await dispatch(initializeAudio()).unwrap();
      } catch (err) {
        console.error('Failed to initialize audio:', err);
      }
    };
    init();
  }, [dispatch]);

  if (status === 'error') {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={() => dispatch(clearError())}>Clear Error</button>
        <button onClick={() => dispatch(initializeAudio())}>Retry</button>
      </div>
    );
  }

  return <div>Audio ready</div>;
}
```

## Validation Behavior

When an invalid state transition is attempted:
1. A warning is logged to the console
2. The state remains unchanged
3. An error message may be set in `state.error`
4. The reducer returns early without modifying state

This ensures the state machine integrity is maintained even if invalid actions are dispatched.
