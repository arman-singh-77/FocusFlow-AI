import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { soundService } from '../services/sound';
import { useTasks } from './TaskContext';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerContextType {
  mode: TimerMode;
  timeLeft: number;
  totalDuration: number;
  isRunning: boolean;
  activeTaskId: string | null;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setMode: (mode: TimerMode) => void;
  setActiveTaskId: (id: string | null) => void;
  progressPercent: number; // 0 - 100
  formatTimeLeft: () => string;
}

const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addFocusMinutes } = useTasks();
  const [mode, setModeState] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_DURATIONS.focus);
  const [totalDuration, setTotalDuration] = useState<number>(DEFAULT_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const activeTaskRef = useRef<string | null>(null);
  activeTaskRef.current = activeTaskId;

  const modeRef = useRef<TimerMode>(mode);
  modeRef.current = mode;

  useEffect(() => {
    let interval: any = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            soundService.playTimerFinish();

            // If focus session completed, credit focus minutes
            if (modeRef.current === 'focus' && activeTaskRef.current) {
              addFocusMinutes(activeTaskRef.current, Math.round(DEFAULT_DURATIONS.focus / 60));
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, addFocusMinutes]);

  const startTimer = () => {
    soundService.playStart();
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(DEFAULT_DURATIONS[mode]);
    setTotalDuration(DEFAULT_DURATIONS[mode]);
  };

  const setMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setModeState(newMode);
    setTimeLeft(DEFAULT_DURATIONS[newMode]);
    setTotalDuration(DEFAULT_DURATIONS[newMode]);
  };

  const progressPercent = totalDuration > 0
    ? Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100))
    : 0;

  const formatTimeLeft = (): string => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TimerContext.Provider
      value={{
        mode,
        timeLeft,
        totalDuration,
        isRunning,
        activeTaskId,
        startTimer,
        pauseTimer,
        resetTimer,
        setMode,
        setActiveTaskId,
        progressPercent,
        formatTimeLeft,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export function useTimer(): TimerContextType {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
