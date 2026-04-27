import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Fonts } from '../../theme/fonts';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string, base64?: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  onClose,
  onCapture,
}) => {
  const commonOptions = {
    mediaType: 'photo' as const,
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.8,
    includeBase64: true,
  };

  const handleLaunchCamera = async () => {
    const result = await launchCamera({
      ...commonOptions,
      cameraType: 'front',
      saveToPhotos: true,
    });

    if (result.assets && result.assets[0].uri) {
      onCapture(result.assets[0].uri, result.assets[0].base64);
      onClose();
    }
  };

  const handleLaunchLibrary = async () => {
    const result = await launchImageLibrary(commonOptions);

    if (result.assets && result.assets[0].uri) {
      onCapture(result.assets[0].uri, result.assets[0].base64);
      onClose();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Update Photo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            <TouchableOpacity style={styles.option} onPress={handleLaunchCamera}>
              <View style={[styles.iconBox, { backgroundColor: '#FCE4F3' }]}>
                <Camera size={24} color="#E91E8C" />
              </View>
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleLaunchLibrary}>
              <View style={[styles.iconBox, { backgroundColor: '#F0F9FF' }]}>
                <ImageIcon size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.optionText}>Choose from Gallery</Text>
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: '#1A1A2E',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7F8FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  option: {
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: '#1A1A2E',
  },
});

export default CameraModal;
