"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactUsefulHooks = require("@rozhkov/react-useful-hooks");
var _scrolling = require("../../utils/scrolling");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ExtendedAnimatedScrollView = (0, _scrolling.withScrollStartEndEvent)(_reactNative.Animated.ScrollView);
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
  const listRef = (0, _react.useRef)(null);
  (0, _react.useImperativeHandle)(forwardedRef, () => ({
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
  const initialOffset = (0, _reactUsefulHooks.useInit)(() => ({
    x: OFFSET_X,
    y: getOffsetY(initialIndex, itemHeight)
  }));
  const snapToOffsets = (0, _react.useMemo)(() => data.map((_, i) => i * itemHeight), [data, itemHeight]);
  const onScroll = (0, _react.useMemo)(() => _reactNative.Animated.event([{
    nativeEvent: {
      contentOffset: {
        y: scrollOffset
      }
    }
  }], {
    useNativeDriver: true
  }), [scrollOffset]);
  const contentContainerStyle = (0, _react.useMemo)(() => {
    return [{
      paddingVertical: (pickerHeight - itemHeight) / 2
    }, contentContainerStyleProp];
  }, [pickerHeight, itemHeight, contentContainerStyleProp]);
  return /*#__PURE__*/_react.default.createElement(ExtendedAnimatedScrollView, _extends({
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
const styles = _reactNative.StyleSheet.create({
  list: {
    width: '100%',
    overflow: 'visible'
  }
});
var _default = exports.default = /*#__PURE__*/(0, _react.memo)(/*#__PURE__*/(0, _react.forwardRef)(List));
//# sourceMappingURL=List.js.map