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
export default debounce;
//# sourceMappingURL=index.js.map