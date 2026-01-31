import React, { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { usePickerItemHeight } from '../contexts/PickerItemHeightContext';
const PickerItem = ({
  value,
  label,
  itemTextStyle
}) => {
  const height = usePickerItemHeight();
  return /*#__PURE__*/React.createElement(Text, {
    style: [styles.root, {
      lineHeight: height
    }, itemTextStyle]
  }, label ?? value);
};
const styles = StyleSheet.create({
  root: {
    textAlign: 'center',
    fontSize: 20
  }
});
export default /*#__PURE__*/memo(PickerItem);
//# sourceMappingURL=PickerItem.js.map