import { renderHook, act } from '@testing-library/react';
import useDraftAutosave from './useDraftAutosave';

vi.mock('../pageContentApi', () => ({ saveDraft: vi.fn() }));

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

test('debounces rapid edits into one save of the latest data', async () => {
  const save = vi.fn().mockResolvedValue();
  const { result } = renderHook(() => useDraftAutosave('home', { save }));
  act(() => {
    result.current.schedule({ v: 1 });
    result.current.schedule({ v: 2 });
  });
  expect(result.current.status).toBe('unsaved');
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1500);
  });
  expect(save).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledWith('home', { v: 2 });
  expect(result.current.status).toBe('saved');
});

test('flush saves pending data immediately and cancels the timer', async () => {
  const save = vi.fn().mockResolvedValue();
  const { result } = renderHook(() => useDraftAutosave('home', { save }));
  act(() => result.current.schedule({ v: 1 }));
  await act(async () => {
    await result.current.flush();
  });
  expect(save).toHaveBeenCalledWith('home', { v: 1 });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
  expect(save).toHaveBeenCalledTimes(1);
});

test('flush with nothing pending does not save', async () => {
  const save = vi.fn().mockResolvedValue();
  const { result } = renderHook(() => useDraftAutosave('home', { save }));
  await act(async () => {
    await result.current.flush();
  });
  expect(save).not.toHaveBeenCalled();
});

test('flush waits for a save that is already running (I-1)', async () => {
  let finishFirst;
  const save = vi.fn().mockImplementationOnce(() => new Promise((r) => { finishFirst = r; })).mockResolvedValue();
  const { result } = renderHook(() => useDraftAutosave('home', { save }));
  act(() => result.current.schedule({ v: 1 }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1500); // first save now in flight
  });
  let flushed = false;
  const flushing = result.current.flush().then(() => { flushed = true; });
  await act(async () => {
    await Promise.resolve();
  });
  expect(flushed).toBe(false);
  await act(async () => {
    finishFirst();
    await flushing;
  });
  expect(flushed).toBe(true);
});

test('saves run one at a time, latest data last (I-1)', async () => {
  let finishFirst;
  const save = vi.fn().mockImplementationOnce(() => new Promise((r) => { finishFirst = r; })).mockResolvedValue();
  const { result } = renderHook(() => useDraftAutosave('home', { save }));
  act(() => result.current.schedule({ v: 1 }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1500);
  });
  act(() => result.current.schedule({ v: 2 }));
  const flushing = result.current.flush();
  await act(async () => {
    await Promise.resolve();
  });
  expect(save).toHaveBeenCalledTimes(1); // second save waits for the first
  await act(async () => {
    finishFirst();
    await flushing;
  });
  expect(save).toHaveBeenLastCalledWith('home', { v: 2 });
});

test('pending edits are saved when the editor unmounts (I-2)', async () => {
  const save = vi.fn().mockResolvedValue();
  const { result, unmount } = renderHook(() => useDraftAutosave('home', { save }));
  act(() => result.current.schedule({ v: 1 }));
  unmount();
  expect(save).toHaveBeenCalledWith('home', { v: 1 });
});

test('closing the tab with unsaved edits asks for confirmation (I-2)', () => {
  const save = vi.fn().mockResolvedValue();
  const { result } = renderHook(() => useDraftAutosave('home', { save }));
  act(() => result.current.schedule({ v: 1 }));
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
});

test('a failed save is retried automatically (I-2)', async () => {
  const save = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue();
  const { result } = renderHook(() => useDraftAutosave('home', { save }));
  act(() => result.current.schedule({ v: 1 }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1500);
  });
  expect(result.current.status).toBe('error');
  await act(async () => {
    await vi.advanceTimersByTimeAsync(5000);
  });
  expect(save).toHaveBeenCalledTimes(2);
  expect(result.current.status).toBe('saved');
});

test('reset drops queued edits and waits for a running save (I-3)', async () => {
  let finishFirst;
  const save = vi.fn().mockImplementationOnce(() => new Promise((r) => { finishFirst = r; })).mockResolvedValue();
  const { result } = renderHook(() => useDraftAutosave('home', { save }));
  act(() => result.current.schedule({ v: 1 }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1500);
  });
  act(() => result.current.schedule({ v: 2 }));
  const resetting = result.current.reset();
  await act(async () => {
    finishFirst();
    await resetting;
    await vi.advanceTimersByTimeAsync(5000);
  });
  expect(save).toHaveBeenCalledTimes(1);
  expect(result.current.status).toBe('saved');
});

test('a failed save sets status to error and flush rethrows', async () => {
  const save = vi.fn().mockRejectedValue(new Error('offline'));
  const { result } = renderHook(() => useDraftAutosave('home', { save }));
  act(() => result.current.schedule({ v: 1 }));
  await act(async () => {
    await expect(result.current.flush()).rejects.toThrow('offline');
  });
  expect(result.current.status).toBe('error');
});
