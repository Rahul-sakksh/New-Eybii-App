import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Modal,
  FlatList,
  Pressable,
  Animated,
} from 'react-native';
import moment from 'moment';
import Colors from '../theme/colors';
import { Fonts, FontSizes } from '../theme/fonts';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Navigation,
  Image as ImageIcon,
  MapPinned,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// --- Pulse/Skeleton Component ---
export const SkeletonPulse: React.FC<{ style?: any }> = ({ style }) => {
  const animatedValue = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [animatedValue]);

  return <Animated.View style={[style, { opacity: animatedValue, backgroundColor: Colors.divider }]} />;
};

export const DayCycleSkeleton = () => (
  <View style={styles.cycleCard}>
    <View style={styles.cycleRow}>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <SkeletonPulse style={{ width: 60, height: 12, borderRadius: 4, marginBottom: 8 }} />
        <SkeletonPulse style={{ width: 80, height: 20, borderRadius: 4 }} />
      </View>
      <View style={styles.cycleDivider} />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <SkeletonPulse style={{ width: 60, height: 12, borderRadius: 4, marginBottom: 8 }} />
        <SkeletonPulse style={{ width: 80, height: 20, borderRadius: 4 }} />
      </View>
    </View>
    <SkeletonPulse style={{ width: '60%', height: 16, borderRadius: 4, alignSelf: 'center', marginTop: 12 }} />
  </View>
);

export const TrackingSkeleton = () => (
  <View style={[styles.cycleCard, { marginBottom: 0 }]}>
    <View style={styles.trackingHeaderNew}>
      <View style={styles.trackingBadgeGroup}>
        <SkeletonPulse style={{ width: 70, height: 24, borderRadius: 6 }} />
        <SkeletonPulse style={{ width: 60, height: 24, borderRadius: 6 }} />
      </View>
      <View style={styles.trackingActionGroup}>
        <SkeletonPulse style={{ width: 32, height: 32, borderRadius: 8 }} />
        <SkeletonPulse style={{ width: 32, height: 32, borderRadius: 8 }} />
      </View>
    </View>
    <View style={styles.trackingInfoBody}>
      <SkeletonPulse style={{ width: '90%', height: 14, borderRadius: 4, marginBottom: 10 }} />
      <SkeletonPulse style={{ width: '80%', height: 14, borderRadius: 4, marginBottom: 10 }} />
      <SkeletonPulse style={{ width: '70%', height: 14, borderRadius: 4 }} />
    </View>
  </View>
);

// --- Custom Colors for Light Theme (Matching LoginScreen) ---
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

// --- Horizontal Calendar Component ---
export const HorizontalCalendar: React.FC<{
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onOpenFullPicker: () => void;
}> = ({ selectedDate, onDateSelect, onOpenFullPicker }) => {
  const scrollRef = React.useRef<ScrollView>(null);
  const dates = [];
  // Show last 14 days up to today (no future dates)
  for (let i = -14; i <= 0; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  React.useEffect(() => {
    // Find index of selected date
    const index = dates.findIndex(d => moment(d).isSame(selectedDate, 'day'));
    if (index !== -1 && scrollRef.current) {
      const itemWidth = 60;
      const gap = 12;
      const padding = 20;
      const screenWidth = Dimensions.get('window').width;

      // Calculate position to center the item
      const offset = (index * (itemWidth + gap)) + padding - (screenWidth / 2) + (itemWidth / 2);

      // Use setImmediate to ensure layout is ready if it's the initial load
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: Math.max(0, offset), animated: true });
      }, 100);
    }
  }, [selectedDate]);

  return (
    <View style={styles.calendarContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarScroll}>
        {dates.map((date, index) => {
          const isSelected = moment(date).isSame(selectedDate, 'day');
          const isToday = moment(date).isSame(new Date(), 'day');

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onDateSelect(date)}
              style={[
                styles.dateCard,
                isSelected && styles.dateCardSelected,
              ]}>
              <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
                {moment(date).format('ddd')}
              </Text>
              <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>
                {moment(date).format('D')}
              </Text>
              {isToday && !isSelected && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity onPress={onOpenFullPicker} style={styles.fullPickerBtn}>
          <Calendar size={16} color={C.primary} strokeWidth={1.5} />
          <Text style={styles.fullPickerText}>More</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// --- Day Cycle Card Component (Unified) ---
export const DayCycleCard: React.FC<{
  dayStartEnable: boolean;
  dayEndEnable: boolean;
  daystartTime: string | null;
  dayendTime: string | null;
  dayStartImage: string | null;
  dayEndImage: string | null;
  isCurrentDate: boolean;
  onPressStart: () => void;
  onPressEnd: () => void;
  onPressViewStart: () => void;
  onPressViewEnd: () => void;
  onImagePreview: (uri: string) => void;
}> = ({
  dayStartEnable,
  dayEndEnable,
  daystartTime,
  dayendTime,
  dayStartImage,
  dayEndImage,
  isCurrentDate,
  onPressStart,
  onPressEnd,
  onPressViewStart,
  onPressViewEnd,
  onImagePreview,
}) => {
    const [elapsed, setElapsed] = React.useState('00:00:00');

    React.useEffect(() => {
      let interval: any;
      if (dayStartEnable && !dayEndEnable && isCurrentDate) {
        interval = setInterval(() => {
          const diff = moment().diff(moment(daystartTime), 'seconds');
          setElapsed(formatTime(diff));
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [dayStartEnable, dayEndEnable, daystartTime, isCurrentDate]);

    const formatTime = (totalSec: number) => {
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      const pad = (v: number) => (v < 10 ? '0' + v : v);
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    };

    const calculateWorkingHours = () => {
      if (daystartTime && dayendTime) {
        const start = moment(daystartTime);
        const end = moment(dayendTime);
        if (end.isBefore(start)) return '0 sec';

        const diff = moment.duration(end.diff(start));
        const hours = Math.floor(diff.asHours());
        const mins = diff.minutes();
        const secs = diff.seconds();

        const parts = [];
        if (hours > 0) parts.push(`${hours} hr`);
        if (mins > 0) parts.push(`${mins} min`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs} sec`);

        return parts.join(' ');
      }
      return '0 sec';
    };

    // View-mode (history or today completed)
    if (!isCurrentDate || dayEndEnable) {
      return (
        <View style={styles.cycleCard}>
          <View style={styles.cycleRow}>
            <View style={styles.cycleSection}>
              <View style={styles.cycleLabelRow}>
                <Clock size={12} color={C.textMuted} strokeWidth={1.8} />
                <Text style={styles.cycleLabel}>Day Start</Text>
              </View>
              <Text style={styles.cycleValue}>
                {daystartTime ? moment(daystartTime).format('hh:mm:ss A') : '--:--'}
              </Text>
              {daystartTime && (
                <View style={styles.cycleFooter}>
                  <TouchableOpacity onPress={onPressViewStart} style={styles.cycleInfoBtn}>
                    <Clock size={12} color={C.primary} strokeWidth={1.8} />
                    <Text style={styles.cycleInfoText}>Details</Text>
                  </TouchableOpacity>
                  {/* {dayStartImage && (
                  <TouchableOpacity onPress={() => onImagePreview(dayStartImage)} style={styles.cycleThumbnailContainer}>
                    <Image source={{uri: dayStartImage}} style={styles.cycleThumbnail} />
                  </TouchableOpacity>
                )} */}
                </View>
              )}
            </View>

            <View style={styles.cycleDivider} />

            <View style={styles.cycleSection}>
              <View style={styles.cycleLabelRow}>
                <Clock size={12} color={C.textMuted} strokeWidth={1.8} />
                <Text style={styles.cycleLabel}>Day End</Text>
              </View>
              <Text style={styles.cycleValue}>
                {dayendTime ? moment(dayendTime).format('hh:mm:ss A') : '--:--'}
              </Text>
              {dayendTime && (
                <View style={styles.cycleFooter}>
                  <TouchableOpacity onPress={onPressViewEnd} style={styles.cycleInfoBtn}>
                    <Clock size={12} color={C.error} strokeWidth={1.8} />
                    <Text style={styles.cycleInfoText}>Details</Text>
                  </TouchableOpacity>
                  {/* {dayEndImage && (
                  <TouchableOpacity onPress={() => onImagePreview(dayEndImage)} style={styles.cycleThumbnailContainer}>
                    <Image source={{uri: dayEndImage}} style={styles.cycleThumbnail} />
                  </TouchableOpacity>
                )} */}
                </View>
              )}
            </View>
          </View>

          {(daystartTime && dayendTime) && (
            <View style={styles.workingHoursRow}>
              <CheckCircle2 size={14} color={C.success} strokeWidth={1.8} />
              <Text style={styles.workingHoursLabel}>Total Working Hours: </Text>
              <Text style={styles.workingHoursValue}>{calculateWorkingHours()}</Text>
            </View>
          )}
        </View>
      );
    }

    // Active or Not Started (Today only)
    return (
      <View style={styles.cycleCard}>
        {!dayStartEnable ? (
          <View style={{ display: 'flex', flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.cycleActionBtnLarge} onPress={onPressStart}>
              <Clock size={16} color={C.white} strokeWidth={2.5} />
              <Text style={styles.cycleActionTextLarge}>Day Start</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cycleActionBtnLarge, { backgroundColor: 'transparent', borderColor: C.primary, borderWidth: 1.3, shadowColor: 'transparent' }]} onPress={onPressEnd}>
              <Clock size={16} color={C.primary} strokeWidth={2.5} />
              <Text style={[styles.cycleActionTextLarge, { color: C.primary }]}>Day End</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activeCycleRow}>
            <View style={styles.activeInfo}>
              <Text style={styles.activeLabel}>Day Started at</Text>
              <Text style={styles.activeTime}>
                {moment(daystartTime).format('hh:mm:ss A')}
              </Text>
              <Text style={styles.activeTimer}>{elapsed}</Text>
            </View>
            <TouchableOpacity
              style={[styles.cycleActionBtn, { backgroundColor: C.primaryLight, borderWidth: 1, borderColor: C.primary, marginRight: 10, height: 30, width: 30, borderRadius: 10 }]}
              onPress={onPressViewStart}
            >
              <MapPin size={16} color={C.primary} strokeWidth={1.8} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cycleActionBtn, { backgroundColor: '#818CF8' }]} onPress={onPressEnd}>
              <Clock size={16} color={C.white} strokeWidth={1.8} />
              <Text style={styles.cycleActionText}>Day End</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

// --- Custom Date Picker (JS-only) ---
export const CustomDatePicker: React.FC<{
  isVisible: boolean;
  value: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}> = ({ isVisible, value, onClose, onSelect }) => {
  const [viewMode, setViewMode] = React.useState<'day' | 'month' | 'year'>('day');
  const [viewDate, setViewDate] = React.useState(moment(value));

  const daysInMonth = viewDate.daysInMonth();
  const startDay = viewDate.clone().startOf('month').day();

  const months = moment.months();
  const years = Array.from({ length: 10 }, (_, i) => moment().year() - i); // Last 10 years

  const renderDays = () => {
    const days = [];
    // Padding for start of month
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`pad-${i}`} style={styles.pickerDayBox} />);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = viewDate.date() === i && viewDate.isSame(value, 'month');
      const isToday = moment().isSame(viewDate.clone().date(i), 'day');

      days.push(
        <TouchableOpacity
          key={i}
          onPress={() => onSelect(viewDate.clone().date(i).toDate())}
          style={[styles.pickerDayBox, isSelected && styles.pickerDaySelected]}>
          <Text style={[styles.pickerDayText, isSelected && styles.pickerSelectedText, isToday && !isSelected && styles.pickerTodayText]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContent}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setViewMode('month')}>
              <Text style={styles.pickerHeaderMain}>{viewDate.format('MMMM')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode('year')}>
              <Text style={styles.pickerHeaderSub}>{viewDate.format('YYYY')}</Text>
            </TouchableOpacity>
          </View>

          {viewMode === 'day' && (
            <View style={styles.pickerBody}>
              <View style={styles.pickerWeekDays}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <Text key={d} style={styles.pickerWeekDayText}>{d}</Text>
                ))}
              </View>
              <View style={styles.pickerDayGrid}>{renderDays()}</View>
            </View>
          )}

          {viewMode === 'month' && (
            <FlatList
              data={months}
              numColumns={3}
              keyExtractor={item => item}
              contentContainerStyle={styles.pickerList}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => { setViewDate(viewDate.clone().month(index)); setViewMode('day'); }}
                  style={[styles.pickerListItem, viewDate.month() === index && styles.pickerItemSelected]}>
                  <Text style={[styles.pickerListText, viewDate.month() === index && styles.pickerSelectedText]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {viewMode === 'year' && (
            <FlatList
              data={years}
              numColumns={3}
              keyExtractor={item => item.toString()}
              contentContainerStyle={styles.pickerList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setViewDate(viewDate.clone().year(item)); setViewMode('day'); }}
                  style={[styles.pickerListItem, viewDate.year() === item && styles.pickerItemSelected]}>
                  <Text style={[styles.pickerListText, viewDate.year() === item && styles.pickerSelectedText]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <View style={styles.pickerFooter}>
            <TouchableOpacity onPress={onClose} style={styles.pickerCancelBtn}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- Tracking Item Card Component ---
export const TrackingCard: React.FC<{
  item: any;
  onPress: () => void;
  onImagePress: () => void;
}> = ({ item, onPress, onImagePress }) => {
  return (
    <View style={styles.trackingCardNew}>
      <View style={styles.trackingHeaderNew}>
        <View style={styles.trackingBadgeGroup}>
          <View style={styles.timeBadgeNew}>
            <Text style={styles.timeTextNew}>{moment(item.date_time).format('h:mm A')}</Text>
          </View>
          <View style={styles.kmBadgeNew}>
            <Text style={styles.kmTextNew}>{item.kms_covered} Km</Text>
          </View>
        </View>

        <View style={styles.trackingActionGroup}>
          <TouchableOpacity onPress={onPress} style={styles.iconActionBtn}>
            <MapPinned size={16} color={C.primary} strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onImagePress} style={styles.iconActionBtn}>
            <ImageIcon size={16} color={C.primary} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.trackingInfoBody}>
        <Text style={styles.infoRow}><Text style={styles.infoLabel}>Name : </Text>{item.outlet_name}</Text>
        <Text style={styles.infoRow}><Text style={styles.infoLabel}>Outlet Details : </Text>{item.outlet_type_name}</Text>
        <Text style={styles.infoRow}>
          <Text style={styles.infoLabel}>Contact : </Text>
          {item.contact_person_name ? `${item.contact_person_name} / ` : ''}{item.contact_person_number}
        </Text>

        {item.notes && (
          <View style={styles.notesBoxNew}>
            <Text style={styles.notesTextNew}>
              <Text style={styles.infoLabel}>Notes : </Text>
              {item.notes}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Calendar
  calendarContainer: {
    paddingVertical: 10,
  },
  calendarScroll: {
    paddingHorizontal: 20,
    paddingVertical: 3,
    gap: 12,
  },
  dateCard: {
    width: 60,
    height: 80,
    backgroundColor: C.bg,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  dateCardSelected: {
    backgroundColor: C.primary,
    shadowColor: C.shadow,
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  dateDay: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: FontSizes.xs,
    color: C.textMuted,
    marginBottom: 4,
  },
  dateNumber: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.md,
    color: C.text,
  },
  dateTextSelected: {
    color: C.white,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.primary,
    position: 'absolute',
    bottom: 8,
  },
  fullPickerBtn: {
    width: 80,
    height: 80,
    backgroundColor: C.bg,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderStyle: 'dashed',
    marginLeft: 4,
  },
  fullPickerText: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 10,
    color: C.primary,
    marginTop: 4,
  },

  // Cycle Card (Unified)
  cycleCard: {
    backgroundColor: C.bg,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,   // was 0.08 → slightly stronger
    shadowRadius: 14,
    elevation: 2,
  },
  cycleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cycleSection: {
    flex: 1,
    alignItems: 'center',
  },
  cycleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cycleLabel: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: FontSizes.xs,
    color: C.textMuted,
  },
  cycleValue: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.base,
    color: C.text,
    marginBottom: 4,
  },
  cycleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cycleInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.bg,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cycleInfoText: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 10,
    color: C.textSecondary,
    textTransform: 'uppercase',
  },
  cycleThumbnailContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  cycleThumbnail: {
    width: '100%',
    height: '100%',
  },
  cycleDivider: {
    width: 1,
    height: '80%',
    backgroundColor: C.border,
    alignSelf: 'center',
  },

  // Custom Picker Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: C.bg,
    borderRadius: 32,
    padding: 24,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 24,
  },
  pickerHeaderMain: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 28,
    color: C.text,
  },
  pickerHeaderSub: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: 20,
    color: C.textMuted,
  },
  pickerBody: {
    width: '100%',
  },
  pickerWeekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pickerWeekDayText: {
    width: width / 7 - 12,
    textAlign: 'center',
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 12,
    color: C.textMuted,
  },
  pickerDayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  pickerDayBox: {
    width: (340 - 48) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  pickerDayText: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: 14,
    color: C.text,
  },
  pickerDaySelected: {
    backgroundColor: C.primary,
  },
  pickerTodayText: {
    color: C.primary,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
  },
  pickerSelectedText: {
    color: C.white,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
  },
  pickerList: {
    paddingBottom: 10,
  },
  pickerListItem: {
    flex: 1,
    height: 50,
    margin: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
  },
  pickerItemSelected: {
    backgroundColor: C.primary,
  },
  pickerListText: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: 14,
    color: C.text,
  },
  pickerFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  pickerCancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pickerCancelText: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 14,
    color: C.textMuted,
  },

  workingHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 8,
  },
  workingHoursLabel: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: FontSizes.sm,
    color: C.textMuted,
  },
  workingHoursValue: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.base,
    color: C.success,
  },
  cycleActionBtnLarge: {
    backgroundColor: C.primary,
    height: 45,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    shadowColor: C.shadow,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 4,
    flex: 1
  },
  cycleActionTextLarge: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.sm,
    color: C.white,
  },
  activeCycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeInfo: {
    flex: 1,
  },
  activeLabel: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: FontSizes.xs,
    color: C.textMuted,
    marginBottom: 2,
  },
  activeTime: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.lg,
    color: C.text,
  },
  activeTimer: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.sm,
    color: C.primary,
    marginTop: 4,
  },
  cycleActionBtn: {
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#cbceedff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  cycleActionText: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.sm,
    color: C.white,
  },

  // Tracking Card
  trackingCard: {
    backgroundColor: C.bg,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeText: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.xs,
    color: C.primary,
  },
  kmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kmText: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: FontSizes.xs,
    color: C.textSecondary,
  },
  trackingBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingLineContainer: {
    alignItems: 'center',
    marginRight: 14,
    width: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    width: 2,
    height: 40,
    backgroundColor: '#F0F0F6',
    marginTop: 4,
  },
  trackingContent: {
    flex: 1,
  },
  outletName: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: FontSizes.base,
    color: C.text,
    marginBottom: 2,
  },
  outletType: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: FontSizes.xs,
    color: C.textMuted,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: FontSizes.xs,
    color: C.textSecondary,
    flex: 1,
  },
  imageAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Redesigned Tracking Card
  trackingCardNew: {
    backgroundColor: C.bg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trackingHeaderNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  trackingBadgeGroup: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  timeBadgeNew: {
    backgroundColor: C.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeTextNew: {
    color: C.white,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 12,
  },
  kmBadgeNew: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.primary,
  },
  kmTextNew: {
    color: C.primary,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 12,
  },
  trackingActionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingInfoBody: {
    gap: 6,
  },
  infoRow: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    color: C.text,
  },
  infoLabel: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: C.text,
  },
  notesBoxNew: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 10,
    backgroundColor: C.bg,
  },
  notesTextNew: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    color: '#4E4F4F',
    lineHeight: 18,
  },
});
