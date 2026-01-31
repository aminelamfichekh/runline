import { useEffect, useState } from 'react';
import { useStableCallback } from '@rozhkov/react-useful-hooks';
const useConnectSub = ({
  control,
  pickerName,
  currentItem
}) => {
  const [subscriber, setSubscriber] = useState(null);
  useEffect(() => {
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
export const usePickerControlSubscriber = ({
  control,
  pickerName,
  currentItem
}) => {
  const subscriber = useConnectSub({
    control,
    pickerName,
    currentItem
  });
  const [extraValues, setExtraValues] = useState([]);
  const [enableSyncScrollAfterScrollEnd, setEnableSyncScrollAfterScrollEnd] = useState(true);
  const onScrollStart = useStableCallback(() => {
    setEnableSyncScrollAfterScrollEnd(false);
    subscriber === null || subscriber === void 0 || subscriber.emitOnScrollStart();
  });
  const onScrollEnd = useStableCallback(subscriber === null || subscriber === void 0 ? void 0 : subscriber.emitOnScrollEnd);
  const emitOnValueChanged = useStableCallback(subscriber === null || subscriber === void 0 ? void 0 : subscriber.emitOnValueChanged);
  const emitOnValueChanging = useStableCallback(subscriber === null || subscriber === void 0 ? void 0 : subscriber.emitOnValueChanging);
  useEffect(() => {
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
  useEffect(() => {
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
//# sourceMappingURL=usePickerControlSubscriber.js.map