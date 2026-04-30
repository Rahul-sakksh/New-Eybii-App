import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  PermissionsAndroid,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  InteractionManager,
  ToastAndroid,
  ActivityIndicator,
  Animated,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  MapPin,
  Camera as CameraIcon,
  ChevronRight,
  X,
  User,
  Layout,
  FileText,
  Plus,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Geolocation from 'react-native-geolocation-service';
import moment from 'moment';
import ImageView from 'react-native-image-viewing';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import PhoneInput from 'react-native-phone-number-input';
import { Snackbar } from 'react-native-snackbar';
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

type Props = NativeStackScreenProps<RootStackParamList, 'CheckIn'>;

interface SelectionImage {
  uri: string;
  base64: string;
}

const CheckInScreen: React.FC<Props> = ({ navigation, route }) => {
  // Form State
  const [outletName, setOutletName] = useState('');
  const [outletType, setOutletType] = useState<string | null>(null);
  const [outletTypes, setOutletTypes] = useState<any[]>([]);

  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [leadType, setLeadType] = useState<string | null>(null);
  const [leadTypes, setLeadTypes] = useState<any[]>([]);
  const [visitType, setVisitType] = useState<string | null>(null);
  const [visitTypes, setVisitTypes] = useState<any[]>([]);

  const [meetingNotes, setMeetingNotes] = useState('');

  const [locationText, setLocationText] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [pincode, setPincode] = useState('');

  const [isEdit, setIsEdit] = useState(false);
  const [isChoiceModalVisible, setIsChoiceModalVisible] = useState(false);

  // Image State
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<SelectionImage[]>([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [locaLoading, setLocaLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentAddress, setCurrentAddress] = useState('');

  // Internet & Snackbar State
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [snackMsg, setSnackMsg] = useState<string | null>(null);
  const translateY = React.useRef(new Animated.Value(100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  const phoneInput = useRef<PhoneInput>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = isConnected === false;
      setIsConnected(state.isConnected);

      if (wasOffline && state.isConnected) {
        // Re-fetch data when internet returns
        fetchInitialData();
        getLocation();
      }
    });

    return () => unsubscribe();
  }, [isConnected]);

  useEffect(() => {
    fetchInitialData();
    getLocation();
  }, []);

  const showSnackbar = (msg: string) => {
    setSnackMsg(msg);
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 100, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setSnackMsg(null));
    }, 2500);
  };

  const fetchInitialData = async () => {
    try {
      const [uId, dId, tok] = await Promise.all([
        getData(STORAGE_KEYS.USER_ID), getData(STORAGE_KEYS.DEVICE_ID), getData(STORAGE_KEYS.TOKEN)
      ]);

      const commonParams = { user_id: uId, device_id: dId, token: tok };

      const [statesRes, typesRes, leadsRes, visitsRes] = await Promise.all([
        axiosClient.get('/state_master.php', { params: commonParams }),
        axiosClient.get('/outlet_types.php', { params: commonParams }),
        axiosClient.get('/code_master.php', { params: { ...commonParams, type: 'lead_status' } }),
        axiosClient.get('/code_master.php', { params: { ...commonParams, type: 'visit_type' } }),
      ]);

      if (statesRes.data?.data) setStates(statesRes.data.data);
      if (typesRes.data?.data) {
        setOutletTypes(typesRes.data.data);
        // Default select "Other" (ID 7 or Search by name)
        const otherType = typesRes.data.data.find((item: any) =>
          item.id === '7' || item.outlet_type_name?.toLowerCase() === 'other'
        );
        if (otherType) setOutletType(otherType.id);
      }
      if (leadsRes.data?.data) setLeadTypes(leadsRes.data.data);
      if (visitsRes.data?.data) setVisitTypes(visitsRes.data.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      if (isConnected === false) {
        Alert.alert('Internet Error', 'Check the internet connection and try again.');
      }
    }
  };

  const fetchCities = async (stateCode: string) => {
    try {
      const [uId, dId, tok] = await Promise.all([
        getData(STORAGE_KEYS.USER_ID), getData(STORAGE_KEYS.DEVICE_ID), getData(STORAGE_KEYS.TOKEN)
      ]);
      const response = await axiosClient.get('/state_city_list.php', {
        params: { user_id: uId, device_id: dId, token: tok, state_code: stateCode }
      });
      if (response.data?.data) setCities(response.data.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
      if (isConnected === false) {
        Alert.alert('Internet Error', 'Check the internet connection and try again.');
      }
    }
  };

  const getLocation = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
    }
    setLocaLoading(true);
    Geolocation.getCurrentPosition(
      pos => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setLocation(coords);
        getAddress(coords);
      },
      err => { setLocaLoading(false); Alert.alert('Location Error', err.message); },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  };

  const getAddress = async (coords: { latitude: number; longitude: number }) => {
    try {
      const res = await axiosClient.get('/geocode-reverse.php', {
        params: { company_id: 1, api_key: '24916435facdadd10ec8bc2080cebf52', lat: coords.latitude, long: coords.longitude }
      });
      if (res.data?.results?.[0]) {
        const addr = res.data.results[0].formatted_address;
        setLocationText(addr);
        setCurrentAddress(addr);
        if (!isEdit) setManualAddress(addr);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      if (isConnected === false) {
        Alert.alert('Internet Error', 'Check the internet connection and try again.');
      }
    }
    finally { setLocaLoading(false); }
  };

  const convertToBase64 = async (imagePath: string) => {
    if (!imagePath) return null;

    try {
      // ✅ Resize & fix orientation first
      const resizedImage = await ImageResizer.createResizedImage(
        imagePath,
        1000,
        1000,
        'JPEG',
        90,
        0,
        null,
        false,
        {
          mode: 'contain',
          onlyScaleDown: false,
        }
      );

      const base64String = await ImgToBase64.getBase64String(resizedImage.uri);
      return base64String;
    } catch (err) {
      console.log('Base64 conversion error:', err);

      // 🔁 fallback: try with file:// prefix
      try {
        const fallbackPath = imagePath.startsWith('file://')
          ? imagePath
          : `file://${imagePath}`;
        const base64String = await ImgToBase64.getBase64String(fallbackPath);
        return base64String;
      } catch (fallbackErr) {
        console.log('Fallback conversion error:', fallbackErr);
        return null;
      }
    }
  };

  const hasCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const openSelfieCamera = async () => {
    const hasPermission = await hasCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take a selfie.');
      return;
    }
    const options = { mediaType: 'photo' as const, maxWidth: 800, maxHeight: 800, quality: 0.8, cameraType: 'front' as const };
    launchCamera(options, async (res) => {
      if (res.assets?.[0]?.uri) {
        const b64 = await convertToBase64(res.assets[0].uri);
        if (b64) {
          setSelfieImage(res.assets[0].uri);
          setSelfieBase64(b64);
        }
      }
    });
  };

  const handlePickAdditionalImage = async (source: 'camera' | 'gallery') => {
    setIsChoiceModalVisible(false);
    const options = { mediaType: 'photo' as const, maxWidth: 800, maxHeight: 800, quality: 0.8 };

    if (source === 'camera') {
      const hasPermission = await hasCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }
      launchCamera(options, async (res) => {
        if (res.assets?.[0]?.uri) {
          const b64 = await convertToBase64(res.assets[0].uri);
          if (b64) {
            setAdditionalImages(prev => [...prev, { uri: res.assets![0].uri!, base64: b64 }]);
          }
        }
      });
    } else {
      launchImageLibrary(options, async (res) => {
        if (res.assets?.[0]?.uri) {
          const b64 = await convertToBase64(res.assets[0].uri);
          if (b64) {
            setAdditionalImages(prev => [...prev, { uri: res.assets![0].uri!, base64: b64 }]);
          }
        }
      });
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateAndSubmit = () => {
    if (isConnected === false) {
      showSnackbar('Please check your internet connection');
      return;
    }
    if (!selfieImage) return Alert.alert('Required', 'Selfie is mandatory.');
    if (!outletName.trim()) return Alert.alert('Required', 'Please enter the outlet name.');
    if (!outletType) return Alert.alert('Required', 'Please select an outlet type.');
    if (!contactNumber) return Alert.alert('Required', 'Please enter a contact number.');
    if (phoneInput.current && !phoneInput.current.isValidNumber(contactNumber)) {
      return Alert.alert('Invalid Number', 'Please enter a valid phone number.');
    }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const [userId, deviceId, token] = await Promise.all([
        getData(STORAGE_KEYS.USER_ID), getData(STORAGE_KEYS.DEVICE_ID), getData(STORAGE_KEYS.TOKEN)
      ]);

      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('device_id', deviceId);
      formData.append('token', token);
      formData.append('map_address', locationText || currentAddress);
      formData.append('user_modified_address', manualAddress);
      formData.append('outlet_name', outletName);
      formData.append('outlet_type', outletType);
      formData.append('contact_person_name', contactName);
      formData.append('contact_person_number', contactNumber);
      formData.append('lead_status', leadType);
      formData.append('visit_type', visitType);
      formData.append('notes', meetingNotes);
      formData.append('city', selectedCity);
      formData.append('state', selectedState);
      formData.append('pincode', pincode);
      formData.append('lat', String(location?.latitude));
      formData.append('longi', String(location?.longitude));
      formData.append('outlet_code', '');
      formData.append('followup_date', meetingNotes);

      const allImages = [selfieBase64, ...additionalImages.map(img => img.base64)].filter(Boolean).join(',');
      formData.append('location_image', allImages);

      console.log("formData", formData);


      const response = await axiosClient.post('/sales_man_tracking.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log("response", response);

      if (response.data?.status === 'success') {

        navigation.replace('Home', { snackbarMsg: 'Check-In submitted successfully!' } as any)

      } else {
        Alert.alert('Submission Error', response.data?.message || 'The server returned an unsuccessful status.');
      }
    } catch (error: any) {

      if (error?.response?.data?.status === 'Conflict') {
        const msg =
          error?.response?.data?.data?.[0]?.message ||
          'You have already checked-in today.';

        console.log('Conflict message:', msg);

        Alert.alert(
          'Already Checked-In',
          msg,
          [
            {
              text: 'Back to Home',
              onPress: () => navigation.replace('Home'),
            },
          ]
        );
      } else {
        Alert.alert('Submission Failed', error?.response?.data?.message || 'An unexpected error occurred during submission. Check the internet connection and try again.');
      }

    } finally {
      setIsLoading(false);
    }
  };

  const showViewer = (index: number) => {
    setImageViewerIndex(index);
    setImageViewerVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationBar title="Check-In" hideCalendar />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <ScreenTimeoutManager onTimeout={() => navigation.goBack()} timeoutInSeconds={180} />

          {/* Section 1: Mandatory Selfie (Center) */}

          <View style={styles.selfieWrapper}>
            <View style={styles.sectionHeaderCentered}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primaryMuted, width: 28, height: 28 }]}>
                <CameraIcon size={14} color={Colors.primary} />
              </View>
              <Text style={styles.labelCentered}>Selfie Mandatory</Text>
            </View>
            {selfieImage ? (
              <View>
                <View style={styles.circularPreviewContainer}>
                  <TouchableOpacity onPress={() => showViewer(0)}>
                    <Image source={{ uri: selfieImage }} style={styles.circularPreviewImage} />
                  </TouchableOpacity>

                </View>
                <TouchableOpacity style={styles.circularRemovePhoto} onPress={() => { setSelfieImage(null); setSelfieBase64(null); }}>
                  <X size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.circularCameraBtn} onPress={openSelfieCamera}>
                <CameraIcon size={24} color={'#7683f5ff'} strokeWidth={1.75} />
                <Text style={styles.circularCameraBtnText}>Take Selfie</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Section 2: Outlet Details */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Layout size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Outlet Details</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Outlet Name <Text style={[styles.inputLabel, { color: Colors.error }]}>*</Text></Text>
              <TextInput style={styles.textInput} placeholder="Enter outlet name" placeholderTextColor={Colors.textPlaceholder} value={outletName} onChangeText={setOutletName} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Outlet Type <Text style={[styles.inputLabel, { color: Colors.error }]}>*</Text></Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholder}
                selectedTextStyle={styles.selectedText}
                data={outletTypes}
                labelField="outlet_type_name"
                valueField="id"
                placeholder="Select Type"
                value={outletType}
                onChange={item => setOutletType(item.id)}
                containerStyle={styles.dropdownContainer}
                activeColor={Colors.backgroundSecondary}
                itemTextStyle={styles.dropdownItemText}
              />
            </View>
          </View>

          {/* Section 3: Client Details */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <User size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Client Details</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Person Name</Text>
              <TextInput style={styles.textInput} placeholder="Enter person name" placeholderTextColor={Colors.textPlaceholder} value={contactName} onChangeText={setContactName} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Number <Text style={[styles.inputLabel, { color: Colors.error }]}>*</Text></Text>
              <PhoneInput
                ref={phoneInput}
                defaultValue={contactNumber}
                defaultCode="IN"
                layout="first"
                onChangeText={setContactNumber}
                containerStyle={styles.phoneInputContainer}
                textContainerStyle={styles.phoneTextContainer}
                textInputStyle={styles.phoneTextInput}
                codeTextStyle={styles.phoneCodeText}
                textInputProps={{
                  placeholderTextColor: Colors.textPlaceholder,
                }}
              />
            </View>
            <View style={styles.inputRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Lead Status</Text>
                <Dropdown
                  style={styles.dropdown}
                  data={leadTypes}
                  labelField="value"
                  valueField="id"
                  placeholder="Status"
                  value={leadType}
                  onChange={item => setLeadType(item.id)}
                  placeholderStyle={styles.placeholder}
                  selectedTextStyle={styles.selectedText}
                  containerStyle={styles.dropdownContainer}
                  itemTextStyle={styles.dropdownItemText}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Visit Type</Text>
                <Dropdown
                  style={styles.dropdown}
                  data={visitTypes}
                  labelField="value"
                  valueField="id"
                  placeholder="Type"
                  value={visitType}
                  onChange={item => setVisitType(item.id)}
                  placeholderStyle={styles.placeholder}
                  selectedTextStyle={styles.selectedText}
                  containerStyle={styles.dropdownContainer}
                  itemTextStyle={styles.dropdownItemText}
                />
              </View>
            </View>
          </View>

          {/* Section 4: Location & Address */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MapPin size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Visit Location</Text>
              <TouchableOpacity onPress={getLocation} disabled={locaLoading}>
                {locaLoading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <RefreshCw size={18} color={Colors.primary} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.addressBox}>
              <Text style={styles.addressText}>{locationText || (locaLoading ? 'Fetching live address...' : 'No address found')}</Text>
            </View>
            <TouchableOpacity style={styles.editToggle} onPress={() => setIsEdit(!isEdit)}>
              <Text style={styles.editToggleText}>{isEdit ? "Hide Manual Edit" : "Manual Address Entry"}</Text>
              <ChevronRight size={14} color={Colors.primary} />
            </TouchableOpacity>
            {isEdit && (
              <>
                <TextInput style={styles.manualInput} multiline placeholder="Enter address manually" placeholderTextColor={Colors.textPlaceholder} value={manualAddress} onChangeText={setManualAddress} />
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>State</Text>
                  <Dropdown style={styles.dropdown} data={states} labelField="state_name" valueField="state_code" placeholder="Select State" value={selectedState} onChange={item => setSelectedState(item.state_code)} placeholderStyle={styles.placeholder} selectedTextStyle={styles.selectedText} containerStyle={styles.dropdownContainer} itemTextStyle={styles.dropdownItemText} search searchPlaceholder="Search..." inputSearchStyle={styles.inputSearchStyle} />
                </View>
                <View style={styles.inputRow}>
                  <View style={{ flex: 1.5, marginRight: 10 }}>
                    <Text style={styles.inputLabel}>City</Text>
                    <Dropdown style={styles.dropdown} data={cities} labelField="city" valueField="city" placeholder="City" value={selectedCity} onChange={item => setSelectedCity(item.city)} placeholderStyle={styles.placeholder} selectedTextStyle={styles.selectedText} containerStyle={styles.dropdownContainer} itemTextStyle={styles.dropdownItemText} search searchPlaceholder="Search..." inputSearchStyle={styles.inputSearchStyle} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Pincode</Text>
                    <TextInput style={styles.textInput} placeholder="000000" placeholderTextColor={Colors.textPlaceholder} keyboardType="number-pad" maxLength={6} value={pincode} onChangeText={setPincode} />
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Section 5: Notes */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <FileText size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Visit Notes</Text>
            </View>
            <TextInput
              style={[styles.textInput, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
              multiline
              placeholder="Enter meeting notes or highlights..."
              placeholderTextColor={Colors.textPlaceholder}
              value={meetingNotes}
              onChangeText={setMeetingNotes}
            />
          </View>

          {/* Section 6: Additional Photos (Moved to bottom) */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <ImageIcon size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Additional Photos</Text>
            </View>
            <View style={styles.galleryRow}>
              {additionalImages.map((img, idx) => (
                <View key={idx} style={styles.galleryItem}>
                  <TouchableOpacity onPress={() => showViewer(idx + (selfieImage ? 1 : 0))}>
                    <Image source={{ uri: img.uri }} style={styles.galleryImage} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeGalleryBtn} onPress={() => removeAdditionalImage(idx)}>
                    <X size={14} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {additionalImages.length < 2 && (
                <TouchableOpacity style={styles.addGalleryBtn} onPress={() => setIsChoiceModalVisible(true)}>
                  <Plus size={24} color={Colors.textMuted} />
                  <Text style={styles.addGalleryText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity style={[styles.submitBtn, { opacity: (locaLoading) ? 0.5 : 1 }]} onPress={validateAndSubmit} disabled={locaLoading}>
            <Text style={styles.submitBtnText}>Submit Check-In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoaderModal visible={isLoading} text="Submitting Check-In..." />
      {/* <LoaderModal visible={locaLoading} text="Detecting Location..." /> */}

      {/* Image Choice Modal (Bottom Sheet Style) */}
      <Modal visible={isChoiceModalVisible} transparent animationType="slide" onRequestClose={() => setIsChoiceModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsChoiceModalVisible(false)}>
          <View style={styles.choiceCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.choiceTitle}>Select Image Source</Text>
            <View style={styles.choiceRow}>
              <TouchableOpacity style={styles.choiceBtn} onPress={() => handlePickAdditionalImage('camera')}>
                <View style={[styles.choiceIcon, { backgroundColor: Colors.primaryMuted }]}>
                  <CameraIcon size={24} color={Colors.primary} />
                </View>
                <Text style={styles.choiceText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.choiceBtn} onPress={() => handlePickAdditionalImage('gallery')}>
                <View style={[styles.choiceIcon, { backgroundColor: Colors.primaryMuted }]}>
                  <ImageIcon size={24} color={Colors.primary} />
                </View>
                <Text style={styles.choiceText}>Gallery</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeChoiceBtn} onPress={() => setIsChoiceModalVisible(false)}>
              <Text style={styles.closeChoiceText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ImageView
        images={[
          ...(selfieImage ? [{ uri: selfieImage }] : []),
          ...additionalImages.map(img => ({ uri: img.uri }))
        ]}
        imageIndex={imageViewerIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
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
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: Colors.backgroundCard, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  selfieWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 12, marginTop: 6 },
  sectionHeaderCentered: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'center' },
  labelCentered: {
    fontSize: 13, fontFamily: Fonts.bold, color: Colors.textPrimary, marginLeft: 8,
    includeFontPadding: false
  },
  sectionTitle: {
    flex: 1, fontSize: 16, fontFamily: Fonts.bold, color: Colors.textPrimary,
    includeFontPadding: false
  },
  inputGroup: { marginBottom: 16 },
  inputRow: { flexDirection: 'row', marginBottom: 16 },
  inputLabel: {
    fontSize: 12, fontFamily: Fonts.bold, color: Colors.textSecondary, marginBottom: 8, marginLeft: 4,
    includeFontPadding: false
  },
  textInput: {
    height: 48, backgroundColor: Colors.backgroundInput, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: Colors.border, fontSize: 14, fontFamily: Fonts.medium, color: Colors.textPrimary,
    includeFontPadding: false
  },
  dropdown: { height: 48, backgroundColor: Colors.backgroundInput, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: Colors.border },
  placeholder: {
    fontSize: 13, color: Colors.textPlaceholder, fontFamily: Fonts.medium,
    includeFontPadding: false
  },
  selectedText: {
    fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.medium,
    includeFontPadding: false
  },
  dropdownContainer: { backgroundColor: Colors.backgroundSecondary, borderRadius: 12, borderWeight: 1, borderColor: Colors.border, marginTop: 4 },
  dropdownItemText: {
    fontSize: 14, fontFamily: Fonts.medium, color: Colors.textPrimary,
    includeFontPadding: false
  },
  inputSearchStyle: { height: 40, borderRadius: 8, backgroundColor: Colors.backgroundInput, color: Colors.textPrimary },
  addressBox: { backgroundColor: Colors.backgroundInput, borderRadius: 16, padding: 16, marginBottom: 12 },
  addressText: {
    fontSize: 13, fontFamily: Fonts.medium, color: Colors.textSecondary, lineHeight: 20,
    includeFontPadding: false
  },
  editToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginBottom: 12 },
  editToggleText: {
    fontSize: 11, fontFamily: Fonts.bold, color: Colors.primary,
    includeFontPadding: false
  },
  manualInput: {
    backgroundColor: Colors.backgroundInput, borderRadius: 14, padding: 16, marginBottom: 16, fontSize: 14, fontFamily: Fonts.medium, color: Colors.textPrimary, minHeight: 60, textAlignVertical: 'top', borderWidth: 1, borderColor: Colors.border,
    includeFontPadding: false
  },
  galleryRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  galleryItem: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: Colors.border },
  galleryImage: { width: '100%', height: '100%' },
  removeGalleryBtn: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  addGalleryBtn: { width: 80, height: 80, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.backgroundInput, justifyContent: 'center', alignItems: 'center', gap: 4 },
  addGalleryText: {
    fontSize: 10, fontFamily: Fonts.bold, color: Colors.textMuted,
    includeFontPadding: false
  },
  circularCameraBtn: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#e3e9faff', borderWidth: 1, borderColor: Colors.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 3 },
  circularCameraBtnText: {
    fontSize: 11, fontFamily: Fonts.bold, color: '#7683f5ff',
    includeFontPadding: false
  },
  circularPreviewContainer: { width: 90, height: 90, borderRadius: 45, overflow: 'hidden', position: 'relative', borderWidth: 2, borderColor: Colors.primary },
  circularPreviewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  circularRemovePhoto: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.background },
  phoneInputContainer: { width: '100%', height: 50, backgroundColor: Colors.backgroundInput, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  phoneTextContainer: { backgroundColor: Colors.backgroundInput, paddingVertical: 0 },
  phoneTextInput: {
    height: 50, fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.medium,
    includeFontPadding: false
  },
  phoneCodeText: {
    fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.bold,
    includeFontPadding: false
  },
  submitBtn: { height: 56, backgroundColor: Colors.primary, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8, marginTop: 10 },
  submitBtnText: {
    fontSize: 16, fontFamily: Fonts.bold, color: Colors.white,
    includeFontPadding: false
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  choiceCard: { backgroundColor: Colors.backgroundCard, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderBottomWidth: 0 },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.divider, borderRadius: 2, marginBottom: 20 },
  choiceTitle: {
    fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary, marginBottom: 24,
    includeFontPadding: false
  },
  choiceRow: { flexDirection: 'row', gap: 40, marginBottom: 24 },
  choiceBtn: { alignItems: 'center', gap: 10 },
  choiceIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  choiceText: {
    fontSize: 14, fontFamily: Fonts.bold, color: Colors.textSecondary,
    includeFontPadding: false
  },
  closeChoiceBtn: { paddingTop: 10 },
  closeChoiceText: {
    fontSize: 14, fontFamily: Fonts.bold, color: Colors.error,
    includeFontPadding: false
  },
  iconBox: { justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  snackbar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#323232',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  snackbarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
});

export default CheckInScreen;
