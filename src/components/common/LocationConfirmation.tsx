import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react-native';
import { Fonts } from '../../theme/fonts';
import Colors from '../../theme/colors';

const { width } = Dimensions.get('window');

interface LocationConfirmationProps {
  visible: boolean;
  currentAddress: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const LocationConfirmation: React.FC<LocationConfirmationProps> = ({
  visible,
  currentAddress,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.indicator} />
          
          <View style={styles.iconContainer}>
            <MapPin size={32} color="#E91E8C" />
          </View>
          
          <Text style={styles.title}>Confirm Location</Text>
          <Text style={styles.subtitle}>
            Please verify if the detected address matches your current location.
          </Text>

          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Navigation size={16} color="#6B7280" />
              <Text style={styles.addressLabel}>DETECTED ADDRESS</Text>
            </View>
            <Text style={styles.addressText}>{currentAddress || 'Locating...'}</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={onConfirm}
            >
              <CheckCircle2 size={18} color="#FFFFFF" />
              <Text style={styles.confirmButtonText}>Confirm & Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 0,
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: 2,
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  addressCard: {
    backgroundColor: Colors.backgroundInput,
    borderRadius: 20,
    padding: 16,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.textMuted,
  },
  confirmButton: {
    flex: 2,
    height: 56,
    backgroundColor: '#E91E8C',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: '#FFFFFF',
  },
});

export default LocationConfirmation;
