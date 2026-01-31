function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef, memo, useCallback, useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { withScrollStartEndEvent } from '../../utils/scrolling';
// TODO "any" is not an exact type. How to pass the generic type?
const ExtendedAnimatedFlatList = withScrollStartEndEvent(Animated.FlatList);
const VirtualizedList = ({
  initialIndex,
  data,
  keyExtractor,
  renderItem,
  itemHeight,
  pickerHeight,
  visibleItemCount,
  readOnly,
  scrollOffset,
  onTouchEnd,
  onTouchStart,
  onTouchCancel,
  onScrollStart,
  onScrollEnd,
  contentContainerStyle: contentContainerStyleProp,
  initialNumToRender,
  maxToRenderPerBatch,
  updateCellsBatchingPeriod = 10,
  windowSize,
  ...restProps
}, forwardedRef) => {
  const snapToOffsets = useMemo(() => data.map((_, i) => i * itemHeight), [data, itemHeight]);
  const onScroll = useMemo(() => Animated.event([{
    nativeEvent: {
      contentOffset: {
        y: scrollOffset
      }
    }
  }], {
    useNativeDriver: true
  }), [scrollOffset]);
  const getItemLayout = useCallback((_, index) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index
  }), [itemHeight]);
  const contentContainerStyle = useMemo(() => {
    return [{
      paddingVertical: (pickerHeight - itemHeight) / 2
    }, contentContainerStyleProp];
  }, [pickerHeight, itemHeight, contentContainerStyleProp]);
  return /*#__PURE__*/React.createElement(ExtendedAnimatedFlatList, _extends({
    showsHorizontalScrollIndicator: false,
    showsVerticalScrollIndicator: false,
    scrollEventThrottle: 16,
    scrollEnabled: !readOnly
  }, restProps, {
    ref: forwardedRef,
    data: data,
    renderItem: renderItem,
    keyExtractor: keyExtractor,
    getItemLayout: getItemLayout,
    initialScrollIndex: initialIndex,
    onScroll: onScroll,
    scrollOffset: scrollOffset,
    snapToOffsets: snapToOffsets,
    style: styles.list,
    contentContainerStyle: contentContainerStyle,
    onTouchStart: onTouchStart,
    onTouchEnd: onTouchEnd,
    onTouchCancel: onTouchCancel,
    onScrollStart: onScrollStart,
    onScrollEnd: onScrollEnd,
    initialNumToRender: initialNumToRender ?? Math.ceil(visibleItemCount / 2),
    maxToRenderPerBatch: maxToRenderPerBatch ?? Math.ceil(visibleItemCount / 2),
    updateCellsBatchingPeriod: updateCellsBatchingPeriod,
    windowSize: windowSize,
    nestedScrollEnabled: true,
    removeClippedSubviews: false
  }));
};
const styles = StyleSheet.create({
  list: {
    width: '100%',
    overflow: 'visible'
  }
});
export default /*#__PURE__*/memo(/*#__PURE__*/forwardRef(VirtualizedList));
//# sourceMappingURL=VirtualizedList.js.map