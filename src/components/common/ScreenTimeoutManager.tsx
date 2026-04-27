import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppState,
} from 'react-native';
import { Fonts } from '../../theme/fonts';

interface ScreenTimeoutManagerProps {
  isActive?: boolean;
  timeoutInSeconds?: number;
  onTimeout: () => void;
  showCountdown?: boolean;
  countdownText?: string;
  children?: React.ReactNode;
}

const ScreenTimeoutManager: React.FC<ScreenTimeoutManagerProps> = ({
  isActive = true,
  timeoutInSeconds = 300,
  onTimeout,
  showCountdown = true,
  countdownText = "Session will expire in",
  children
}) => {
  const timerRef = useRef<NodeJS.Timeout| null>(null);
  const appState = useRef(AppState.currentState);
  const startTimeRef = useRef<number | null>(null);
  const [countdown, setCountdown] = useState(timeoutInSeconds);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (startTimeRef.current && isActive) {
          const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const remaining = Math.max(timeoutInSeconds - elapsedSeconds, 0);
          setCountdown(remaining);

          if (remaining <= 0) {
            clearTimer();
            onTimeout();
          } else {
            startTimer();
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isActive, timeoutInSeconds]);

  useEffect(() => {
    if (isActive) {
      setCountdown(timeoutInSeconds);
      startTimeRef.current = Date.now();
      startTimer();
    } else {
      clearTimer();
    }

    return () => clearTimer();
  }, [isActive, timeoutInSeconds]);

  const startTimer = () => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearTimer();
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {children}
      {showCountdown && isActive && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>
            {countdownText} {formatTime(countdown)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ScreenTimeoutManager;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  countdownContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  countdownText: {
    color: '#6B7280',
    fontSize: 11,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
  },
});
