import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  StatusBar,
  ActivityIndicator
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput
} from "react-native-vision-camera";
import {
  Plus,
  Minus,
  X,
  SwitchCamera,
  Zap,
  ZapOff,
  Check,
} from "lucide-react-native";

type FlashMode = "off" | "on" | "auto";

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photoUri: string) => void;
  defaultCamera?: "front" | "back";
}

const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  onClose,
  onCapture,
  defaultCamera = "front",
}) => {
  const [isFront, setIsFront] = useState(defaultCamera === "front");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [preview, setPreview] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [screenActive, setScreenActive] = useState(false);

  const device = useCameraDevice(isFront ? "front" : "back");
  const camera = useRef<any>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const photoOutput = usePhotoOutput();

  // Reset state every time the modal opens
  useEffect(() => {
    if (visible) {
      setIsFront(defaultCamera === "front");
      setZoom(1);
      setFlash("off");
    }
  }, [visible, defaultCamera]);

  const zoomInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startZoom = (type: "in" | "out") => {
    if (zoomInterval.current) return;

    zoomInterval.current = setInterval(() => {
      setZoom((prev) => {
        if (type === "in") {
          return Math.min(maxZoom, prev + 0.10);
        } else {
          return Math.max(1, prev - 0.10);
        }
      });
    }, 70);
  };

  const stopZoom = () => {
    if (zoomInterval.current) {
      clearInterval(zoomInterval.current);
      zoomInterval.current = null;
    }
  };

  // Permission
  useEffect(() => {
    const checkPermission = async () => {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            "Camera Permission Required",
            "Please enable camera access in settings.",
            [
              { text: "Cancel", style: "cancel", onPress: onClose },
              {
                text: "Open Settings",
                onPress: () => {
                  if (Platform.OS === "ios") {
                    Linking.openURL("app-settings:");
                  } else {
                    Linking.openSettings();
                  }
                },
              },
            ]
          );
        }
      }
    };

    if (visible) checkPermission();
  }, [visible, hasPermission]);

  useEffect(() => {
    if (device?.maxZoom) {
      setMaxZoom(device.maxZoom > 5 ? 5 : device.maxZoom);
    }
  }, [device]);

  const takePicture = async () => {
    if (screenActive || !photoOutput) return;

    setScreenActive(true);

    try {
      const photo = await photoOutput.capturePhotoToFile(
        {
          flashMode: device?.hasFlash ? (isFront ? "off" : flash) : "off"
        },
        {}
      );

      const uri = photo.filePath.startsWith("file://")
        ? photo.filePath
        : `file://${photo.filePath}`;

      setPreview(uri);
    } catch (err) {
      console.error("Capture error:", err);
      Alert.alert("Error", "Could not capture photo.");
    } finally {
      setScreenActive(false);
    }
  };

  const retake = () => {
    setPreview(null);
    setScreenActive(false);
  };

  const confirm = () => {
    if (preview) {
      onCapture(preview);
      setPreview(null);
      onClose();
      setScreenActive(false);
    }
  };

  if (!device || !hasPermission) return null;

  const renderFlashIcon = () => {
    switch (flash) {
      case "off":
        return <ZapOff size={24} color="#fff" />;
      case "on":
        return <Zap size={24} color="#FFD700" />;
      case "auto":
        return (
          <View>
            <Zap size={24} color="#fff" />
            <Text style={{ position: 'absolute', bottom: -4, right: -4, color: '#fff', fontSize: 10, fontWeight: 'bold', backgroundColor: '#000', borderRadius: 4, paddingHorizontal: 2, overflow: 'hidden' }}>A</Text>
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <StatusBar backgroundColor="black" barStyle="light-content" translucent />

      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {!preview ? (
          <>
            <Camera
              ref={camera}
              style={{ flex: 1 }}
              device={device}
              isActive={visible}
              outputs={[photoOutput]}
              zoom={zoom}
              torch={flash === "on" ? "on" : "off"}
            />

            {/* Close */}
            <TouchableOpacity onPress={onClose} style={styles.iconBtnLeft}>
              <X size={22} color="#fff" />
            </TouchableOpacity>

            {/* Flip Camera */}
            <TouchableOpacity
              style={styles.iconBtnRight}
              onPress={() => {
                setFlash("off");
                setIsFront((prev) => !prev);
              }}
            >
              <SwitchCamera size={24} color="#fff" />
            </TouchableOpacity>

            {/* Flash */}
            {device?.hasFlash && !isFront && (
              <TouchableOpacity
                onPress={() =>
                  setFlash((prev) =>
                    prev === "off" ? "on" : prev === "on" ? "auto" : "off"
                  )
                }
                style={styles.flashBtn}
              >
                {renderFlashIcon()}
              </TouchableOpacity>
            )}

            {/* Zoom Controls */}
            <View style={styles.zoomControls}>
              <TouchableOpacity
                style={styles.zoomButton}
                onPress={() => setZoom((prev) => Math.max(1, prev - 0.2))}
                onPressIn={() => startZoom("out")}
                onPressOut={stopZoom}
              >
                <Minus size={20} color="#fff" />
              </TouchableOpacity>

              <Text style={styles.zoomValue}>{zoom.toFixed(1)}x</Text>

              <TouchableOpacity
                style={styles.zoomButton}
                onPress={() => setZoom((prev) => Math.min(maxZoom, prev + 0.2))}
                onPressIn={() => startZoom("in")}
                onPressOut={stopZoom}
              >
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Capture */}
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture} disabled={screenActive}>
              <View style={styles.innerCircle} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Image
              source={{ uri: preview }}
              style={{ flex: 1, resizeMode: "contain" }}
            />

            <View style={[styles.previewControls, { bottom: 40 }]}>
              <TouchableOpacity onPress={retake} style={styles.retakeBtn}>
                <X size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={confirm} style={styles.tickBtn}>
                <Check size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconBtnLeft: {
    position: "absolute",
    top: 30,
    left: 20,
    backgroundColor: "#00000088",
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    zIndex: 20,
  },
  iconBtnRight: {
    position: "absolute",
    top: 30,
    right: 20,
    backgroundColor: "#00000088",
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    zIndex: 20,
  },
  flashBtn: {
    position: "absolute",
    top: 90,
    right: 20,
    backgroundColor: "#00000088",
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    zIndex: 20,
  },
  zoomControls: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00000088",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    zIndex: 20,
  },
  zoomButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff22",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomValue: {
    color: "#fff",
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: "600",
  },
  captureBtn: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#fff",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
  },
  previewControls: {
    position: "absolute",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    zIndex: 20,
  },
  retakeBtn: {
    backgroundColor: "red",
    height: 50,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
  },
  tickBtn: {
    backgroundColor: "green",
    height: 50,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
  },
});

export default CameraModal;
