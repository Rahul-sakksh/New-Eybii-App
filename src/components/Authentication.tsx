import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Fonts, FontSizes } from '../theme/fonts';

const { width, height } = Dimensions.get('window');

// ─── Light Theme Colors ─────────────────────────────────────────────
const C = {
  bg: '#FFFFFF',
  logoBg: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  primary: '#6366F1',
  border: '#E2E8F0',
};

const Authentication: React.FC = () => {
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(20)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const version = DeviceInfo.getVersion();

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(taglineY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={C.bg} barStyle="dark-content" />

      {/* Background glow */}
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}>
        <View style={styles.logoBg}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.View style={{ opacity: logoOpacity }}>
        <Text style={styles.appName}>eybii</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={{
          opacity: taglineOpacity,
          transform: [{ translateY: taglineY }],
        }}>
        <Text style={styles.tagline}>Track. Check-in. Deliver.</Text>
      </Animated.View>

      {/* Bottom version */}
      <View style={styles.bottomRow}>
        <Text style={styles.version}>v{version}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: C.primary,
    opacity: 0.08,
    top: height / 2 - 200,
    alignSelf: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoBg: {
    width: 110,
    height: 110,
    backgroundColor: C.logoBg,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  logoImage: {
    width: 65,
    height: 65,
  },
  logoIconRow: {
    flexDirection: 'row',
    position: 'absolute',
    top: 22,
    right: 22,
    gap: 4,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: C.primary,
  },
  logoText: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 52,
    color: C.text,
    marginTop: 8,
    letterSpacing: -2,
  },
  appName: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.xxxl,
    color: C.text,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.base,
    color: C.textMuted,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  bottomRow: {
    position: 'absolute',
    bottom: 40,
  },
  version: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.xs,
    color: C.textMuted,
    letterSpacing: 1,
  },
});

export default Authentication;
