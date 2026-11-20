import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Programs from '../../../pages/Programs';
import programsConfig from '../../pages/programs.config';
import { PAGES } from '../../pages';
import { fetchPublished } from '../../pageContentApi';
import snapshot from '../../../../docs/superpowers/plans/data/2026-11-21-page-sections-snapshot.json';

vi.mock('../../pageContentApi', () => ({ fetchPublished: vi.fn(), fetchPageRow: vi.fn() }));

const dbSections = snapshot.find((p) => p.slug === 'programs').page_sections;
const dbPrograms = dbSections.find((s) => s.section_key === 'programs_list').content_data.programs;
const dbStats = dbSections.find((s) => s.section_key === 'impact_stats').content_data.stats;

const renderPage = async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  fetchPublished.mockRejectedValueOnce(new Error('offline'));
  render(
    <MemoryRouter>
      <Programs />
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
};

test('registered as programs at /programs', () => {
  expect(PAGES.programs).toMatchObject({ title: 'Programs', path: '/programs' });
});

test('fallback identity: h1 and every section heading match the live page', async () => {
  await renderPage();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Our Programs$/);
  ['How We Create Change', 'Real Programs,Real Impact', 'Get Involved in Our Programs'].forEach((name) => {
    expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
  });
  ['In the Classroom', 'In the Community', 'Community Engagement', 'Evidence-Based Advocacy', 'Sustainable Impact'].forEach((name) => {
    expect(screen.getByRole('heading', { level: 3, name })).toBeInTheDocument();
  });
  expect(screen.getByRole('link', { name: 'Volunteer Now' })).toHaveAttribute('href', '/join');
  expect(screen.getByRole('link', { name: 'Partner With Us' })).toHaveAttribute('href', '/join');
});

test('program list renders every DB snapshot program', async () => {
  await renderPage();
  dbPrograms.forEach((p) => {
    expect(screen.getByRole('heading', { level: 2, name: p.title })).toBeInTheDocument();
    expect(screen.getByText(p.description)).toBeInTheDocument();
    p.features.forEach((f) => expect(screen.getByText(f)).toBeInTheDocument());
    expect(screen.getByAltText(p.title)).toHaveAttribute('src', p.image);
  });
});

test('impact stats render the DB snapshot', async () => {
  await renderPage();
  dbStats.forEach((s) => {
    expect(screen.getByText(s.number)).toBeInTheDocument();
    expect(screen.getByText(s.label)).toBeInTheDocument();
  });
});

test('the hero cannot be hidden; other sections can', () => {
  const c = programsConfig.components;
  expect(c.ProgramsHero.fields.hidden).toBeUndefined();
  ['ProgramsImpactStats', 'ProgramsList', 'ProgramsHowWeWork', 'ProgramsRealImpact', 'ProgramsGetInvolved'].forEach((k) => {
    expect(c[k].fields.hidden).toBeDefined();
  });
});
