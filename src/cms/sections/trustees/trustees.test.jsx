import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Trustees from '../../../pages/Trustees';
import trusteesConfig from '../../pages/trustees.config';
import TrusteesList from './TrusteesList';
import { PAGES } from '../../pages';
import { fetchPublished } from '../../pageContentApi';

vi.mock('../../pageContentApi', () => ({ fetchPublished: vi.fn(), fetchPageRow: vi.fn() }));

const TRUSTEES = [
  ['Pastor Wale Adefarasin', 'General Overseer & National Reformist'],
  ['Ayodele Alamutu', 'Governance & Risk Executive'],
  ['Ekeinde Ohiwerei', 'Technical & Enterprise Leader'],
  ['Tunde Oduwole', 'Financial Director & Corporate Strategist'],
  ['Ajibike Badeji', 'Business, Management and Technology Consultant'],
  ['Adeniyi Nehemiah Aromolaran (MCIoD, FCIPM, FITD, FNIM, HRPL)', 'Executive Director, Enterprise Services Directorate'],
  ['Adesua Adewole', 'General Manager, Country Services, TotalEnergies Nigeria'],
];
const NAMES = TRUSTEES.map(([name]) => name);

const renderPage = async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  fetchPublished.mockRejectedValueOnce(new Error('offline'));
  render(
    <MemoryRouter>
      <Trustees />
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
};

test('registered as trustees at /trustees', () => {
  expect(PAGES.trustees).toMatchObject({ title: 'Trustees', path: '/trustees' });
});

test('fallback identity: h1 and section headings match today', async () => {
  await renderPage();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^OUR BOARD OF TRUSTEES$/);
  expect(screen.getByText('WHO WE ARE')).toBeInTheDocument();
  ['Leadership with Purpose', 'Guided by Excellence'].forEach((name) => {
    expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
  });
  expect(screen.getByRole('link', { name: 'Learn More About DRAI' })).toHaveAttribute('href', '/about');
  expect(screen.getByRole('link', { name: 'Join Our Mission' })).toHaveAttribute('href', '/join');
});

test('every trustee renders with name, title and photo', async () => {
  await renderPage();
  TRUSTEES.forEach(([name, role]) => {
    expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    expect(screen.getByText(role)).toBeInTheDocument();
    expect(screen.getByAltText(name.replace(/ \(.*\)$/, ''))).toHaveAttribute('src');
  });
  expect(screen.getByAltText('Adesua Adewole')).toHaveAttribute('src', '/trustees/adesua-adewole.jpg');
  expect(screen.getByText('Trustee #07')).toBeInTheDocument();
});

test('updated bios are shown', async () => {
  await renderPage();
  expect(screen.getByText(/host of the television broadcast The Heart of the Matter/)).toBeInTheDocument();
  expect(screen.getByText(/spearheading the company's digital transformation/)).toBeInTheDocument();
  expect(screen.getByText(/widely known as "AA - The Transformer"/)).toBeInTheDocument();
  expect(screen.getByText(/ICF-certified coach and mentors managers/)).toBeInTheDocument();
});

test('a trustee with an empty photo renders no img', () => {
  const { container } = render(
    <TrusteesList trustees={[{ name: 'No Photo', description: 'd', fullProfile: 'f', photo: { url: '', alt: '' } }]} />
  );
  expect(screen.getByRole('heading', { level: 2, name: 'No Photo' })).toBeInTheDocument();
  expect(container.querySelector('img')).toBeNull();
});

test('hero has no hidden toggle', () => {
  expect(trusteesConfig.components.TrusteesHero.fields.hidden).toBeUndefined();
});

test('default copy has no comma-without-space or "30years" typos', () => {
  const text = JSON.stringify(trusteesConfig);
  expect(text).not.toMatch(/[a-z)],[A-Za-z]/);
  expect(text).not.toMatch(/\d+years/);
});
