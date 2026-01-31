export const getPageIndex = (offset, {
  maxIndex,
  pageLength
}) => {
  let index = Math.floor((offset + pageLength / 2) / pageLength);
  index = Math.max(0, index);
  index = Math.min(index, maxIndex);
  return index;
};
//# sourceMappingURL=getPageIndex.js.map