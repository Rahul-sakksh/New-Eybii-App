import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Sun, Moon, ChevronLeft, Play, Square } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import AppButton from '../components/AppButton';
import Colors from '../theme/colors';
import { Fonts, FontSizes } from '../theme/fonts';
import { useBackHandler } from '../utils/backHandler';
import { apiPost } from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';

type Props = NativeStackScreenProps<RootStackParamList, 'Day'>;

type DayStatus = 'idle' | 'started' | 'ended';

const DayScreen: React.FC<Props> = ({ navigation }) => {
  const [dayStatus, setDayStatus] = useState<DayStatus>('idle');
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingEnd, setLoadingEnd] = useState(false);

  // Back — go back naturally
  useBackHandler(
    useCallback(() => {
      navigation.goBack();
      return true;
    }, [navigation]),
  );

  // Day Start API call
  const handleDayStart = async () => {
    setLoadingStart(true);
    try {
      await apiPost(ENDPOINTS.DAY_START, {
        timestamp: new Date().toISOString(),
      });
      setDayStatus('started');
      Alert.alert('Day Started', 'Your workday has started. Have a great day!');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Could not start the day. Try again.');
    } finally {
      setLoadingStart(false);
    }
  };

  // Day End API call
  const handleDayEnd = async () => {
    Alert.alert(
      'End Day',
      'Are you sure you want to end your workday?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Day',
          style: 'destructive',
          onPress: async () => {
            setLoadingEnd(true);
            try {
              await apiPost(ENDPOINTS.DAY_END, {
                timestamp: new Date().toISOString(),
              });
              setDayStatus('ended');
              Alert.alert('Day Ended', 'Your workday has ended. Great work!');
            } catch (error: any) {
              Alert.alert('Error', error?.response?.data?.message || 'Could not end the day. Try again.');
            } finally {
              setLoadingEnd(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const statusColor =
    dayStatus === 'started'
      ? Colors.success
      : dayStatus === 'ended'
        ? Colors.error
        : Colors.textMuted;

  const statusLabel =
    dayStatus === 'started'
      ? 'Day in Progress'
      : dayStatus === 'ended'
        ? 'Day Ended'
        : 'Not Started';

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Day Start / End</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Status indicator */}
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>

        {/* Icon */}
        <View style={styles.iconWrapper}>
          {dayStatus === 'ended' ? (
            <Moon size={52} color={Colors.primary} />
          ) : (
            <Sun size={52} color={Colors.primary} />
          )}
        </View>

        <Text style={styles.title}>Day Start / End</Text>
        <Text style={styles.subtitle}>
          Mark the start or end of your workday.{'\n'}
          Design coming soon.
        </Text>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <AppButton
            title="Start Day"
            onPress={handleDayStart}
            loading={loadingStart}
            disabled={dayStatus !== 'idle'}
            style={styles.startBtn}
          />
          <AppButton
            title="End Day"
            onPress={handleDayEnd}
            loading={loadingEnd}
            disabled={dayStatus !== 'started'}
            variant="outline"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 32,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: FontSizes.sm,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.base,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  startBtn: {
    width: '100%',
  },
});

export default DayScreen;
