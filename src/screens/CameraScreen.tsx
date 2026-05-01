import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    usePhotoOutput,
} from 'react-native-vision-camera';

const CameraScreen = () => {
    const cameraRef = useRef<any>(null);
    const { hasPermission, requestPermission } = useCameraPermission();

    const device = useCameraDevice('back');
    const photoOutput = usePhotoOutput();

    const [isInitialized, setIsInitialized] = useState(false);
    const [isTakingPhoto, setIsTakingPhoto] = useState(false);
    const [flash, setFlash] = useState<'off' | 'on'>('off');

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    const takePhoto = async () => {
        if (!isInitialized || isTakingPhoto || !photoOutput) return;

        try {
            setIsTakingPhoto(true);
            const photo = await photoOutput.capturePhotoToFile(
                { flashMode: flash },
                {}
            );

            console.log('✅ Photo taken:', photo);
            Alert.alert('✅ Success', `Photo captured!\nPath: ${photo.filePath}`);
        } catch (error) {
            console.error('❌ Error:', error);
            Alert.alert('❌ Error', (error as Error).message);
        } finally {
            setIsTakingPhoto(false);
        }
    };

    if (!hasPermission) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.text}>Requesting permission...</Text>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>No camera device found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                outputs={[photoOutput]}
                onPreviewStarted={() => {
                    console.log('✅ Camera initialized (Preview Started)');
                    setIsInitialized(true);
                }}
                onError={(error) => {
                    console.error('Camera error:', error);
                }}
            />

            {!isInitialized && (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.loadingText}>Initializing...</Text>
                </View>
            )}

            {isInitialized && (
                <>
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
                        >
                            <Text style={styles.text}>💡 {flash.toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomBar}>
                        <TouchableOpacity
                            style={[styles.captureButton, isTakingPhoto && styles.disabled]}
                            onPress={takePhoto}
                            disabled={isTakingPhoto}
                        >
                            {isTakingPhoto ? (
                                <ActivityIndicator color="black" />
                            ) : (
                                <View style={styles.circle} />
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    loadingBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        marginTop: 20,
        fontSize: 16,
    },
    topBar: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
    },
    button: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontSize: 16,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'white',
    },
});

export default CameraScreen;