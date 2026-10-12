import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal TypeScript definitions for Web Speech API to ensure type-safety without leaking `any`
interface SpeechRecognitionAlternativeLike {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternativeLike;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  readonly length: number;
  item(index: number): SpeechRecognitionResultLike;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string;
  readonly message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type SpeechInputStatus = 'idle' | 'listening' | 'error';

export interface UseSpeechInputReturn {
  supported: boolean;
  status: SpeechInputStatus;
  error: string | null;
  start: () => void;
  stop: () => void;
}

/**
 * Hook for speech recognition using the browser's Web Speech API.
 * 
 * @param onText Callback receiving spoken transcript updates (interim and final)
 * @param lang BCP 47 language tag (default: 'en-IN')
 */
export function useSpeechInput(
  onText: (text: string, isFinal: boolean) => void,
  lang: string = 'en-IN'
): UseSpeechInputReturn {
  const [status, setStatus] = useState<SpeechInputStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const onTextRef = useRef(onText);
  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef(false);

  const isSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore if already stopped or transitioning
      }
    }
    setStatus('idle');
  }, []);

  const start = useCallback(() => {
    if (!isSupported) {
      setError('Voice input is not supported in this browser.');
      setStatus('error');
      return;
    }

    if (isListeningRef.current) {
      return; // ignore start() while already listening
    }

    // Clean up any stale recognition session
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    setError(null);

    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionApi) return;

    try {
      const recognition = new SpeechRecognitionApi();
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;
      recognition.lang = lang;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setStatus('listening');
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let fullTranscript = '';
        let isFinal = false;

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res && res[0]) {
            fullTranscript += res[0].transcript;
          }
          if (res && res.isFinal) {
            isFinal = true;
          }
        }

        if (fullTranscript) {
          onTextRef.current(fullTranscript, isFinal);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        isListeningRef.current = false;
        if (event.error === 'aborted') {
          setStatus('idle');
          return;
        }

        let friendlyError = 'Voice input failed.';
        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            friendlyError = 'Microphone access was denied. Please allow microphone permissions.';
            break;
          case 'no-speech':
            friendlyError = 'No speech was detected. Please try speaking again.';
            break;
          case 'audio-capture':
            friendlyError = 'No microphone was found or microphone is busy.';
            break;
          case 'network':
            friendlyError = 'Network error occurred during speech recognition.';
            break;
          default:
            friendlyError = 'Voice input failed.';
            break;
        }

        setError(friendlyError);
        setStatus('error');
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setStatus(current => (current === 'listening' ? 'idle' : current));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      isListeningRef.current = false;
      setError('Voice input failed.');
      setStatus('error');
    }
  }, [isSupported, lang]);

  // Abort recognition cleanly on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    supported: isSupported,
    status,
    error,
    start,
    stop,
  };
}
