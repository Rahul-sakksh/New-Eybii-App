import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  ViewStyle,
  ImageStyle,
} from 'react-native';

interface ImageRenderProps {
  image: string;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
}

const ImageRender: React.FC<ImageRenderProps> = ({
  image,
  containerStyle,
  imageStyle,
}) => {
  if (!image) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={{ uri: image }}
        style={[styles.image, imageStyle]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F7F8FC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ImageRender;
