import { renderHook, waitFor } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import { useScrollToEndOnKeyboard } from './useScrollToEndOnKeyboard';

describe('useScrollToEndOnKeyboard', () => {
  const remove = jest.fn();
  let addListenerSpy: jest.SpyInstance;

  const showKeyboard = () => {
    const [, callback] = addListenerSpy.mock.calls[0];
    callback();
  };

  const attachScrollView = (ref: unknown) => {
    const scrollToEnd = jest.fn();
    (ref as { current: unknown }).current = { scrollToEnd };
    return scrollToEnd;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    addListenerSpy = jest.spyOn(Keyboard, 'addListener').mockReturnValue({ remove } as never);
  });

  afterEach(() => {
    addListenerSpy.mockRestore();
  });

  it('scrolls to the end shortly after the keyboard is shown', async () => {
    const { result } = await renderHook(() => useScrollToEndOnKeyboard()); // renderHook is async in v14 — always await it
    const scrollToEnd = attachScrollView(result.current);

    expect(addListenerSpy).toHaveBeenCalledWith('keyboardDidShow', expect.any(Function));

    showKeyboard();
    expect(scrollToEnd).not.toHaveBeenCalled();

    await waitFor(() => expect(scrollToEnd).toHaveBeenCalledWith({ animated: true }));
  });

  it('does not throw when the ScrollView ref is not attached', async () => {
    await renderHook(() => useScrollToEndOnKeyboard());

    expect(() => showKeyboard()).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it('removes the listener and cancels the pending scroll on unmount', async () => {
    const { result, unmount } = await renderHook(() => useScrollToEndOnKeyboard());
    const scrollToEnd = attachScrollView(result.current);

    showKeyboard();
    await unmount();

    expect(remove).toHaveBeenCalledTimes(1);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(scrollToEnd).not.toHaveBeenCalled();
  });
});
