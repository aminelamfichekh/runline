function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { memo, useMemo } from 'react';
import Picker from '../base';
import { useDateContext } from './DatePickerValueProvider';
import { useOverlayItemStyle } from './useOverlayItemStyle';
import { useDatePickerLocale } from './DatePickerLocaleProvider';
import { withCommonProps } from './DatePickerCommonPropsProvider';
import { withPickerControl } from '../picker-control';
const HocPicker = withCommonProps(withPickerControl(Picker));
const DatePickerYear = ({
  width = 100,
  overlayItemStyle: overlayItemStyleProp,
  ...restProps
}) => {
  const localeData = useDatePickerLocale();
  const dateContext = useDateContext();
  const value = dateContext.value;
  const data = useMemo(() => {
    const startYear = dateContext.min.getFullYear();
    const endYear = dateContext.max.getFullYear();
    return Array.from({
      length: endYear - startYear + 1
    }, (_, index) => ({
      value: startYear + index
    }));
  }, [dateContext.max, dateContext.min]);
  const overlayItemStyle = useOverlayItemStyle({
    curUnit: 'year',
    unitPositions: localeData.sortedDateUnitTypes,
    propStyle: overlayItemStyleProp
  });
  return /*#__PURE__*/React.createElement(HocPicker, _extends({
    width: width,
    overlayItemStyle: overlayItemStyle
  }, restProps, {
    pickerName: 'year',
    control: dateContext.pickerControl,
    value: value.year,
    data: data
  }));
};
export default /*#__PURE__*/memo(DatePickerYear);
//# sourceMappingURL=DatePickerYear.js.map