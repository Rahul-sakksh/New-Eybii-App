import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Text,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Colors from '../../theme/colors';
import { Fonts, FontSizes } from '../../theme/fonts';

// SvgIcon Component
const SvgIcon = ({ name, width = 24, height = 24, strokeColor = Colors.textMuted, fillColor = 'none' }) => {
  const icons = {
    close: (
      <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
        <Path
          d="M18 6L6 18M6 6l12 12"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    chevronLeft: (
      <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
        <Path
          d="M15 18l-6-6 6-6"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    chevronRight: (
      <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
        <Path
          d="M9 18l6-6-6-6"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    calendar: (
      <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
        <Path
          d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  };

  return icons[name] || null;
};

interface DatePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (date: Date) => void;
    initialDate?: Date;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialDate = new Date(),
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(initialDate);
      setCurrentMonth(initialDate.getMonth());
      setCurrentYear(initialDate.getFullYear());
    }
  }, [isOpen, initialDate]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth, currentYear);
    const firstDay = firstDayOfMonth(currentMonth, currentYear);

    // Filter logic: only allow dates up to today
    const now = new Date();
    
    // First day of current month offset
    for (let i = 0; i < firstDay; i++) {
        days.push({ day: null, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dateCheck = new Date(currentYear, currentMonth, i);
      const isToday = new Date();
      isToday.setHours(23, 59, 59, 999);
      const isFuture = dateCheck > isToday;
      days.push({ day: i, isCurrentMonth: true, isDisabled: isFuture });
    }

    return days;
  };

  const handleDateClick = (dayObj) => {
    if (!dayObj.isCurrentMonth || dayObj.isDisabled) return;

    const newDate = new Date(currentYear, currentMonth, dayObj.day);
    setSelectedDate(newDate);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const now = new Date();
    if (currentYear >= now.getFullYear() && currentMonth >= now.getMonth()) return;

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onClose();
  };

  const renderDatePicker = () => {
    const calendarDays = generateCalendarDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <View>
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <SvgIcon name="chevronLeft" width={20} height={20} strokeColor={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.monthYearText}>
            {months[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <SvgIcon name="chevronRight" width={20} height={20} strokeColor={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Week days header */}
        <View style={styles.weekDaysContainer}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((dayObj, index) => {
            const isSelected =
              dayObj.isCurrentMonth &&
              selectedDate.getDate() === dayObj.day &&
              selectedDate.getMonth() === currentMonth &&
              selectedDate.getFullYear() === currentYear;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleDateClick(dayObj)}
                disabled={!dayObj.day || dayObj.isDisabled}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDayCell,
                  dayObj.isDisabled && styles.disabledDayCell,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    dayObj.isDisabled && styles.disabledDayText,
                  ]}
                >
                  {dayObj.day || ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <SvgIcon name="calendar" width={20} height={20} strokeColor={Colors.primary} />
                <Text style={styles.headerTitle}>Select Date</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <SvgIcon name="close" width={24} height={24} strokeColor={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {renderDatePicker()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.selectedText}>
              Selected: {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
            <View style={styles.footerButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DatePickerModal;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 5,
  },
  contentContainer: {
    padding: 20,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
  },
  monthYearText: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  weekDayText: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    fontSize: 12,
    color: Colors.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  selectedDayCell: {
    backgroundColor: Colors.primary,
  },
  disabledDayCell: {
    opacity: 0.1,
  },
  dayText: {
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  selectedDayText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
  },
  disabledDayText: {
    color: Colors.textMuted,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  selectedText: {
    fontFamily: Fonts.regular,
    includeFontPadding: false,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.textSecondary,
    fontSize: 15,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  confirmButtonText: {
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.white,
    fontSize: 15,
  },
});
