"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPageIndex = void 0;
const getPageIndex = (offset, {
  maxIndex,
  pageLength
}) => {
  let index = Math.floor((offset + pageLength / 2) / pageLength);
  index = Math.max(0, index);
  index = Math.min(index, maxIndex);
  return index;
};
exports.getPageIndex = getPageIndex;
//# sourceMappingURL=getPageIndex.js.map