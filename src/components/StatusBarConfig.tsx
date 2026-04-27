import React from 'react';
import { StatusBar, Platform } from 'react-native';
import Colors from '../theme/colors';

interface StatusBarConfigProps {
  backgroundColor?: string;
  barStyle?: 'light-content' | 'dark-content' | 'default';
  translucent?: boolean;
}

/**
 * StatusBarConfig — Consistent StatusBar across all screens.
 * - Dark background with light icons by default (matches Eybii theme).
 * - Translucent on Android for edge-to-edge feel.
 */
const StatusBarConfig: React.FC<StatusBarConfigProps> = ({
  backgroundColor = Colors.statusBar,
  barStyle = 'dark-content',
  translucent = false,
}) => {
  return (
    <StatusBar
      backgroundColor={backgroundColor}
      barStyle={barStyle}
      translucent={translucent}
      animated={true}
    />
  );
};

export default StatusBarConfig;
