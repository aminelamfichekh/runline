"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePickerControl = exports.useOnPickerValueChangingEffect = exports.useOnPickerValueChangedEffect = void 0;
var _react = require("react");
var _reactUsefulHooks = require("@rozhkov/react-useful-hooks");
var _createControl = require("./create-control");
const usePickerControl = () => {
  return (0, _reactUsefulHooks.useInit)(() => (0, _createControl.createControl)());
};
exports.usePickerControl = usePickerControl;
const useOnPickerValueChangedEffect = (control, effect) => {
  const effectStable = (0, _reactUsefulHooks.useStableCallback)(effect);
  (0, _react.useEffect)(() => {
    const unsubscribe = control._on('onValueChanged', effectStable);
    return () => {
      unsubscribe();
    };
  }, [control]); // eslint-disable-line react-hooks/exhaustive-deps
};
exports.useOnPickerValueChangedEffect = useOnPickerValueChangedEffect;
const useOnPickerValueChangingEffect = (control, effect) => {
  const effectStable = (0, _reactUsefulHooks.useStableCallback)(effect);
  (0, _react.useEffect)(() => {
    const unsubscribe = control._on('onValueChanging', effectStable);
    return () => {
      unsubscribe();
    };
  }, [control]); // eslint-disable-line react-hooks/exhaustive-deps
};
exports.useOnPickerValueChangingEffect = useOnPickerValueChangingEffect;
//# sourceMappingURL=usePickerControl.js.map