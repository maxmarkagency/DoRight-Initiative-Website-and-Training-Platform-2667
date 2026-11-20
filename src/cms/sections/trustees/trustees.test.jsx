import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Trustees from '../../../pages/Trustees';
import trusteesConfig from '../../pages/trustees.config';
import TrusteesList from './TrusteesList';
import { PAGES } from '../../pages';
import { fetchPublished } from '../../pageContentApi';

vi.mock('../../pageContentApi', () => ({ fetchPublished: vi.fn(), fetchPageRow: vi.fn() }));

const NAMES = [
  'Pastor Wale Adefarasin', 'Ayodele Alamutu', 'Ekeinde Ohiwerei',
  'Tunde Oduwole', 'Ajibike Badeji', 'Adeniyi Aromolaran',
];

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
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^OUR TRUSTEES$/);
  ['Leadership with Purpose', 'Guided by Excellence'].forEach((name) => {
    expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
  });
  expect(screen.getByRole('link', { name: 'Learn More About DRAI' })).toHaveAttribute('href', '/about');
  expect(screen.getByRole('link', { name: 'Join Our Mission' })).toHaveAttribute('href', '/join');
});

test('every current trustee renders with photo', async () => {
  await renderPage();
  NAMES.forEach((name) => {
    expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    expect(screen.getByAltText(name)).toHaveAttribute('src', expect.stringContaining('quest-media-storage-bucket'));
  });
  expect(screen.getByText('Trustee #06')).toBeInTheDocument();
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
