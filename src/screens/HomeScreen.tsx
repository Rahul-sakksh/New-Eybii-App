import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  Animated,
  Image,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import {
  LogOut,
  MapPin,
  X,
  Navigation as NavigationIcon,
  ShieldCheck,
  LayoutDashboard,
  ImageIcon,
} from 'lucide-react-native';
import moment from 'moment';
import ImageView from 'react-native-image-viewing';

import { RootStackParamList } from '../navigation/AppNavigator';
import StatusBarConfig from '../components/StatusBarConfig';
import Colors from '../theme/colors';
import {
  DayCycleCard,
  TrackingCard,
  DayCycleSkeleton,
  TrackingSkeleton,
  HorizontalCalendar,
} from '../components/DashboardComponents';

import { getData, STORAGE_KEYS, clearAll } from '../utils/storage';
import { Fonts, FontSizes } from '../theme/fonts';
import axiosClient from '../api/axiosClient';
import { ENDPOINTS, API_BASE_URL } from '../api/endpoints';
import DatePickerModal from '../components/common/DatePickerModal';
import { Snackbar } from 'react-native-snackbar';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
const { width, height } = Dimensions.get('window');

// --- Light Theme Colors ---
const C = {
  bg: Colors.background,
  white: Colors.white,
  primary: Colors.primary,
  primaryLight: Colors.primaryMuted,
  text: Colors.textPrimary,
  textSecondary: Colors.textSecondary,
  textMuted: Colors.textMuted,
  border: Colors.border,
  success: Colors.success,
  error: Colors.error,
  shadow: Colors.primaryDark,
  cardShadow: 'rgba(0, 0, 0, 0.08)',
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Tracking Data State
  const [dayStartData, setDayStartData] = useState<any>(null);
  const [dayEndData, setDayEndData] = useState<any>(null);
  const [trackingList, setTrackingList] = useState<any[]>([]);

  // Modal State
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [imageVisible, setImageVisible] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [snackMsg, setSnackMsg] = useState<string | null>(null);

  const translateY = useRef(new Animated.Value(100)).current; // start off-screen
  const opacity = useRef(new Animated.Value(0)).current;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const route = useRoute();

  console.log("route", route.params?.snackbarMsg);

  useFocusEffect(
    useCallback(() => {
      const msg = route.params?.snackbarMsg;

      if (msg) {
        setSnackMsg(msg);

        // 🚀 animate IN
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        // ⏳ auto hide after 2.5 sec
        setTimeout(() => {
          // 🚪 animate OUT
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 100,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setSnackMsg(null);
          });
        }, 2500);

        navigation.setParams({ snackbarMsg: undefined });
      }
    }, [route.params?.snackbarMsg])
  );


  useEffect(() => {
    loadUserData();
    fetchTrackingData(selectedDate);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [])



  const EXIT_TIMEOUT = 2000;


  const lastBackPress = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        const now = Date.now();

        if (lastBackPress.current && now - lastBackPress.current < EXIT_TIMEOUT) {
          BackHandler.exitApp();
          return true;
        }

        lastBackPress.current = now;

        ToastAndroid.show(
          'Press again to exit',
          ToastAndroid.SHORT
        );

        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBack
      );

      return () => subscription.remove();
    }, [])
  );





  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    fetchTrackingData(date);
  };

  const loadUserData = async () => {
    const [name] = await Promise.all([
      getData(STORAGE_KEYS.USER_NAME),
    ]);
    setUserName(name || 'User');
  };

  const fetchTrackingData = async (date: Date) => {
    setDayStartData(null);
    setDayEndData(null);
    setTrackingList([]);

    setLoading(true);
    try {
      const [userId, token, deviceId] = await Promise.all([
        getData(STORAGE_KEYS.USER_ID),
        getData(STORAGE_KEYS.TOKEN),
        getData(STORAGE_KEYS.DEVICE_ID),
      ]);

      const params = {
        user_id: userId,
        device_id: deviceId,
        token: token,
        date: moment(date).format('YYYY-MM-DD'),
      };

      const response = await axiosClient.get(ENDPOINTS.TRACKING_DATA, { params });
      const data = response.data?.data;

      if (data && Array.isArray(data)) {
        setDayStartData(null);
        setDayEndData(null);
        const list: any[] = [];

        data.forEach((item: any) => {
          if (item.outlet_type === 'day_start') {
            setDayStartData(item);
          } else if (item.outlet_type === 'day_end') {
            setDayEndData(item);
          } else {
            list.push(item);
          }
        });
        setTrackingList(list);
      } else {
        setDayStartData(null);
        setDayEndData(null);
        setTrackingList([]);
      }
    } catch (error) {
      if (!error?.response) {
        // Network error
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.',
          [
            {
              text: 'Retry',
              onPress: () => fetchTrackingData(selectedDate),
            },
            {
              text: 'Close App',
              onPress: () => { setSelectedDate(new Date(new Date().setDate(new Date().getDate() - 1))); BackHandler.exitApp(); },
              style: 'destructive',
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearAll();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const openLocationDetails = (item: any, isWorkCycle: boolean = false) => {
    setSelectedItem({ ...item, isWorkCycle });
    setLocationModalVisible(true);
  };

  const openImagePreview = (imageUrl: string) => {
    if (imageUrl) {
      // Assuming comma separated or single URL
      const urls = imageUrl.split(',').map(url => ({ uri: url.startsWith('http') ? url : 'https://www.eybii.com/uploads/sales_location/' + url }));
      setImages(urls);
      setImageVisible(true);
    }
  };

  const isToday = moment(selectedDate).isSame(new Date(), 'day');
  const canPerformAction = isToday && !dayEndData;

  const onDateChange = (date: Date) => {
    setShowDatePicker(false);
    handleDateChange(date);
  };

  const resolveImage = (url: string | null) => {
    if (!url) return null;
    return 'https://www.eybii.com/uploads/sales_location/' + url.trim();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Welcome 👋</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={16} color={C.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <HorizontalCalendar
        selectedDate={selectedDate}
        onDateSelect={handleDateChange}
        onOpenFullPicker={() => setShowDatePicker(true)}
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LayoutDashboard size={48} color={C.textMuted} strokeWidth={1} />
      <Text style={styles.emptyText}>No check-in data for this date</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBarConfig />

      {renderHeader()}

      <View style={styles.content}>
        {/* Fixed Section: Work Cycle */}
        <View style={styles.fixedContent}>
          <Text style={[styles.sectionTitleFixed, { marginBottom: 12 }]}>
            Work Cycle <Text style={{ fontSize: 12, fontFamily: Fonts.medium, color: C.textMuted }}>({moment(selectedDate).format('dddd, DD MMM YYYY')})</Text>
          </Text>
          {loading ? (
            <DayCycleSkeleton />
          ) : (
            <DayCycleCard
              dayStartEnable={!!dayStartData}
              dayEndEnable={!!dayEndData}
              daystartTime={dayStartData?.date_time}
              dayendTime={dayEndData?.date_time}
              dayStartImage={resolveImage(dayStartData?.location_image)}
              dayEndImage={resolveImage(dayEndData?.location_image)}
              isCurrentDate={isToday}
              onPressStart={() => navigation.navigate('Day', { outletType: 'day_start' })}
              onPressEnd={() => navigation.navigate('Day', { outletType: 'day_end' })}
              onPressViewStart={() => openLocationDetails(dayStartData, true)}
              onPressViewEnd={() => openLocationDetails(dayEndData, true)}
              onImagePreview={openImagePreview}
            />
          )}

          <View style={styles.historyHeaderRow}>
            <Text style={styles.sectionTitleFixed}>Check-in History</Text>
            {dayStartData && !dayEndData && isToday && (
              <TouchableOpacity
                style={styles.checkInBtn}
                onPress={() => navigation.navigate('CheckIn')}>
                <Text style={styles.checkInBtnText}>New Check-In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Scrollable Section: History */}
        {loading ? (
          <View style={styles.skeletonList}>
            <TrackingSkeleton />
            <TrackingSkeleton />
            <TrackingSkeleton />
          </View>
        ) : (
          <FlatList
            data={trackingList}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            contentContainerStyle={styles.scrollListContent}
            renderItem={({ item }) => (
              <TrackingCard
                item={item}
                onPress={() => openLocationDetails(item, false)}
                onImagePress={() => openImagePreview(item.location_image)}
              />
            )}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Location Details Modal */}
      <Modal
        visible={locationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLocationModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Location Details</Text>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                <X size={20} color={C.textMuted} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {selectedItem?.isWorkCycle && selectedItem?.location_image && (
                <TouchableOpacity
                  onPress={() => openImagePreview(resolveImage(selectedItem.location_image))}
                  style={styles.modalImageContainer}
                >
                  <Image
                    source={{ uri: resolveImage(selectedItem.location_image) }}
                    style={styles.modalSelfie}
                  />
                  <View style={styles.photoOverlay}>
                    <ImageIcon size={11} color={C.white} strokeWidth={1.5} />
                    <Text style={styles.photoOverlayText}>View Full Photo</Text>
                  </View>
                </TouchableOpacity>
              )}

              <View style={styles.locationItem}>
                <View style={[styles.locIcon, { backgroundColor: C.primaryLight }]}>
                  <NavigationIcon size={14} color={C.primary} strokeWidth={1.5} />
                </View>
                <View style={styles.locInfo}>
                  <Text style={styles.locLabel}>System GPS Address</Text>
                  <Text style={styles.locValue}>{selectedItem?.map_address || 'Not recorded'}</Text>
                </View>
              </View>

              <View style={[styles.locationItem, { marginTop: 20 }]}>
                <View style={[styles.locIcon, { backgroundColor: C.primaryLight }]}>
                  <MapPin size={14} color={C.primary} strokeWidth={1.5} />
                </View>
                <View style={styles.locInfo}>
                  <Text style={styles.locLabel}>User Entered Address</Text>
                  <Text style={styles.locValue}>{selectedItem?.user_modified_address || 'Same as system'}</Text>
                </View>
              </View>

              {/* {selectedItem?.notes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>Visit Notes</Text>
                  <Text style={styles.notesText}>{selectedItem.notes}</Text>
                </View>
              )} */}
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setLocationModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Preview */}
      <ImageView
        images={images}
        imageIndex={0}
        visible={imageVisible}
        onRequestClose={() => setImageVisible(false)}
      />

      {/* Themed Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={onDateChange}
        initialDate={selectedDate}
      />

      {snackMsg && (
        <Animated.View
          style={[
            styles.snackbar,
            {
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <Text style={styles.snackbarText}>{snackMsg}</Text>
        </Animated.View>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    backgroundColor: Colors.background,
    paddingBottom: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    // borderBottomWidth: 1,
    // borderBottomColor: C.border,
    // borderLeftWidth: 1,
    // borderLeftColor: C.border,
    // borderRightWidth: 1,
    // borderRightColor: C.border,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // slightly less depth
    shadowOpacity: 0.06, // reduced from 0.1
    shadowRadius: 3,

    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    marginBottom: 8,
  },
  greeting: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.xs,
    color: C.textSecondary,
    marginBottom: 0,
  },
  headerDate: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: 12,
    color: C.primary,
    marginBottom: 4,
  },
  userName: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.xl,
    color: C.text,
    letterSpacing: 0,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  content: {
    flex: 1,
  },
  fixedContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: C.bg,
    zIndex: 5,
  },
  sectionTitleFixed: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  checkInBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  checkInBtnText: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 11,
    color: C.white,
  },
  scrollListContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 4
  },
  skeletonList: {
    paddingHorizontal: 24,
    gap: 16,
    paddingTop: 4
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 16,
  },
  emptyText: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: FontSizes.base,
    color: C.textMuted,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: C.bg,
    borderRadius: 32,
    padding: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.lg,
    color: C.text,
  },
  modalBody: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  modalSelfie: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    gap: 4,
  },
  photoOverlayText: {
    color: C.white,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 9,
  },
  locationItem: {
    flexDirection: 'row',
  },
  locIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locInfo: {
    flex: 1,
    marginLeft: 16,
  },
  locLabel: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 4,
  },
  locValue: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.sm,
    color: C.text,
    lineHeight: 20,
  },
  notesBox: {
    marginTop: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  notesLabel: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  notesText: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.sm,
    color: C.text,
    lineHeight: 20,
  },
  modalCloseBtn: {
    backgroundColor: C.primary,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.base,
    color: C.white,
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,

    backgroundColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 16,

    borderRadius: 12,

    // shadow iOS
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },

    // Android
    elevation: 5,
  },

  snackbarText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    textAlign: 'center',
  },
});

export default HomeScreen;
