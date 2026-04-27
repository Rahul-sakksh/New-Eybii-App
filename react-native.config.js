// react-native.config.js
// Tells the RN CLI where to find custom assets (fonts) for automatic linking
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'], // Roboto fonts will be linked from here
};
