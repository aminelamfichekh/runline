import { createNanoEvents } from '../utils/nanoevents';
let nextSubId = 1;
const getNewSubId = () => `${++nextSubId}`;
export const createControl = () => {
  const controlEmitter = createNanoEvents();
  const subscribers = {};
  const getEveryIsStopped = () => {
    return Object.values(subscribers).every(s => s.isStopped);
  };
  const notifyChangedExtraValues = notifierPickerId => {
    Object.keys(subscribers).forEach(pickerId => {
      if (pickerId === notifierPickerId) {
        return;
      }
      const sub = subscribers[pickerId];
      sub.emitter.emit('onNewExtraValues');
    });
  };
  return {
    _on: (event, callback) => {
      return controlEmitter.on(event, callback);
    },
    _connect: ({
      pickerName,
      item
    }) => {
      if (__DEV__) {
        const isExisted = Object.values(subscribers).some(s => s.pickerName === pickerName);
        if (isExisted) {
          throw new Error(`It is not possible to register 2 pickers with the same name "${pickerName}"`);
        }
      }
      const subEmitter = createNanoEvents();
      const subId = getNewSubId();
      subscribers[subId] = {
        pickerName,
        item,
        isStopped: true,
        emitter: subEmitter
      };
      const getEventPickers = () => {
        const result = {};
        Object.entries(subscribers).forEach(([_, data]) => {
          result[data.pickerName] = {
            item: data.item
          };
        });
        return result;
      };
      const disconnect = () => {
        delete subscribers[subId];
        notifyChangedExtraValues(subId);
      };
      subEmitter.on('onNewPropValue', event => {
        if (!subscribers[subId]) {
          return;
        }
        subscribers[subId].item = event.item;
        notifyChangedExtraValues(subId);
      });
      subEmitter.on('onValueChanged', event => {
        if (!subscribers[subId]) {
          return;
        }
        subscribers[subId].item = event.item;
        const isAllStopped = getEveryIsStopped();
        if (isAllStopped) {
          Object.keys(subscribers).forEach(pickerId => {
            const sub = subscribers[pickerId];
            sub.emitter.emit('onAllScrollEnd');
          });
          controlEmitter.emit('onValueChanged', {
            pickers: getEventPickers()
          });
        }
      });
      subEmitter.on('onValueChanging', event => {
        if (!subscribers[subId]) {
          return;
        }
        subscribers[subId].item = event.item;
        controlEmitter.emit('onValueChanging', {
          pickers: getEventPickers()
        });
      });
      subEmitter.on('onScrollStart', () => {
        if (!subscribers[subId]) {
          return;
        }
        subscribers[subId].isStopped = false;
      });
      subEmitter.on('onScrollEnd', () => {
        if (!subscribers[subId]) {
          return;
        }
        subscribers[subId].isStopped = true;
      });
      return {
        getExtraValues: () => {
          return Object.keys(subscribers).filter(id => id !== subId).map(id => subscribers[id].item.value);
        },
        getEveryIsStopped,
        emitOnNewPropValue: (...args) => {
          subEmitter.emit('onNewPropValue', ...args);
        },
        emitOnValueChanged: (...args) => {
          subEmitter.emit('onValueChanged', ...args);
        },
        emitOnValueChanging: (...args) => {
          subEmitter.emit('onValueChanging', ...args);
        },
        emitOnScrollStart: () => {
          subEmitter.emit('onScrollStart');
        },
        emitOnScrollEnd: () => {
          subEmitter.emit('onScrollEnd');
        },
        onNewExtraValues: callback => {
          return subEmitter.on('onNewExtraValues', callback);
        },
        onAllScrollEnd: callback => {
          return subEmitter.on('onAllScrollEnd', callback);
        },
        disconnect
      };
    }
  };
};
//# sourceMappingURL=create-control.js.map