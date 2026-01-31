"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useValueIndex = exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _PickerItem = _interopRequireDefault(require("../item/PickerItem"));
var _ScrollContentOffsetContext = require("../contexts/ScrollContentOffsetContext");
var _PickerItemHeightContext = require("../contexts/PickerItemHeightContext");
var _useValueEventsEffect = _interopRequireDefault(require("./hooks/useValueEventsEffect"));
var _useSyncScrollEffect = _interopRequireDefault(require("./hooks/useSyncScrollEffect"));
var _Overlay = _interopRequireDefault(require("../overlay/Overlay"));
var _faces = require("../item/faces");
var _PickerItemContainer = _interopRequireDefault(require("../item/PickerItemContainer"));
var _react2 = require("../../utils/react");
var _reactUsefulHooks = require("@rozhkov/react-useful-hooks");
var _List = _interopRequireDefault(require("../list/List"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const defaultKeyExtractor = (_, index) => index.toString();
const defaultRenderItem = ({
  item: {
    value,
    label
  },
  itemTextStyle
}) => /*#__PURE__*/_react.default.createElement(_PickerItem.default, {
  value: value,
  label: label,
  itemTextStyle: itemTextStyle
});
const defaultRenderItemContainer = ({
  key,
  ...props
}) => /*#__PURE__*/_react.default.createElement(_PickerItemContainer.default, _extends({
  key: key
}, props));
const defaultRenderOverlay = props => /*#__PURE__*/_react.default.createElement(_Overlay.default, props);
const defaultRenderList = props => {
  return /*#__PURE__*/_react.default.createElement(_List.default, props);
};
const useValueIndex = (data, value) => {
  return (0, _react.useMemo)(() => {
    const index = data.findIndex(x => x.value === value);
    return index >= 0 ? index : 0;
  }, [data, value]);
};
exports.useValueIndex = useValueIndex;
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
  const initialIndex = (0, _reactUsefulHooks.useInit)(() => valueIndex);
  const offsetY = (0, _react.useMemo)(() => new _reactNative.Animated.Value(valueIndex * itemHeight),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [readOnly] // when scrollEnabled changes, the events stop coming. Re-creating
  );
  const listRef = (0, _react.useRef)(null);
  const touching = (0, _react2.useBoolean)(false);
  const [faces, pickerHeight] = (0, _react.useMemo)(() => {
    const items = (0, _faces.createFaces)(itemHeight, visibleItemCount);
    const height = (0, _faces.calcPickerHeight)(items, itemHeight);
    return [items, height];
  }, [itemHeight, visibleItemCount]);
  const renderPickerItem = (0, _react.useCallback)(({
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
  } = (0, _useValueEventsEffect.default)({
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
  } = (0, _useSyncScrollEffect.default)({
    listRef,
    value,
    valueIndex,
    extraValues,
    activeIndexRef,
    touching: touching.value,
    enableSyncScrollAfterScrollEnd: _enableSyncScrollAfterScrollEnd
  });
  const onScrollEnd = (0, _reactUsefulHooks.useStableCallback)(() => {
    // consistency matters
    _onScrollEnd === null || _onScrollEnd === void 0 || _onScrollEnd();
    onScrollEndForValueEvents();
    onScrollEndForSyncScroll();
  });
  return /*#__PURE__*/_react.default.createElement(_ScrollContentOffsetContext.ScrollContentOffsetContext.Provider, {
    value: offsetY
  }, /*#__PURE__*/_react.default.createElement(_PickerItemHeightContext.PickerItemHeightContext.Provider, {
    value: itemHeight
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
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
const styles = _reactNative.StyleSheet.create({
  root: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
var _default = exports.default = Picker;
//# sourceMappingURL=Picker.js.map