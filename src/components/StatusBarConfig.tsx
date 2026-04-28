import React from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  barStyle = 'light-content',
  translucent = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={{ height: insets.top, backgroundColor, zIndex: 999 }}>
        <StatusBar
          backgroundColor={backgroundColor}
          barStyle={barStyle}
          translucent={translucent}
          animated={true}
        />
      </View>
      {insets.bottom > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: insets.bottom,
            backgroundColor: Colors.background, // Match screen bottom background or keep it configurable
            zIndex: 999,
          }}
        />
      )}
    </>
  );
};

export default StatusBarConfig;
