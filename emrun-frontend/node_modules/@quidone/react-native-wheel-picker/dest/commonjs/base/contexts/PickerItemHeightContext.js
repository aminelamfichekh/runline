"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePickerItemHeight = exports.PickerItemHeightContext = void 0;
var _react = require("react");
const PickerItemHeightContext = exports.PickerItemHeightContext = /*#__PURE__*/(0, _react.createContext)(undefined);
const usePickerItemHeight = () => {
  const value = (0, _react.useContext)(PickerItemHeightContext);
  if (value === undefined) {
    throw new Error('usePickerItemHeight must be called from within PickerItemHeightContext.Provider!');
  }
  return value;
};
exports.usePickerItemHeight = usePickerItemHeight;
//# sourceMappingURL=PickerItemHeightContext.js.map