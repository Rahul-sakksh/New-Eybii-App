import {StyleSheet, Dimensions} from 'react-native';
import Colors from './colors';
import {Fonts, FontSizes} from './fonts';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export {SCREEN_WIDTH, SCREEN_HEIGHT};

const CommonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Cards
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Typography
  headingXL: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headingLG: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
  },
  headingMD: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
  },
  bodyLG: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  bodyMD: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  bodySM: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 16,
  },

  // Shadow
  shadow: {
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default CommonStyles;
