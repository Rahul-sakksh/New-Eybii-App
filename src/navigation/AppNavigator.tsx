import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CheckInScreen from '../screens/CheckInScreen';
import DayCycleScreen from '../screens/DayCycleScreen';

import Colors from '../theme/colors';
import CameraScreen from '../screens/CameraScreen';

// ----------- Navigation Type Definitions -----------
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  CheckIn: undefined;
  Day: { outletType: 'day_start' | 'day_end' };
  Camera: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Common screen options — no header, dark background
const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: Colors.background },
  animation: 'slide_from_right',
  gestureEnabled: true,
};

interface AppNavigatorProps {
  initialRouteName?: keyof RootStackParamList;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ initialRouteName = 'Login' }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={screenOptions}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CheckIn" component={CheckInScreen} />
        <Stack.Screen name="Day" component={DayCycleScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
