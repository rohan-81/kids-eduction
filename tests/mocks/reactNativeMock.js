module.exports = {
  Platform: {
    OS: 'web',
    select: (obj) => obj.web || obj.default,
  },
  processColor: (c) => c,
  StyleSheet: {
    create: (s) => s,
  },
  View: 'View',
  Text: 'Text',
  Image: 'Image',
  TouchableOpacity: 'TouchableOpacity',
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
};
