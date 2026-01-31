"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNanoEvents = void 0;
let createNanoEvents = () => ({
  emit(event, ...args) {
    for (let callbacks = this.events[event] || [], i = 0, length = callbacks.length; i < length; i++) {
      callbacks[i](...args);
    }
  },
  events: {},
  on(event, cb) {
    (this.events[event] ||= []).push(cb);
    return () => {
      var _this$events$event;
      this.events[event] = (_this$events$event = this.events[event]) === null || _this$events$event === void 0 ? void 0 : _this$events$event.filter(i => cb !== i);
    };
  }
});
exports.createNanoEvents = createNanoEvents;
//# sourceMappingURL=nanoevents.js.map