function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef, memo } from 'react';
import { useStableCallback } from '@rozhkov/react-useful-hooks';
import { usePickerControlSubscriber } from './usePickerControlSubscriber';
import { useValueIndex } from '../base';
export const withPickerControl = PickerComponent => {
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
    const valueIndex = useValueIndex(data, value);
    const currentItem = data[valueIndex];
    const subscriber = usePickerControlSubscriber({
      control,
      pickerName,
      currentItem
    });
    const onValueChangingStable = useStableCallback(event => {
      subscriber.emitOnValueChanging(event);
      onValueChangingProp === null || onValueChangingProp === void 0 || onValueChangingProp(event);
    });
    const onValueChangedStable = useStableCallback(event => {
      subscriber.emitOnValueChanged(event);
      onValueChangedProp === null || onValueChangedProp === void 0 || onValueChangedProp(event);
    });
    const onScrollStartStable = useStableCallback(() => {
      subscriber.onScrollStart();
      onScrollStartProp === null || onScrollStartProp === void 0 || onScrollStartProp();
    });
    const onScrollEndStable = useStableCallback(() => {
      subscriber.onScrollEnd();
      onScrollEndProp === null || onScrollEndProp === void 0 || onScrollEndProp();
    });
    return /*#__PURE__*/React.createElement(PickerComponent, _extends({}, restProps, {
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
  return /*#__PURE__*/memo(/*#__PURE__*/forwardRef(WrappedPicker));
};
//# sourceMappingURL=withPickerControl.js.map