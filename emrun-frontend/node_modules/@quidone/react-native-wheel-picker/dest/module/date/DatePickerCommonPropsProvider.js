function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { createContext, forwardRef, memo, useContext } from 'react';
import { useMemoObject } from '@rozhkov/react-useful-hooks';
const DatePickerCommonPropsContext = /*#__PURE__*/createContext(undefined);
const DatePickerCommonPropsProvider = ({
  children,
  ...restProps
}) => {
  const memoizedValue = useMemoObject(restProps);
  return /*#__PURE__*/React.createElement(DatePickerCommonPropsContext.Provider, {
    value: memoizedValue
  }, children);
};
export default DatePickerCommonPropsProvider;
const useDatePickerCommonProps = () => {
  const value = useContext(DatePickerCommonPropsContext);
  if (value === undefined) {
    throw new Error('useDatePickerCommonProps must be called from within DatePickerCommonPropsContext.Provider!');
  }
  return useContext(DatePickerCommonPropsContext);
};
export const withCommonProps = WheelPickerComponent => {
  const WrappedWheelPicker = ({
    style: pickerStyleProp,
    contentContainerStyle: contentContainerStyleProp,
    itemTextStyle: itemTextStyleProp,
    overlayItemStyle: overlayItemStyleProp,
    ...restProps
  }, forwardedRef) => {
    const {
      pickerStyle: pickerStyleCommon,
      contentContainerStyle: contentContainerStyleCommon,
      itemTextStyle: itemTextStyleCommon,
      overlayItemStyle: overlayItemStyleCommon,
      ...restCommonProps
    } = useDatePickerCommonProps();
    const style = useMemoObject([pickerStyleCommon, pickerStyleProp]);
    const contentContainerStyle = useMemoObject([contentContainerStyleCommon, contentContainerStyleProp]);
    const itemTextStyle = useMemoObject([itemTextStyleCommon, itemTextStyleProp]);
    const overlayItemStyle = useMemoObject([overlayItemStyleCommon, overlayItemStyleProp]);
    return /*#__PURE__*/React.createElement(WheelPickerComponent, _extends({}, restCommonProps, restProps, {
      style: style,
      contentContainerStyle: contentContainerStyle,
      itemTextStyle: itemTextStyle,
      overlayItemStyle: overlayItemStyle,
      ref: forwardedRef
    }));
  };
  WrappedWheelPicker.displayName = `withDateCommonProps(${WheelPickerComponent.displayName})`;
  return /*#__PURE__*/memo(/*#__PURE__*/forwardRef(WrappedWheelPicker));
};
//# sourceMappingURL=DatePickerCommonPropsProvider.js.map