import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import homeConfig from '../../pages/home.config';

const renderSection = (type, overrides = {}) => {
  const { render: Section, defaultProps } = homeConfig.components[type];
  return render(
    <MemoryRouter>
      <Section {...defaultProps} {...overrides} />
    </MemoryRouter>
  );
};

beforeAll(() => {
  // framer-motion's whileInView needs IntersectionObserver, which jsdom lacks.
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

test('HomeHero renders the current first slide and Join button', () => {
  renderSection('HomeHero');
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Building a Nigeria That Does Right');
  expect(screen.getByRole('link', { name: /Join The Movement/ })).toHaveAttribute('href', '/join');
});

test('HomeHero slide without an image renders no img and no slide controls', () => {
  const { container } = renderSection('HomeHero', {
    slides: [{ image: { url: '', alt: '' }, badge: '', headline: 'X', headlineAccent: '', subtext: '' }],
  });
  expect(container.querySelector('img')).toBeNull();
  expect(screen.queryByLabelText('Next slide')).toBeNull();
});

test('HomePrograms renders the four current program cards', () => {
  renderSection('HomePrograms');
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
  expect(screen.getByRole('heading', { name: 'Policy Advocacy' })).toBeInTheDocument();
});

test('external button links open in a new tab', () => {
  renderSection('HomeCallToAction', { secondaryButton: { label: 'Partner', href: 'https://example.org' } });
  expect(screen.getByRole('link', { name: 'Partner' })).toHaveAttribute('target', '_blank');
});

test('HomeWhoWeAre renders heading and both paragraphs', () => {
  renderSection('HomeWhoWeAre');
  expect(screen.getByRole('heading', { name: 'Who We Are' })).toBeInTheDocument();
  expect(screen.getByText(/grassroots mobilization/)).toBeInTheDocument();
});
