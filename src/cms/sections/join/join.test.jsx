import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Join from '../../../pages/Join';
import joinConfig from '../../pages/join.config';
import JoinWays from './JoinWays';
import JoinEveryAction from './JoinEveryAction';
import { PAGES } from '../../pages';
import { PageActionsContext } from '../../pageActions';
import { fetchPublished } from '../../pageContentApi';
import { submitLead } from '../../../services/leadsService';

vi.mock('../../pageContentApi', () => ({ fetchPublished: vi.fn(), fetchPageRow: vi.fn() }));
vi.mock('../../../services/leadsService', () => ({
  submitLead: vi.fn(() => Promise.resolve({ membership_id: 'DRAI-1' })),
  checkLeadDuplicate: vi.fn(() => Promise.resolve({ isDuplicate: false })),
}));
vi.mock('../../../lib/supabase', () => {
  const chain = { select: () => chain, in: () => Promise.resolve({ data: [], error: null }) };
  return { default: { from: vi.fn(() => chain) } };
});
vi.mock('../../../components/MemberCard', () => ({ default: () => <div data-testid="member-card" /> }));
vi.mock('../../../components/TurnstileWidget', async () => {
  const React = await import('react');
  return {
    default: React.forwardRef(({ onVerify }, ref) => {
      React.useImperativeHandle(ref, () => ({ reset: () => {} }));
      React.useEffect(() => { onVerify('test-token'); }, []);
      return <div data-testid="turnstile" />;
    }),
  };
});

const renderPage = async (stored) => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  if (stored) fetchPublished.mockResolvedValueOnce(stored);
  else fetchPublished.mockRejectedValueOnce(new Error('offline'));
  render(
    <MemoryRouter>
      <Join />
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
};

const defaultsOf = (type) => joinConfig.components[type].defaultProps;

test('registered as join at /join', () => {
  expect(PAGES.join).toMatchObject({ title: 'Join', path: '/join' });
});

test('fallback identity: h1 and section headings match today', async () => {
  await renderPage();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Join the Movement$/);
  ['Ways to Get Involved', 'Our Growing Impact', 'Every Action Counts'].forEach((name) => {
    expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
  });
  expect(screen.getByRole('heading', { level: 3, name: 'Connect With Our Team' })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(
    expect.arrayContaining(['Volunteer', 'Donate', 'Partner'])
  );
  expect(screen.getByText('info@doright.ng')).toBeInTheDocument();
  expect(screen.getByText('volunteer@doright.ng')).toBeInTheDocument();
  expect(screen.getByText('500+')).toBeInTheDocument();
  expect(screen.getByText('₦50M+')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Sponsor \/ Make a Payment/ })).toHaveAttribute('href', '/pay');
});

test('three ways render with their CTAs and features', async () => {
  await renderPage();
  ['Become a Volunteer', 'Make a Donation', 'Partner With Us'].forEach((name) => {
    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });
  expect(screen.getByText('Community outreach programs')).toBeInTheDocument();
  expect(screen.getByText('Network expansion')).toBeInTheDocument();
});

test('a stored edit of the Donating description shows', async () => {
  const ways = defaultsOf('JoinWays').ways.map((w) =>
    w.interestKey === 'Donating' ? { ...w, description: 'Give generously to the cause.' } : w
  );
  await renderPage({ content: [{ type: 'JoinWays', props: { ways } }] });
  expect(screen.getByText('Give generously to the cause.')).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 3, name: /^(Volunteer|Donate|Partner)$/ })).toHaveLength(3);
});

test('stored content cannot change which interest a way selects', () => {
  const selectWay = vi.fn();
  const tampered = defaultsOf('JoinWays').ways.map((w) =>
    w.interestKey === 'Donating' ? { ...w, interestKey: 'Hacked', ctaText: 'Give' } : w
  );
  render(
    <PageActionsContext.Provider value={{ selectWay }}>
      <JoinWays ways={tampered} />
    </PageActionsContext.Provider>
  );
  // the tampered item matches no code key, so that slot keeps its code values
  fireEvent.click(screen.getByRole('button', { name: 'Make a Donation' }));
  expect(selectWay).toHaveBeenCalledWith('Donating');
  expect(screen.queryByRole('button', { name: 'Give' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Become a Volunteer' }));
  expect(selectWay).not.toHaveBeenCalledWith('Hacked');
});

test('a way CTA without a provider does not throw', () => {
  render(<JoinWays ways={defaultsOf('JoinWays').ways} />);
  expect(() => fireEvent.click(screen.getByRole('button', { name: 'Become a Volunteer' }))).not.toThrow();
});

test('Donate styling follows the code key, not the editable title', () => {
  const ways = defaultsOf('JoinWays').ways.map((w) => (w.interestKey === 'Donating' ? { ...w, title: 'Give' } : w));
  render(<JoinWays ways={ways} />);
  expect(screen.getByRole('heading', { level: 3, name: 'Give' })).toHaveClass('text-neutral-900');
});

test('ways is a fixed list keyed by interestKey with only copy fields editable', () => {
  const field = joinConfig.components.JoinWays.fields.ways;
  expect(field.min).toBe(3);
  expect(field.max).toBe(3);
  expect(Object.keys(field.arrayFields).sort()).toEqual(['ctaText', 'description', 'features', 'title']);
});

test('the hero has no hidden toggle; other sections do', () => {
  expect(joinConfig.components.JoinHero.fields.hidden).toBeUndefined();
  ['JoinWays', 'JoinFormIntro', 'JoinImpactStats', 'JoinEveryAction'].forEach((t) => {
    expect(joinConfig.components[t].fields.hidden).toBeDefined();
  });
});

test('stats can be edited and removed', async () => {
  const stats = [{ number: '9', label: 'Only stat' }];
  await renderPage({ content: [{ type: 'JoinImpactStats', props: { stats } }] });
  expect(screen.getByText('Only stat')).toBeInTheDocument();
  expect(screen.queryByText('Active Volunteers')).toBeNull();
});

test('a javascript: link in the Every Action block is not a link', () => {
  render(
    <MemoryRouter>
      <JoinEveryAction secondaryButton={{ label: 'Bad', href: 'javascript:alert(1)' }} />
    </MemoryRouter>
  );
  expect(screen.queryByRole('link', { name: 'Bad' })).toBeNull();
  expect(screen.getByText('Bad')).toBeInTheDocument();
});

test('CTAs open the real signup form with the code interest preselected', async () => {
  await renderPage();
  fireEvent.click(screen.getByRole('button', { name: 'Make a Donation' }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByRole('button', { name: /Donating/ }).className).toMatch(/bg-primary/);
});

test('the real signup form still renders and submits through submitLead', async () => {
  await renderPage();
  fireEvent.click(screen.getByRole('button', { name: 'Apply to Join' }));
  const dialog = await screen.findByRole('dialog');
  global.URL.createObjectURL = vi.fn(() => 'blob:x');
  const spy = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 10000);
  fireEvent.change(dialog.querySelector('#modal-name'), { target: { name: 'name', value: 'Ada Obi' } });
  fireEvent.change(dialog.querySelector('#modal-email'), { target: { name: 'email', value: 'Ada@Example.com' } });
  fireEvent.change(dialog.querySelector('#modal-phone'), { target: { name: 'phone', value: '+234 912 339 9968' } });
  fireEvent.change(dialog.querySelector('#modal-message'), { target: { name: 'message', value: 'I would love to volunteer.' } });
  const file = new File(['x'], 'me.png', { type: 'image/png' });
  fireEvent.change(dialog.querySelector('#modal-photo'), { target: { files: [file] } });
  fireEvent.click(within(dialog).getByRole('button', { name: /Submit Application/ }));
  await waitFor(() => expect(submitLead).toHaveBeenCalled());
  expect(submitLead).toHaveBeenCalledWith(
    expect.objectContaining({ fullName: 'Ada Obi', email: 'ada@example.com', interest: 'Volunteering', turnstileToken: 'test-token' })
  );
  spy.mockRestore();
});
