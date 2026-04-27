import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ChevronLeft, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Fonts } from '../../theme/fonts';
import Colors from '../../theme/colors';

interface NavigationBarProps {
  title?: string;
  hideBack?: boolean;
  hideCalendar?: boolean;
  onBack?: () => void;
  onCalendar?: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  title,
  hideBack = false,
  hideCalendar = false,
  onBack,
  onCalendar,
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {!hideBack ? (
        <TouchableOpacity style={styles.actionBtn} onPress={handleBack}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}
      </View>

      {!hideCalendar ? (
        <TouchableOpacity style={styles.actionBtn} onPress={onCalendar}>
          <Calendar size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: Colors.background, // Match screen background
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider, // Use subtle divider for separation
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
});

export default NavigationBar;
