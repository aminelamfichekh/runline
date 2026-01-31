"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _base = _interopRequireDefault(require("../../base"));
var _VirtualizedList = _interopRequireDefault(require("./VirtualizedList"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const renderList = props => {
  return /*#__PURE__*/_react.default.createElement(_VirtualizedList.default, props);
};
const withVirtualized = WrappedComponent => {
  const Wrapper = props => {
    return /*#__PURE__*/_react.default.createElement(_base.default, _extends({}, props, {
      renderList: renderList
    }));
  };

  // @ts-ignore
  Wrapper.displayName = `withVirtualized(${WrappedComponent.displayName})`;
  return Wrapper;
};
var _default = exports.default = withVirtualized;
//# sourceMappingURL=withVirtualized.js.map