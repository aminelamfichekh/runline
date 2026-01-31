"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _ScrollContentOffsetContext = require("../contexts/ScrollContentOffsetContext");
var _PickerItemHeightContext = require("../contexts/PickerItemHeightContext");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const PickerItemContainer = ({
  listRef,
  index,
  item,
  faces,
  renderItem,
  itemTextStyle,
  enableScrollByTapOnItem,
  readOnly
}) => {
  const offset = (0, _ScrollContentOffsetContext.useScrollContentOffset)();
  const height = (0, _PickerItemHeightContext.usePickerItemHeight)();
  const {
    opacity,
    rotateX,
    translateY
  } = (0, _react.useMemo)(() => {
    const inputRange = faces.map(f => height * (index + f.index));
    return {
      opacity: offset.interpolate({
        inputRange: inputRange,
        outputRange: faces.map(x => x.opacity),
        extrapolate: 'clamp'
      }),
      rotateX: offset.interpolate({
        inputRange: inputRange,
        outputRange: faces.map(x => `${x.deg}deg`),
        extrapolate: 'extend'
      }),
      translateY: offset.interpolate({
        inputRange: inputRange,
        outputRange: faces.map(x => x.offsetY),
        extrapolate: 'extend'
      })
    };
  }, [faces, height, index, offset]);
  const renderAnimatedView = () => {
    return /*#__PURE__*/_react.default.createElement(_reactNative.Animated.View, {
      style: [{
        height,
        opacity,
        transform: [{
          translateY
        },
        // first translateY, then rotateX for correct transformation.
        {
          rotateX
        }, {
          perspective: 1000
        } // without this line this Animation will not render on Android https://reactnative.dev/docs/animations#bear-in-mind
        ]
      }]
    }, renderItem({
      item,
      index,
      itemTextStyle
    }));
  };
  if (!enableScrollByTapOnItem || readOnly) {
    return renderAnimatedView();
  }
  const scrollToItem = () => {
    var _listRef$current;
    return (_listRef$current = listRef.current) === null || _listRef$current === void 0 ? void 0 : _listRef$current.scrollToIndex({
      index,
      animated: true
    });
  };
  return /*#__PURE__*/_react.default.createElement(_reactNative.TouchableWithoutFeedback, {
    onPress: scrollToItem
  }, renderAnimatedView());
};
var _default = exports.default = /*#__PURE__*/(0, _react.memo)(PickerItemContainer);
//# sourceMappingURL=PickerItemContainer.js.map