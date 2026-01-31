"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withPickerControl = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactUsefulHooks = require("@rozhkov/react-useful-hooks");
var _usePickerControlSubscriber = require("./usePickerControlSubscriber");
var _base = require("../base");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const withPickerControl = PickerComponent => {
  const WrappedPicker = ({
    pickerName,
    control,
    data,
    value,
    // extraValues TODO pass to props
    onValueChanging: onValueChangingProp,
    onValueChanged: onValueChangedProp,
    _onScrollStart: onScrollStartProp,
    _onScrollEnd: onScrollEndProp,
    ...restProps
  }, forwardedRef) => {
    const valueIndex = (0, _base.useValueIndex)(data, value);
    const currentItem = data[valueIndex];
    const subscriber = (0, _usePickerControlSubscriber.usePickerControlSubscriber)({
      control,
      pickerName,
      currentItem
    });
    const onValueChangingStable = (0, _reactUsefulHooks.useStableCallback)(event => {
      subscriber.emitOnValueChanging(event);
      onValueChangingProp === null || onValueChangingProp === void 0 || onValueChangingProp(event);
    });
    const onValueChangedStable = (0, _reactUsefulHooks.useStableCallback)(event => {
      subscriber.emitOnValueChanged(event);
      onValueChangedProp === null || onValueChangedProp === void 0 || onValueChangedProp(event);
    });
    const onScrollStartStable = (0, _reactUsefulHooks.useStableCallback)(() => {
      subscriber.onScrollStart();
      onScrollStartProp === null || onScrollStartProp === void 0 || onScrollStartProp();
    });
    const onScrollEndStable = (0, _reactUsefulHooks.useStableCallback)(() => {
      subscriber.onScrollEnd();
      onScrollEndProp === null || onScrollEndProp === void 0 || onScrollEndProp();
    });
    return /*#__PURE__*/_react.default.createElement(PickerComponent, _extends({}, restProps, {
      ref: forwardedRef,
      data: data,
      value: value,
      extraValues: subscriber.extraValues,
      onValueChanging: onValueChangingStable,
      onValueChanged: onValueChangedStable,
      _enableSyncScrollAfterScrollEnd: subscriber.enableSyncScrollAfterScrollEnd,
      _onScrollStart: onScrollStartStable,
      _onScrollEnd: onScrollEndStable
    }));
  };
  WrappedPicker.displayName = `withPickerControl(${PickerComponent.displayName})`;
  return /*#__PURE__*/(0, _react.memo)(/*#__PURE__*/(0, _react.forwardRef)(WrappedPicker));
};
exports.withPickerControl = withPickerControl;
//# sourceMappingURL=withPickerControl.js.map