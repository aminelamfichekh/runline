"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
const useBoolean = defaultValue => {
  const [value, setValue] = (0, _react.useState)(defaultValue);
  const setTrue = (0, _react.useCallback)(() => setValue(true), []);
  const setFalse = (0, _react.useCallback)(() => setValue(false), []);
  return {
    value,
    setTrue,
    setFalse
  };
};
var _default = exports.default = useBoolean;
//# sourceMappingURL=useBoolean.js.map