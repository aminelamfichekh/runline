function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { memo, useMemo } from 'react';
import { getDaysInMonth } from 'date-fns';
import Picker from '../base';
import { withPickerControl } from '../picker-control';
import { useDateContext } from './DatePickerValueProvider';
import { useOverlayItemStyle } from './useOverlayItemStyle';
import { useDatePickerLocale } from './DatePickerLocaleProvider';
import { withCommonProps } from './DatePickerCommonPropsProvider';
const HocPicker = withCommonProps(withPickerControl(Picker));
const DatePickerDate = ({
  width = 60,
  overlayItemStyle: overlayItemStyleProp,
  ...restProps
}) => {
  const localeData = useDatePickerLocale();
  const dateContext = useDateContext();
  const value = dateContext.value;
  const daysInMount = getDaysInMonth(new Date(value.year, value.month));
  const data = useMemo(() => {
    return [...Array(daysInMount).keys()].map(index => ({
      value: index + 1
    }));
  }, [daysInMount]);
  const overlayItemStyle = useOverlayItemStyle({
    curUnit: 'date',
    unitPositions: localeData.sortedDateUnitTypes,
    propStyle: overlayItemStyleProp
  });
  return /*#__PURE__*/React.createElement(HocPicker, _extends({
    width: width,
    overlayItemStyle: overlayItemStyle
  }, restProps, {
    pickerName: 'date',
    control: dateContext.pickerControl,
    value: value.date,
    data: data
  }));
};
export default /*#__PURE__*/memo(DatePickerDate);
//# sourceMappingURL=DatePickerDate.js.map