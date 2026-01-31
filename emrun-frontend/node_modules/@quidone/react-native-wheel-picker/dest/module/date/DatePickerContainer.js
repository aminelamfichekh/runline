import React, { Fragment } from 'react';
import { View } from 'react-native';
import DatePickerDate from './DatePickerDate';
import DatePickerMonth from './DatePickerMonth';
import DatePickerYear from './DatePickerYear';
import { useDatePickerLocale } from './DatePickerLocaleProvider';
const DatePickerContainer = ({
  renderDate = () => /*#__PURE__*/React.createElement(DatePickerDate, null),
  renderMonth = () => /*#__PURE__*/React.createElement(DatePickerMonth, null),
  renderYear = () => /*#__PURE__*/React.createElement(DatePickerYear, null),
  children
}) => {
  const localeData = useDatePickerLocale();
  const typeToRenderMap = {
    date: renderDate,
    month: renderMonth,
    year: renderYear
  };
  return /*#__PURE__*/React.createElement(View, {
    style: {
      flexDirection: 'row'
    }
  }, children({
    dateNodes: localeData.sortedDateUnitTypes.map(type => ({
      type,
      node: /*#__PURE__*/React.createElement(Fragment, {
        key: type
      }, typeToRenderMap[type]())
    }))
  }));
};
export default DatePickerContainer;
//# sourceMappingURL=DatePickerContainer.js.map