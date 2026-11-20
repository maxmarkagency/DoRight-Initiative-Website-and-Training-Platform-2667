import React from 'react';
import { renderHook, render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import usePageContent from './usePageContent';
import PageRenderer from './PageRenderer';
import homeConfig from './pages/home.config';
import { buildDefaultData } from './pageData';
import { fetchPublished } from './pageContentApi';

vi.mock('./pageContentApi', () => ({ fetchPublished: vi.fn(), fetchPageRow: vi.fn() }));

beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

test('keeps defaults when loading published content fails', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  fetchPublished.mockRejectedValueOnce(new Error('network down'));
  const { result } = renderHook(() => usePageContent('home'));
  expect(result.current.data).toEqual(buildDefaultData(homeConfig));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual(buildDefaultData(homeConfig));
});

test('uses published content once loaded', async () => {
  fetchPublished.mockResolvedValueOnce({ content: [{ type: 'HomeCallToAction', props: { heading: 'New' } }] });
  const { result } = renderHook(() => usePageContent('home'));
  await waitFor(() => expect(result.current.data.content[3].props.heading).toBe('New'));
});

test('not ready until content loads, so old defaults never flash (I-4)', async () => {
  fetchPublished.mockResolvedValueOnce(null);
  const { result } = renderHook(() => usePageContent('home'));
  expect(result.current.ready).toBe(false);
  await waitFor(() => expect(result.current.ready).toBe(true));
});

test('becomes ready with defaults if loading takes too long (I-4)', async () => {
  vi.useFakeTimers();
  fetchPublished.mockReturnValueOnce(new Promise(() => {}));
  const { result } = renderHook(() => usePageContent('home'));
  expect(result.current.ready).toBe(false);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1500);
  });
  expect(result.current.ready).toBe(true);
  expect(result.current.data).toEqual(buildDefaultData(homeConfig));
  vi.useRealTimers();
});

test('PageRenderer skips hidden sections', () => {
  const data = buildDefaultData(homeConfig);
  data.content[1] = { ...data.content[1], props: { ...data.content[1].props, hidden: true } };
  render(
    <MemoryRouter>
      <PageRenderer data={data} config={homeConfig} />
    </MemoryRouter>
  );
  expect(screen.queryByRole('heading', { name: 'Who We Are' })).toBeNull();
  expect(screen.getByRole('heading', { name: 'Take Action Today' })).toBeInTheDocument();
});
