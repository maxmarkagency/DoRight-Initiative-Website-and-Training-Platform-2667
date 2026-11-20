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

test('a failed save sets status to error and flush rethrows', async () => {
  const save = vi.fn().mockRejectedValue(new Error('offline'));
  const { result } = renderHook(() => useDraftAutosave('home', { save }));
  act(() => result.current.schedule({ v: 1 }));
  await act(async () => {
    await expect(result.current.flush()).rejects.toThrow('offline');
  });
  expect(result.current.status).toBe('error');
});
