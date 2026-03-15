import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  InputAccessoryView,
  Keyboard,
  Platform,
  StyleSheet,
} from 'react-native';

export const KEYBOARD_DONE_ID = 'keyboard-done-bar';

/**
 * KeyboardDoneBar — iOS-only InputAccessoryView with a "Terminé" button.
 * Renders nothing on Android (Android uses back button to dismiss).
 *
 * Usage: Render once per screen, then set inputAccessoryViewID={KEYBOARD_DONE_ID}
 * on each TextInput.
 */
export function KeyboardDoneBar() {
  if (Platform.OS !== 'ios') return null;

  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE_ID}>
      <View style={styles.bar}>
        <View style={styles.spacer} />
        <TouchableOpacity
          onPress={() => Keyboard.dismiss()}
          hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
          activeOpacity={0.7}
        >
          <Text style={styles.doneText}>Terminé</Text>
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#1c2a3a',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  spacer: {
    flex: 1,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#328ce7',
  },
});
