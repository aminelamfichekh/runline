import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
const Overlay = ({
  itemHeight,
  overlayItemStyle
}) => {
  return /*#__PURE__*/React.createElement(View, {
    style: [styles.overlayContainer],
    pointerEvents: 'none'
  }, /*#__PURE__*/React.createElement(View, {
    style: [styles.selection, {
      height: itemHeight
    }, overlayItemStyle]
  }));
};
const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selection: {
    opacity: 0.05,
    backgroundColor: '#000',
    borderRadius: 8,
    alignSelf: 'stretch'
  }
});
export default /*#__PURE__*/memo(Overlay);
//# sourceMappingURL=Overlay.js.map