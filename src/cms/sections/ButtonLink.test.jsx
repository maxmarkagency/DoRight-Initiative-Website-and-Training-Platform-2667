import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ButtonLink from './ButtonLink';

const renderLink = (href) =>
  render(
    <MemoryRouter>
      <ButtonLink href={href}>Go</ButtonLink>
    </MemoryRouter>
  );

test('javascript: links are not rendered as links', () => {
  renderLink('javascript:alert(1)');
  expect(screen.queryByRole('link')).toBeNull();
  expect(screen.getByText('Go')).toBeInTheDocument();
});

test('protocol-relative //evil.com is treated as external, not internal', () => {
  renderLink('//evil.com');
  expect(screen.queryByRole('link')).toBeNull();
});

test('https and mailto links render as external links', () => {
  renderLink('mailto:info@doright.ng');
  expect(screen.getByRole('link')).toHaveAttribute('href', 'mailto:info@doright.ng');
});

test.each([String.raw`/\evil.com`, '/\t/evil.com', String.raw`/\/evil.com`])(
  'backslash and whitespace tricks (%j) are not treated as internal links',
  (href) => {
    renderLink(href);
    expect(screen.queryByRole('link')).toBeNull();
  }
);
