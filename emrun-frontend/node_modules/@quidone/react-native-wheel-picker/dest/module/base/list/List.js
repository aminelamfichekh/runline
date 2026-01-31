function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef, memo, useImperativeHandle, useMemo, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useInit } from '@rozhkov/react-useful-hooks';
import { withScrollStartEndEvent } from '../../utils/scrolling';
const ExtendedAnimatedScrollView = withScrollStartEndEvent(Animated.ScrollView);
const OFFSET_X = 0;
const getOffsetY = (index, itemHeight) => index * itemHeight;
const List = ({
  initialIndex,
  data,
  keyExtractor,
  renderItem,
  itemHeight,
  pickerHeight,
  readOnly,
  scrollOffset,
  onTouchEnd,
  onTouchStart,
  onTouchCancel,
  onScrollStart,
  onScrollEnd,
  contentContainerStyle: contentContainerStyleProp,
  ...restProps
}, forwardedRef) => {
  const listRef = useRef(null);
  useImperativeHandle(forwardedRef, () => ({
    scrollToIndex: ({
      index,
      animated
    }) => {
      var _listRef$current;
      (_listRef$current = listRef.current) === null || _listRef$current === void 0 || _listRef$current.scrollTo({
        x: OFFSET_X,
        y: getOffsetY(index, itemHeight),
        animated
      });
    }
  }), [itemHeight]);
  const initialOffset = useInit(() => ({
    x: OFFSET_X,
    y: getOffsetY(initialIndex, itemHeight)
  }));
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
  const contentContainerStyle = useMemo(() => {
    return [{
      paddingVertical: (pickerHeight - itemHeight) / 2
    }, contentContainerStyleProp];
  }, [pickerHeight, itemHeight, contentContainerStyleProp]);
  return /*#__PURE__*/React.createElement(ExtendedAnimatedScrollView, _extends({
    showsHorizontalScrollIndicator: false,
    showsVerticalScrollIndicator: false,
    scrollEventThrottle: 16,
    scrollEnabled: !readOnly
  }, restProps, {
    ref: listRef,
    contentOffset: initialOffset,
    onScroll: onScroll,
    scrollOffset: scrollOffset,
    snapToOffsets: snapToOffsets,
    style: styles.list,
    contentContainerStyle: contentContainerStyle,
    onTouchStart: onTouchStart,
    onTouchEnd: onTouchEnd,
    onTouchCancel: onTouchCancel,
    nestedScrollEnabled: true,
    removeClippedSubviews: false,
    onScrollStart: onScrollStart,
    onScrollEnd: onScrollEnd
  }), data.map((item, index) => renderItem({
    key: keyExtractor(item, index),
    item,
    index
  })));
};
const styles = StyleSheet.create({
  list: {
    width: '100%',
    overflow: 'visible'
  }
});
export default /*#__PURE__*/memo(/*#__PURE__*/forwardRef(List));
//# sourceMappingURL=List.js.map