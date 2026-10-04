import { useEffect, useRef } from 'react';
import { Keyboard, ScrollView } from 'react-native';

export function useScrollToEndOnKeyboard() {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      timeout = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    });
    return () => {
      clearTimeout(timeout);
      sub.remove();
    };
  }, []);

  return scrollRef;
}
