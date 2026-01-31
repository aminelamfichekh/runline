function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import PickerItemComponent from '../item/PickerItem';
import { ScrollContentOffsetContext } from '../contexts/ScrollContentOffsetContext';
import { PickerItemHeightContext } from '../contexts/PickerItemHeightContext';
import useValueEventsEffect from './hooks/useValueEventsEffect';
import useSyncScrollEffect from './hooks/useSyncScrollEffect';
import Overlay from '../overlay/Overlay';
import { calcPickerHeight, createFaces } from '../item/faces';
import PickerItemContainer from '../item/PickerItemContainer';
import { useBoolean } from '../../utils/react';
import { useInit, useStableCallback } from '@rozhkov/react-useful-hooks';
import List from '../list/List';
const defaultKeyExtractor = (_, index) => index.toString();
const defaultRenderItem = ({
  item: {
    value,
    label
  },
  itemTextStyle
}) => /*#__PURE__*/React.createElement(PickerItemComponent, {
  value: value,
  label: label,
  itemTextStyle: itemTextStyle
});
const defaultRenderItemContainer = ({
  key,
  ...props
}) => /*#__PURE__*/React.createElement(PickerItemContainer, _extends({
  key: key
}, props));
const defaultRenderOverlay = props => /*#__PURE__*/React.createElement(Overlay, props);
const defaultRenderList = props => {
  return /*#__PURE__*/React.createElement(List, props);
};
export const useValueIndex = (data, value) => {
  return useMemo(() => {
    const index = data.findIndex(x => x.value === value);
    return index >= 0 ? index : 0;
  }, [data, value]);
};
const Picker = ({
  data,
  value,
  extraValues = [],
  width = 'auto',
  itemHeight = 48,
  visibleItemCount = 5,
  readOnly = false,
  enableScrollByTapOnItem,
  testID,
  onValueChanged,
  onValueChanging,
  keyExtractor = defaultKeyExtractor,
  renderItem = defaultRenderItem,
  renderItemContainer = defaultRenderItemContainer,
  renderOverlay = defaultRenderOverlay,
  renderList = defaultRenderList,
  style,
  itemTextStyle,
  overlayItemStyle,
  contentContainerStyle,
  _enableSyncScrollAfterScrollEnd = true,
  _onScrollStart,
  _onScrollEnd,
  ...restProps
}) => {
  const valueIndex = useValueIndex(data, value);
  const initialIndex = useInit(() => valueIndex);
  const offsetY = useMemo(() => new Animated.Value(valueIndex * itemHeight),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [readOnly] // when scrollEnabled changes, the events stop coming. Re-creating
  );
  const listRef = useRef(null);
  const touching = useBoolean(false);
  const [faces, pickerHeight] = useMemo(() => {
    const items = createFaces(itemHeight, visibleItemCount);
    const height = calcPickerHeight(items, itemHeight);
    return [items, height];
  }, [itemHeight, visibleItemCount]);
  const renderPickerItem = useCallback(({
    item,
    index,
    key
  }) => renderItemContainer({
    listRef,
    key,
    item,
    index,
    faces,
    renderItem,
    itemTextStyle,
    enableScrollByTapOnItem,
    readOnly
  }), [enableScrollByTapOnItem, faces, itemTextStyle, readOnly, renderItem, renderItemContainer]);
  const {
    activeIndexRef,
    onScrollEnd: onScrollEndForValueEvents
  } = useValueEventsEffect({
    data,
    valueIndex,
    itemHeight,
    offsetYAv: offsetY
  }, {
    onValueChanging,
    onValueChanged
  });
  const {
    onScrollEnd: onScrollEndForSyncScroll
  } = useSyncScrollEffect({
    listRef,
    value,
    valueIndex,
    extraValues,
    activeIndexRef,
    touching: touching.value,
    enableSyncScrollAfterScrollEnd: _enableSyncScrollAfterScrollEnd
  });
  const onScrollEnd = useStableCallback(() => {
    // consistency matters
    _onScrollEnd === null || _onScrollEnd === void 0 || _onScrollEnd();
    onScrollEndForValueEvents();
    onScrollEndForSyncScroll();
  });
  return /*#__PURE__*/React.createElement(ScrollContentOffsetContext.Provider, {
    value: offsetY
  }, /*#__PURE__*/React.createElement(PickerItemHeightContext.Provider, {
    value: itemHeight
  }, /*#__PURE__*/React.createElement(View, {
    testID: testID,
    style: [styles.root, style, {
      height: pickerHeight,
      width
    }]
  }, renderList({
    ...restProps,
    ref: listRef,
    data,
    initialIndex,
    itemHeight,
    pickerHeight,
    visibleItemCount,
    readOnly,
    keyExtractor,
    renderItem: renderPickerItem,
    scrollOffset: offsetY,
    onTouchStart: touching.setTrue,
    onTouchEnd: touching.setFalse,
    onTouchCancel: touching.setFalse,
    onScrollStart: _onScrollStart,
    onScrollEnd,
    contentContainerStyle
  }), renderOverlay && renderOverlay({
    itemHeight,
    pickerWidth: width,
    pickerHeight,
    overlayItemStyle
  }))));
};
const styles = StyleSheet.create({
  root: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
export default Picker;
//# sourceMappingURL=Picker.js.map