import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import About from '../../../pages/About';
import aboutConfig from '../../pages/about.config';
import { PAGES } from '../../pages';
import { fetchPublished } from '../../pageContentApi';
import snapshot from '../../../../docs/superpowers/plans/data/2026-11-21-page-sections-snapshot.json';

vi.mock('../../pageContentApi', () => ({ fetchPublished: vi.fn(), fetchPageRow: vi.fn() }));

const dbSections = snapshot.find((p) => p.slug === 'about').page_sections;
const dbTimeline = dbSections.find((s) => s.section_key === 'timeline').content_data.timeline;

const renderPage = async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  fetchPublished.mockRejectedValueOnce(new Error('offline'));
  render(
    <MemoryRouter>
      <About />
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
};

test('registered as about at /about', () => {
  expect(PAGES.about).toMatchObject({ title: 'About', path: '/about' });
});

test('fallback identity: h1 and every section heading match the live page', async () => {
  await renderPage();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^About DRAI$/);
  [
    'Our Mission', 'Our Vision', 'Our Core Values', 'Our Impact Since 2018', 'Our Journey',
    'Meet Our Team', 'Join Our Mission',
  ].forEach((name) => {
    expect(screen.getAllByRole('heading', { level: 2, name }).length).toBeGreaterThan(0);
  });
  expect(screen.getByRole('link', { name: 'Get Involved' })).toHaveAttribute('href', '/join');
  expect(screen.getByRole('link', { name: 'Explore Programs' })).toHaveAttribute('href', '/programs');
  expect(screen.getByAltText('DRAI team members in matching uniforms')).toHaveAttribute('src', expect.stringContaining('DSC_0360'));
});

test('values section renders 7 cards including Meritocracy', async () => {
  await renderPage();
  const values = ['Integrity', 'Diligence', 'Respect', 'Compassion', 'Justice', 'Courage', 'Meritocracy'];
  values.forEach((v) => expect(screen.getByRole('heading', { level: 3, name: v })).toBeInTheDocument());
});

test('timeline renders the DB snapshot items in order', async () => {
  await renderPage();
  const headings = dbTimeline.map((t) => screen.getByRole('heading', { level: 3, name: t.title }));
  dbTimeline.forEach((t, i) => {
    expect(screen.getByText(t.year)).toBeInTheDocument();
    expect(screen.getByText(t.description)).toBeInTheDocument();
    if (i > 0) expect(headings[i - 1].compareDocumentPosition(headings[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

test('hero shows 3 stats, impact shows all 4', async () => {
  await renderPage();
  expect(screen.getAllByText('Years of Impact')).toHaveLength(2);
  expect(screen.getAllByText('Policy Reforms')).toHaveLength(1);
});

test('the hero cannot be hidden; other sections can', () => {
  expect(aboutConfig.components.AboutHero.fields.hidden).toBeUndefined();
  expect(aboutConfig.components.AboutMissionVision.fields.hidden).toBeDefined();
  expect(aboutConfig.components.AboutCallToAction.fields.hidden).toBeDefined();
});

test('Values has its own top padding so hiding Mission & Vision keeps spacing', async () => {
  const { default: AboutValues } = await import('./AboutValues');
  const { default: AboutMissionVision } = await import('./AboutMissionVision');
  const { container } = render(<AboutValues title="t" subtitle="s" values={[]} />);
  expect(container.querySelector('section').className).toMatch(/\bpt-12\b/);
  expect(container.querySelector('section').className).toMatch(/\blg:pt-20\b/);
  const mv = render(<AboutMissionVision missionTitle="m" missionText="" visionTitle="v" visionText="" />);
  expect(mv.container.querySelector('section').className).toContain('[&:has(+section)>div>div]:mb-0');
});
