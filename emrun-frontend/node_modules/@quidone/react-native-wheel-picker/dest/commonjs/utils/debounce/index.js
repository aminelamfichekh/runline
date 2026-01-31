"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const debounce = (func, delay) => {
  let timer;
  const wrapper = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
  wrapper.clear = () => {
    clearTimeout(timer);
  };
  return wrapper;
};
var _default = exports.default = debounce;
//# sourceMappingURL=index.js.map