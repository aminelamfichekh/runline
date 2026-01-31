"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePickerControlSubscriber = void 0;
var _react = require("react");
var _reactUsefulHooks = require("@rozhkov/react-useful-hooks");
const useConnectSub = ({
  control,
  pickerName,
  currentItem
}) => {
  const [subscriber, setSubscriber] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    const sub = control._connect({
      pickerName,
      item: currentItem
    });
    setSubscriber(sub);
    return () => {
      sub.disconnect();
    };
  }, [control, pickerName]); // eslint-disable-line react-hooks/exhaustive-deps

  return subscriber;
};
const usePickerControlSubscriber = ({
  control,
  pickerName,
  currentItem
}) => {
  const subscriber = useConnectSub({
    control,
    pickerName,
    currentItem
  });
  const [extraValues, setExtraValues] = (0, _react.useState)([]);
  const [enableSyncScrollAfterScrollEnd, setEnableSyncScrollAfterScrollEnd] = (0, _react.useState)(true);
  const onScrollStart = (0, _reactUsefulHooks.useStableCallback)(() => {
    setEnableSyncScrollAfterScrollEnd(false);
    subscriber === null || subscriber === void 0 || subscriber.emitOnScrollStart();
  });
  const onScrollEnd = (0, _reactUsefulHooks.useStableCallback)(subscriber === null || subscriber === void 0 ? void 0 : subscriber.emitOnScrollEnd);
  const emitOnValueChanged = (0, _reactUsefulHooks.useStableCallback)(subscriber === null || subscriber === void 0 ? void 0 : subscriber.emitOnValueChanged);
  const emitOnValueChanging = (0, _reactUsefulHooks.useStableCallback)(subscriber === null || subscriber === void 0 ? void 0 : subscriber.emitOnValueChanging);
  (0, _react.useEffect)(() => {
    if (!subscriber) {
      return;
    }
    setExtraValues(subscriber.getExtraValues());
    const unsubscribeNewExtraValues = subscriber.onNewExtraValues(() => {
      setExtraValues(subscriber.getExtraValues());
    });
    setEnableSyncScrollAfterScrollEnd(subscriber.getEveryIsStopped());
    const unsubscribeAllScrollEnd = subscriber.onAllScrollEnd(() => {
      setEnableSyncScrollAfterScrollEnd(subscriber.getEveryIsStopped());
    });
    return () => {
      unsubscribeNewExtraValues();
      unsubscribeAllScrollEnd();
    };
  }, [subscriber]);
  (0, _react.useEffect)(() => {
    subscriber === null || subscriber === void 0 || subscriber.emitOnNewPropValue({
      item: currentItem
    });
  }, [currentItem, subscriber]);
  return {
    extraValues,
    enableSyncScrollAfterScrollEnd,
    onScrollStart,
    onScrollEnd,
    emitOnValueChanged,
    emitOnValueChanging
  };
};
exports.usePickerControlSubscriber = usePickerControlSubscriber;
//# sourceMappingURL=usePickerControlSubscriber.js.map