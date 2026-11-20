import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SubCommittees, { SUB_COMMITTEES_DATA } from '../../../pages/SubCommittees';
import subCommitteesConfig from '../../pages/subcommittees.config';
import SubCommitteesList from './SubCommitteesList';
import SubCommitteesHero from './SubCommitteesHero';
import { PAGES } from '../../pages';
import { PageActionsContext } from '../../pageActions';
import { fetchPublished } from '../../pageContentApi';

vi.mock('../../pageContentApi', () => ({ fetchPublished: vi.fn(), fetchPageRow: vi.fn() }));
vi.mock('../../../lib/supabase', () => {
  const chain = { select: () => chain, eq: () => chain, maybeSingle: () => Promise.resolve({ data: null }) };
  return { default: { from: vi.fn(() => chain) } };
});

const NAMES = [
  'Secretariat (Admin) Sub-Committee',
  'Finance & Fundraising Sub-Committee',
  'Strategy Sub-Committee',
  'After-School Club & Training Sub-Committee',
  'Media & Technology Sub-Committee',
  'Webinar Sub-Committee',
];

const renderPage = async (stored) => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  if (stored) fetchPublished.mockResolvedValueOnce(stored);
  else fetchPublished.mockRejectedValueOnce(new Error('offline'));
  render(
    <MemoryRouter>
      <SubCommittees />
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
};

const defaultsOf = (type) => subCommitteesConfig.components[type].defaultProps;

test('registered as sub-committees at /sub-committees', () => {
  expect(PAGES['sub-committees']).toMatchObject({ title: 'Sub-Committees', path: '/sub-committees' });
});

test('fallback identity: heading, greeting, six committees in code order, footer', async () => {
  await renderPage();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Sub-Committee Roles and Responsibilities$/);
  expect(screen.getByText('Dear Tier 3 Advocate,')).toBeInTheDocument();
  expect(screen.getByText('six specialized teams').tagName).toBe('STRONG');
  expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(NAMES);
  expect(screen.getAllByText(/^Sub-Committee \d$/).map((e) => e.textContent)).toEqual(
    SUB_COMMITTEES_DATA.map((c) => `Sub-Committee ${c.number}`)
  );
  expect(screen.getByRole('heading', { level: 3, name: /Thank you for selecting a sub-committee/ })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '+234 912 339 9968' })).toHaveAttribute('href', 'tel:+2349123399968');
  expect(screen.getByRole('link', { name: '+234 802 329 8260' })).toHaveAttribute('href', 'tel:+2348023298260');
  expect(screen.getAllByRole('button', { name: /Join This Sub-Committee/ })).toHaveLength(6);
  expect(screen.getByText('Select Strategy & Alliances')).toBeInTheDocument();
});

test('a stored edit of the strategy committee name shows', async () => {
  const committees = defaultsOf('SubCommitteesList').committees.map((c) =>
    c.id === 'strategy' ? { ...c, name: 'Strategy and Alliances Team' } : c
  );
  await renderPage({ content: [{ type: 'SubCommitteesList', props: { committees } }] });
  expect(screen.getByRole('heading', { level: 2, name: 'Strategy and Alliances Team' })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(6);
});

test('the hero cannot be hidden (transparent header) and the list is fixed-length', () => {
  expect(subCommitteesConfig.components.SubCommitteesHero.fields.hidden).toBeUndefined();
  const field = subCommitteesConfig.components.SubCommitteesList.fields.committees;
  expect(field.min).toBe(SUB_COMMITTEES_DATA.length);
  expect(field.max).toBe(SUB_COMMITTEES_DATA.length);
  expect(Object.keys(field.arrayFields)).not.toContain('id');
  expect(Object.keys(field.arrayFields)).not.toContain('whatsappLink');
});

test('clicking Join without a provider does not throw', () => {
  render(<SubCommitteesList {...defaultsOf('SubCommitteesList')} />);
  expect(() => fireEvent.click(screen.getAllByRole('button', { name: /Join This Sub-Committee/ })[0])).not.toThrow();
});

test('with a provider, Join passes the merged committee including whatsappLink', () => {
  const openCommittee = vi.fn();
  const committees = defaultsOf('SubCommitteesList').committees.map((c) =>
    c.id === 'strategy' ? { ...c, name: 'Edited Strategy' } : c
  );
  render(
    <PageActionsContext.Provider value={{ openCommittee }}>
      <SubCommitteesList {...defaultsOf('SubCommitteesList')} committees={committees} />
    </PageActionsContext.Provider>
  );
  fireEvent.click(screen.getAllByRole('button', { name: /Join This Sub-Committee/ })[2]);
  const strategy = SUB_COMMITTEES_DATA.find((c) => c.id === 'strategy');
  expect(openCommittee).toHaveBeenCalledWith(expect.objectContaining({ id: 'strategy', name: 'Edited Strategy', whatsappLink: strategy.whatsappLink }));
  fireEvent.click(screen.getByText('Select Strategy & Alliances'));
  expect(openCommittee).toHaveBeenCalledTimes(2);
});

test('stored content cannot change a committee whatsappLink, id or colour', () => {
  const openCommittee = vi.fn();
  const committees = [{ id: 'strategy', name: 'X', whatsappLink: 'https://evil.example', accentColor: 'red', number: '99' }];
  render(
    <PageActionsContext.Provider value={{ openCommittee }}>
      <SubCommitteesList {...defaultsOf('SubCommitteesList')} committees={committees} />
    </PageActionsContext.Provider>
  );
  fireEvent.click(screen.getAllByRole('button', { name: /Join This Sub-Committee/ })[2]);
  const strategy = SUB_COMMITTEES_DATA.find((c) => c.id === 'strategy');
  const arg = openCommittee.mock.calls[0][0];
  expect(arg.whatsappLink).toBe(strategy.whatsappLink);
  expect(arg.accentColor).toBe(strategy.accentColor);
  expect(arg.number).toBe(strategy.number);
});

test('hero renders plain-paragraph edits', () => {
  render(<SubCommitteesHero {...defaultsOf('SubCommitteesHero')} title="New title" paragraphs={[{ text: 'Only one' }]} />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('New title');
  expect(screen.getByText('Only one')).toBeInTheDocument();
});
