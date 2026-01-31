"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _reactUsefulHooks = require("@rozhkov/react-useful-hooks");
const areArraysShallowEqual = (arr1, arr2) => {
  if (arr1 === arr2) return true;
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
};
const useEffectWithDynamicDepsLength = (callback, deps) => {
  const prevDeps = (0, _reactUsefulHooks.usePrevious)(deps);
  const callbackStable = (0, _reactUsefulHooks.useStableCallback)(callback);
  (0, _react.useEffect)(() => {
    if (!areArraysShallowEqual(prevDeps, deps)) {
      callbackStable();
    }
  }, [deps]); // eslint-disable-line react-hooks/exhaustive-deps
};
var _default = exports.default = useEffectWithDynamicDepsLength;
//# sourceMappingURL=useEffectWithDynamicDepsLength.js.map