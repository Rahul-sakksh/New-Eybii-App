import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Fonts } from '../../theme/fonts';
import Colors from '../../theme/colors';

interface LoaderModalProps {
  visible: boolean;
  text?: string;
  color?: string;
  backgroundColor?: string;
}

const LoaderModal: React.FC<LoaderModalProps> = ({
  visible,
  text = "Please wait...",
  color = Colors.primary,
  backgroundColor = 'rgba(0, 0, 0, 0.5)',
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.overlay, { backgroundColor }]}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={color} />
          {text && <Text style={styles.text}>{text}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  text: {
    marginTop: 20,
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    textAlign: 'center',
  },
});

export default LoaderModal;
