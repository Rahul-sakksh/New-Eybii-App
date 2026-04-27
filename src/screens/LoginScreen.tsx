import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  BackHandler,
  Animated,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { getUniqueId } from 'react-native-device-info';
import { RootStackParamList } from '../navigation/AppNavigator';
import { API_BASE_URL } from '../api/endpoints';
import { storeData, STORAGE_KEYS, getData } from '../utils/storage';
import { Fonts, FontSizes } from '../theme/fonts';
import StatusBarConfig from '../components/StatusBarConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

// ─── Light Theme Colors ─────────────────────────────────────────────
const C = {
  bg: '#F8FAFC',              // Slate 50
  secondaryBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  inputBg: '#F1F5F9',         // Slate 100
  white: '#FFFFFF',
  primary: '#6366F1',         // Indigo
  primaryDark: '#4F46E5',
  primaryLight: 'rgba(99, 102, 241, 0.08)',
  text: '#0F172A',            // Slate 900
  textSecondary: '#475569',   // Slate 600
  textMuted: '#94A3B8',       // Slate 400
  border: '#E2E8F0',          // Slate 200
  borderFocus: '#6366F1',
  error: '#EF4444',
  shadow: 'rgba(99, 102, 241, 0.1)',
  cardShadow: 'rgba(0, 0, 0, 0.06)',
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // ─── Android back → exit app ──────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        Alert.alert(
          'Exit Eybii',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false },
        );
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => subscription.remove();
    }, []),
  );

  // ─── Validation ──────────────────────────────────────────────────────────
  const validate = (): boolean => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    if (!email.trim()) {
      setEmailError('Email / Username is required');
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      valid = false;
    }
    return valid;
  };

  // ─── Button press animation ───────────────────────────────────────────────
  const animateBtn = (cb: () => void) => {
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(cb);
  };

  useEffect(() => {
    const fetchDeviceId = async () => {
      try {
        const deviceID = await getUniqueId(); // Await the resolved Promise
        console.log("Device ID on Local: " + deviceID);
        storeData(STORAGE_KEYS.DEVICE_ID, deviceID); // Store the ID
      } catch (error) {
        console.error("Error fetching device ID:", error);
      }
    };

    fetchDeviceId(); // Call the async function
  }, []);


  // ─── Login API (FormData — matches your PHP backend) ─────────────────────
  const handleLogin = () => {
    if (!validate()) return;

    // Start login logic and animation in parallel
    setLoading(true);
    animateBtn(async () => {
      // Animation finished, but login logic might already be working
    });

    (async () => {
      try {
        const formData = new FormData();
        formData.append('user_name', email.trim());
        formData.append('password', password);
        formData.append('device_id', await getData(STORAGE_KEYS.DEVICE_ID));

        const response = await axios({
          url: `${API_BASE_URL}/login.php`,
          method: 'POST',
          data: formData,
          headers: {
            Accept: '*/*',
            'Content-Type': 'multipart/form-data',
          },
        });

        const data = response?.data?.data;
        if (data?.[0]?.message) {
          Alert.alert('Login Failed', data[0].message);
        } else if (data?.[0]?.id && data?.[0]?.token) {
          // Success — persist user session in parallel
          await Promise.all([
            storeData(STORAGE_KEYS.USER_NAME, data[0].name ?? ''),
            storeData(STORAGE_KEYS.USER_ID, String(data[0].id)),
            storeData(STORAGE_KEYS.TOKEN, data[0].token),
            storeData(STORAGE_KEYS.LOGGED_IN, 'true'),
            storeData(STORAGE_KEYS.USER_ROLE, data[0].user_role ?? ''),
            storeData(STORAGE_KEYS.RETAILER_ID, String(data[0].retailer_id ?? '')),
          ]);
          navigation.replace('Home');
        } else {
          Alert.alert('Login Failed', 'Unexpected response. Please try again.');
        }
      } catch (error: any) {
        console.error('[Login] error:', error);
        Alert.alert(
          'Connection Error',
          error?.response?.data?.message || 'Could not connect to server.',
        );
      } finally {
        setLoading(false);
      }
    })();
  };

  const isReady = email.trim().length > 0 && password.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBarConfig />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* ── Top Brand Badge ─────────────────────────────────── */}
          <View style={styles.brandSection}>
            <View style={styles.logoBadge}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>



            {/* <Text style={styles.brandName}>eybii</Text> */}
            <Text style={styles.brandTagline}>Workforce Management Platform</Text>
          </View>

          {/* ── Login Card ──────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account</Text>

            {/* Email / Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email / Username</Text>
              <TouchableWithoutFeedback onPress={() => emailRef.current?.focus()}>
                <View style={[styles.inputRow, emailFocused && styles.inputFocused, emailError ? styles.inputError : null]}>
                  <Mail size={18} color={emailFocused ? C.primary : C.textMuted} strokeWidth={1.8} />
                  <TextInput
                    ref={emailRef}
                    style={styles.input}
                    value={email}
                    onChangeText={t => { setEmail(t); setEmailError(''); }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="Enter email or username"
                    placeholderTextColor={C.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                </View>
              </TouchableWithoutFeedback>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TouchableWithoutFeedback onPress={() => passwordRef.current?.focus()}>
                <View style={[styles.inputRow, passFocused && styles.inputFocused, passwordError ? styles.inputError : null]}>
                  <Lock size={18} color={passFocused ? C.primary : C.textMuted} strokeWidth={1.8} />
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    value={password}
                    onChangeText={t => { setPassword(t); setPasswordError(''); }}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    placeholder="Enter your password"
                    placeholderTextColor={C.textMuted}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(p => !p)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showPassword
                      ? <Eye size={18} color={C.textMuted} strokeWidth={1.8} />
                      : <EyeOff size={18} color={C.textMuted} strokeWidth={1.8} />}
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            {/* Login Button */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                style={[styles.loginBtn, !isReady && styles.loginBtnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}>
                {loading ? (
                  <ActivityIndicator color={C.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.loginBtnText}>Sign In</Text>
                    <View style={styles.btnArrow}>
                      <ArrowRight size={18} color={C.white} strokeWidth={2.2} />
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* ── Footer ──────────────────────────────────────────── */}
          <View style={styles.footer}>
            <View style={styles.divRow}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>secured with eybii</Text>
              <View style={styles.divLine} />
            </View>
            <Text style={styles.footerNote}>
              © {new Date().getFullYear()} Eybii · All rights reserved
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // ── Brand ────────────────────────────────────────────────
  brandSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoBadge: {
    width: 80,
    height: 80,
    backgroundColor: C.secondaryBg,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: C.primaryLight,
  },
  logoImage: {
    width: 65,
    height: 65,
  },
  dotsRow: {
    flexDirection: 'row',
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.primary,
  },
  logoLetter: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 36,
    color: C.text,
    letterSpacing: -1.5,
    marginTop: 6,
  },
  brandName: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.xxl,
    color: C.text,
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  brandTagline: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.sm,
    color: C.textMuted,
    letterSpacing: 0.3,
  },

  // ── Card ─────────────────────────────────────────────────
  card: {
    width: '100%',
    backgroundColor: C.cardBg,
    borderRadius: 24,
    padding: 28,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F6',
    marginBottom: 32,
  },
  cardTitle: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.xl,
    color: C.text,
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.base,
    color: C.textSecondary,
    marginBottom: 28,
  },

  // ── Fields ───────────────────────────────────────────────
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: FontSizes.sm,
    color: C.text,
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputFocused: {
    borderColor: C.primary,
    backgroundColor: C.inputBg,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputError: {
    borderColor: C.error,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.base,
    color: C.text,
    paddingVertical: 0,
    paddingLeft: 10
  },
  errorText: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.xs,
    color: C.error,
    marginTop: 6,
    marginLeft: 4,
  },

  // ── Button ───────────────────────────────────────────────
  loginBtn: {
    height: 54,
    backgroundColor: C.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  btnArrow: {
    marginLeft: 8,
  },
  loginBtnDisabled: {
    backgroundColor: '#CBD5E1', // Slate 300 for disabled state
    shadowOpacity: 0,
    elevation: 0,
  },
  loginBtnText: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.md,
    color: C.white,
    letterSpacing: 0.3,
  },

  // ── Footer ───────────────────────────────────────────────
  footer: {
    alignItems: 'center',
  },
  divRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width - 48,
    marginBottom: 12,
  },
  divLineSpace: {
    flex: 1,
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  divText: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.xs,
    color: C.textMuted,
    letterSpacing: 0.3,
  },
  footerNote: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.xs,
    color: C.textMuted,
    letterSpacing: 0.2,
  },
});

export default LoginScreen;
