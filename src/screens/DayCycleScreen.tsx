import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  InteractionManager,
} from 'react-native';
import { Snackbar } from 'react-native-snackbar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  MapPin,
  Camera as CameraIcon,
  ChevronRight,
  Navigation as NavigationIcon,
  X,
} from 'lucide-react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Geolocation from 'react-native-geolocation-service';
import moment from 'moment';
import ImageView from 'react-native-image-viewing';
import { launchCamera } from 'react-native-image-picker';

import ImageResizer from 'react-native-image-resizer';
import ImgToBase64 from 'react-native-image-base64';

import { RootStackParamList } from '../navigation/AppNavigator';
import NavigationBar from '../components/common/NavigationBar';
import LoaderModal from '../components/common/LoaderModal';
import LocationConfirmation from '../components/common/LocationConfirmation';
import ScreenTimeoutManager from '../components/common/ScreenTimeoutManager';
import { getData, STORAGE_KEYS } from '../utils/storage';
import axiosClient from '../api/axiosClient';
import Colors from '../theme/colors';
import { Fonts } from '../theme/fonts';
import StatusBarConfig from '../components/StatusBarConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Day'>;

const DayCycleScreen: React.FC<Props> = ({ navigation, route }) => {
  const { outletType } = route.params;
  const isStart = outletType === 'day_start';

  // Form State
  const [locationText, setLocationText] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [isEdit, setIsEdit] = useState(false);

  // Image State
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageVisible, setImageVisible] = useState(false);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [locaLoading, setLocaLoading] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentAddress, setCurrentAddress] = useState('');

  useEffect(() => {
    fetchStates();
    getLocation();
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState);
    }
  }, [selectedState]);

  const fetchStates = async () => {
    try {
      const response = await axiosClient.get('/state_master.php');
      if (response.data?.data) {
        setStates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchCities = async (stateCode: string) => {
    try {
      const userId = await getData(STORAGE_KEYS.USER_ID);
      const token = await getData(STORAGE_KEYS.TOKEN);
      const deviceId = await getData(STORAGE_KEYS.DEVICE_ID);
      const response = await axiosClient.get('/state_city_list.php', {
        params: { user_id: userId, token, device_id: deviceId, state_code: stateCode }
      });
      if (response.data?.data) {
        setCities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const hasLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const getLocation = async () => {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    setLocaLoading(true);
    Geolocation.getCurrentPosition(
      position => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(coords);
        getAddress(coords);
      },
      error => {
        setLocaLoading(false);
        Alert.alert('Location Error', `Code ${error.code}: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  };

  const getAddress = async (coords: { latitude: number; longitude: number }) => {
    try {
      const res = await axiosClient.get('/geocode-reverse.php', {
        params: {
          company_id: 1,
          api_key: '24916435facdadd10ec8bc2080cebf52',
          lat: coords.latitude,
          long: coords.longitude,
        }
      });

      if (res.data?.results?.[0]) {
        const addr = res.data.results[0].formatted_address;
        setLocationText(addr);
        setCurrentAddress(addr);
        if (!isEdit) setAddress(addr);
      }
    } catch (error) {
      console.error('Geocoding failure:', error);
    } finally {
      setLocaLoading(false);
    }
  };

  const convertToBase64 = async (imagePath: string) => {
    if (!imagePath) return null;
    try {
      const resizedImage = await ImageResizer.createResizedImage(
        imagePath, 1000, 1000, 'JPEG', 90, 0, null, false, { mode: 'contain', onlyScaleDown: false }
      );
      return await ImgToBase64.getBase64String(resizedImage.uri);
    } catch (err) {
      try {
        const fallbackPath = imagePath.startsWith('file://') ? imagePath : `file://${imagePath}`;
        return await ImgToBase64.getBase64String(fallbackPath);
      } catch (fallbackErr) {
        return null;
      }
    }
  };

  const openCamera = async () => {
    const options = {
      mediaType: 'photo' as const,
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      cameraType: 'front' as const,
      saveToPhotos: true,
    };

    launchCamera(options, async (response) => {
      if (response.assets?.[0]?.uri) {
        const b64 = await convertToBase64(response.assets[0].uri);
        if (b64) {
          setUploadImage(response.assets[0].uri);
          setImageBase64(b64);
        }
      }
    });
  };

  const validateAndSubmit = () => {
    if (!imageBase64) {
      Alert.alert('Required', 'Selfie is mandatory.');
      return;
    }
    if (!location) {
      Alert.alert('Error', 'Location data is missing.');
      return;
    }
    handlePunchSubmit();
  };

  const handlePunchSubmit = async () => {
    setIsLoading(true);

    try {
      const userId = await getData(STORAGE_KEYS.USER_ID);
      const deviceId = await getData(STORAGE_KEYS.DEVICE_ID);
      const token = await getData(STORAGE_KEYS.TOKEN);

      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('device_id', deviceId);
      formData.append('token', token);
      formData.append('map_address', locationText || currentAddress);
      formData.append('user_modified_address', address);
      formData.append('city', selectedCity);
      formData.append('state', selectedState);
      formData.append('pincode', pincode);
      formData.append('lat', String(location?.latitude));
      formData.append('longi', String(location?.longitude));
      formData.append('location_image', imageBase64);
      formData.append('outlet_type', isStart ? 'day_start' : 'day_end');

      const response = await axiosClient.post('/sales_man_tracking.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        const msg = isStart ? 'Day started successfully!' : 'Day ended successfully!';

        navigation.replace('Home', { snackbarMsg: msg } as any);
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to submit tracking data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarConfig />
      <NavigationBar
        title={isStart ? "Start Your Day" : "End Your Day"}
        hideCalendar
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <ScreenTimeoutManager onTimeout={() => navigation.goBack()} />

          {/* Selfie Section */}
          <View style={styles.selfieWrapper}>
            <View style={styles.sectionHeaderCentered}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primaryMuted }]}>
                <CameraIcon size={16} color={Colors.primary} />
              </View>
              <Text style={styles.labelCentered}>Selfie Mandatory</Text>
            </View>

            {uploadImage ? (
              <View>
                <View style={styles.circularPreviewContainer}>
                  <TouchableOpacity onPress={() => setImageVisible(true)}>
                    <Image source={{ uri: uploadImage }} style={styles.circularPreviewImage} />
                  </TouchableOpacity>

                </View>
                <TouchableOpacity
                  style={styles.circularRemovePhoto}
                  onPress={() => { setUploadImage(null); setImageBase64(null); }}
                >
                  <X size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>

            ) : (
              <TouchableOpacity style={styles.circularCameraBtn} onPress={openCamera}>
                <CameraIcon size={24} color={Colors.textMuted} />
                <Text style={styles.circularCameraBtnText}>Take Selfie</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Work Details Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primaryMuted }]}>
                <MapPin size={18} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Work Location</Text>
              <TouchableOpacity style={styles.refreshBtn} onPress={getLocation} disabled={locaLoading}>
                <NavigationIcon size={16} color={locaLoading ? Colors.textMuted : Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.addressBox}>
              <Text style={styles.addressText}>
                {locationText || 'Fetching address...'}
              </Text>
              {location && (
                <View style={styles.coordsRow}>
                  <Text style={styles.coordsText}>LAT: {location.latitude.toFixed(6)}</Text>
                  <Text style={styles.coordsText}>LONG: {location.longitude.toFixed(6)}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.editToggle} onPress={() => setIsEdit(!isEdit)}>
              <Text style={styles.editToggleText}>
                {isEdit ? "Hide Manual Edit" : "Edit Address Manually"}
              </Text>
              <ChevronRight size={14} color={Colors.primary} />
            </TouchableOpacity>

            {isEdit && (
              <TextInput
                style={styles.manualInput}
                multiline
                placeholder="Type manual address here..."
                placeholderTextColor={Colors.textPlaceholder}
                value={address}
                onChangeText={setAddress}
              />
            )}

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>State</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholder}
                  selectedTextStyle={styles.selectedText}
                  containerStyle={styles.dropdownContainer}
                  itemTextStyle={styles.dropdownItemText}
                  activeColor={Colors.backgroundSecondary}
                  search
                  searchPlaceholder="Search state..."
                  inputSearchStyle={styles.inputSearchStyle}
                  data={states}
                  labelField="state_name"
                  valueField="state_code"
                  placeholder="Select State"
                  value={selectedState}
                  onChange={item => setSelectedState(item.state_code)}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={{ flex: 1.5, marginRight: 10 }}>
                <Text style={styles.inputLabel}>City</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholder}
                  selectedTextStyle={styles.selectedText}
                  containerStyle={styles.dropdownContainer}
                  itemTextStyle={styles.dropdownItemText}
                  activeColor={Colors.backgroundSecondary}
                  search
                  searchPlaceholder="Search city..."
                  inputSearchStyle={styles.inputSearchStyle}
                  data={cities}
                  labelField="city"
                  valueField="city"
                  placeholder="Select City"
                  value={selectedCity}
                  onChange={item => setSelectedCity(item.city)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Pincode</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="000000"
                  placeholderTextColor={Colors.textPlaceholder}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={pincode}
                  onChangeText={setPincode}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: isStart ? Colors.primary : '#818CF8' }]}
            onPress={validateAndSubmit}
          >
            <Text style={styles.submitBtnText}>
              {isStart ? "Punch In / Day Start" : "Punch Out / Day End"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoaderModal visible={isLoading} text="Processing..." />
      <LoaderModal visible={locaLoading} text="Detecting Location..." />

      {uploadImage && (
        <ImageView
          images={[{ uri: uploadImage }]}
          imageIndex={0}
          visible={imageVisible}
          onRequestClose={() => setImageVisible(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  selfieWrapper: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 6
  },
  sectionHeaderCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  labelCentered: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.textPrimary,
  },
  refreshBtn: {
    padding: 8,
  },
  addressBox: {
    backgroundColor: Colors.backgroundInput,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  addressText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 8,
  },
  coordsText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.textMuted,
  },
  editToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginBottom: 8,
  },
  editToggleText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.primary,
  },
  manualInput: {
    backgroundColor: Colors.backgroundInput,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    fontSize: 14,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  dropdown: {
    height: 48,
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInput: {
    height: 48,
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    color: Colors.textPrimary,
  },
  placeholder: {
    fontSize: 14,
    color: Colors.textPlaceholder,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
  },
  selectedText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
  },
  circularCameraBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  circularCameraBtnText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.textMuted,
  },
  circularPreviewContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  circularPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  circularRemovePhoto: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  dropdownContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    color: Colors.textPrimary,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    borderRadius: 8,
    backgroundColor: Colors.backgroundInput,
    color: Colors.textPrimary,
  },
  submitBtn: {
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    color: Colors.white,
  },
});

export default DayCycleScreen;
