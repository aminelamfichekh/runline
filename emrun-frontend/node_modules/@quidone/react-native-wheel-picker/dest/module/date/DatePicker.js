import React from 'react';
import DatePickerValueProvider from './DatePickerValueProvider';
import DatePickerDates from './DatePickerDate';
import DatePickerMonth from './DatePickerMonth';
import DatePickerYear from './DatePickerYear';
import DatePickerContainer from './DatePickerContainer';
import DatePickerLocaleProvider from './DatePickerLocaleProvider';
import DatePickerCommonPropsProvider from './DatePickerCommonPropsProvider';
const DatePickerComponent = ({
  date,
  onDateChanged,
  minDate,
  maxDate,
  locale,
  renderDate,
  renderMonth,
  renderYear,
  children = ({
    dateNodes
  }) => /*#__PURE__*/React.createElement(React.Fragment, null, dateNodes.map(dateNode => dateNode.node)),
  // region common props for all child wheel pickers
  itemHeight,
  visibleItemCount,
  readOnly,
  enableScrollByTapOnItem,
  scrollEventThrottle,
  pickerStyle,
  itemTextStyle,
  overlayItemStyle,
  contentContainerStyle
}) => {
  return /*#__PURE__*/React.createElement(DatePickerLocaleProvider, {
    locale: locale
  }, /*#__PURE__*/React.createElement(DatePickerValueProvider, {
    date: date,
    onDateChanged: onDateChanged,
    minDate: minDate,
    maxDate: maxDate
  }, /*#__PURE__*/React.createElement(DatePickerCommonPropsProvider, {
    itemHeight: itemHeight,
    visibleItemCount: visibleItemCount,
    readOnly: readOnly,
    enableScrollByTapOnItem: enableScrollByTapOnItem,
    scrollEventThrottle: scrollEventThrottle,
    pickerStyle: pickerStyle,
    itemTextStyle: itemTextStyle,
    overlayItemStyle: overlayItemStyle,
    contentContainerStyle: contentContainerStyle
  }, /*#__PURE__*/React.createElement(DatePickerContainer, {
    renderDate: renderDate,
    renderMonth: renderMonth,
    renderYear: renderYear
  }, children))));
};
DatePickerComponent.displayName = 'DatePicker';
export const DatePicker = Object.assign(DatePickerComponent, {
  Date: DatePickerDates,
  Month: DatePickerMonth,
  Year: DatePickerYear
});
//# sourceMappingURL=DatePicker.js.map