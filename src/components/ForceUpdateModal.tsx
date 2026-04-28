import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Platform,
    Image,
    Text,
} from 'react-native';
import Colors from '../theme/colors';
import { Fonts, FontSizes } from '../theme/fonts';

const ForceUpdateModal = ({ visible, storeUrl }: any) => {
    const handleUpdate = () => {
        Linking.openURL(storeUrl);
    };

    const storeName = Platform.OS === 'ios' ? 'App Store' : 'Play Store';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => { }}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>

                    {/* Illustration */}
                    <Image
                        source={require('../assets/images/UpdateAppImg.png')} // <-- add your image
                        style={styles.image}
                        resizeMode="contain"
                    />

                    {/* Title */}
                    <Text style={styles.title}>App Update Required!</Text>

                    {/* Description */}
                    <Text style={styles.message}>
                        We’ve added new features and fixed some bugs to make your experience smoother.
                        Please update the app from the {storeName} to continue.
                    </Text>

                    {/* CTA Button */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.button}
                        onPress={handleUpdate}
                    >
                        <Text style={styles.buttonText}>Update App</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
};

export default ForceUpdateModal;
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(120,120,180,0.25)', // soft lavender overlay
        justifyContent: 'center',
        alignItems: 'center',
    },

    card: {
        width: '86%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 32,
        paddingHorizontal: 22,
        alignItems: 'center',

        // iOS shadow
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,

        // Android elevation
        elevation: 14,
    },

    image: {
        width: 180,
        height: 180,
        marginTop: -80
    },

    title: {
        fontSize: 20,
        color: '#1F1F1F',
        marginBottom: 10,
        fontFamily:Fonts.bold,
        includeFontPadding:false
    },

    message: {
        fontSize: 14.5,
        textAlign: 'center',
        color: '#8b8b8e',
        lineHeight: 22,
        marginBottom: 26,
        fontFamily:Fonts.medium,
        includeFontPadding:false
    },

    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 9,
        paddingHorizontal: 22,
        borderRadius: 22,
        minWidth: 140,
        alignItems: 'center',

        // iOS shadow (soft)
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 6,

        // Android elevation (light)
        elevation: 6,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 14.5,
        letterSpacing: 0.3,
        fontFamily:Fonts.bold,
        includeFontPadding:false
    },

});
