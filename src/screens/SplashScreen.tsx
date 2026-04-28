import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Fonts, FontSizes } from '../theme/fonts';
import { getData, STORAGE_KEYS } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

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

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(20)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animation and logic check in parallel
    const startAnimations = () => {
      // One single parallel pop for maximum speed
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 100, // Higher tension
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const checkLoginAndNavigate = async () => {
      try {
        const isLoggedIn = await getData(STORAGE_KEYS.LOGGED_IN);

        if (isLoggedIn === 'true') {
          navigation.replace('Home');
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('[Splash] Error during startup:', error);
        navigation.replace('Login');
      }
    };

    startAnimations();
    checkLoginAndNavigate();
  }, [navigation]);

  return (
    <View style={styles.container}>

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
          {/* Icon dots — mimic the eybii logo shape */}
          <View style={styles.logoIconRow}>
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.logoText}>e</Text>
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
        <Text style={styles.version}>v1.0.0</Text>
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

export default SplashScreen;
