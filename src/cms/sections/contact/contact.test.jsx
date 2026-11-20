import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Contact from '../../../pages/Contact';
import contactConfig from '../../pages/contact.config';
import ContactFormIntro from './ContactFormIntro';
import ContactInfoIntro from './ContactInfoIntro';
import { PAGES } from '../../pages';
import { fetchPublished } from '../../pageContentApi';
import supabase from '../../../lib/supabase';

vi.mock('../../pageContentApi', () => ({ fetchPublished: vi.fn(), fetchPageRow: vi.fn() }));
vi.mock('../../../lib/supabase', () => {
  const insert = vi.fn(() => Promise.resolve({ error: null }));
  const from = vi.fn(() => ({
    select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }),
    insert,
  }));
  return { default: { from, functions: { invoke: vi.fn(() => Promise.resolve({})) } } };
});
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

const QUESTIONS = [
  'How can I volunteer with DoRight?',
  'How can I become an official DoRight Advocate?',
  'How do I report corruption or misconduct?',
  'Can my organization partner with DoRight?',
];

const renderPage = async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  fetchPublished.mockRejectedValueOnce(new Error('offline'));
  render(
    <MemoryRouter>
      <Contact />
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
};

test('registered as contact at /contact', () => {
  expect(PAGES.contact).toMatchObject({ title: 'Contact', path: '/contact' });
});

test('fallback identity: h1 and section headings match today', async () => {
  await renderPage();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Get in Touch$/);
  ['Contact Information', 'Send Us a Message', 'Department Contacts', 'Find Us', 'Frequently Asked Questions'].forEach((name) => {
    expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
  });
  expect(screen.getByRole('heading', { level: 3, name: 'General Inquiries' })).toBeInTheDocument();
  screen.getAllByRole('link', { name: /info@doright.ng/ }).forEach((a) => expect(a).toHaveAttribute('href', 'mailto:info@doright.ng'));
  expect(screen.getByText('+234 912 339 9968')).toBeInTheDocument();
});

test('FAQ renders every current question', async () => {
  await renderPage();
  QUESTIONS.forEach((q) => expect(screen.getByRole('heading', { level: 3, name: q })).toBeInTheDocument());
});

test('without a provider the form placeholder shows and no form exists', () => {
  const { container } = render(<ContactFormIntro formHeading="Send Us a Message" departments={[]} />);
  expect(screen.getByText('Contact form appears here')).toBeInTheDocument();
  expect(container.querySelector('form')).toBeNull();
});

test('info section falls back to defaults without settings', () => {
  render(<ContactInfoIntro heading="Contact Information" />);
  expect(screen.getByText('+234 912 339 9968')).toBeInTheDocument();
});

test('hero has no hidden toggle', () => {
  expect(contactConfig.components.ContactHero.fields.hidden).toBeUndefined();
});

test('the real form still submits through the lead insert path', async () => {
  await renderPage();
  fireEvent.change(screen.getByLabelText(/Full Name/), { target: { name: 'name', value: 'Ada Obi' } });
  fireEvent.change(screen.getByLabelText(/Email Address/), { target: { name: 'email', value: 'Ada@Example.com' } });
  fireEvent.change(screen.getByLabelText(/Subject/), { target: { name: 'subject', value: 'Partnership' } });
  fireEvent.change(screen.getByLabelText(/^Message/), { target: { name: 'message', value: 'Hello there, lets talk.' } });
  fireEvent.click(screen.getByRole('button', { name: /Send Message/ }));
  await screen.findByText('Message Sent Successfully!');
  const insert = supabase.from('leads').insert;
  expect(insert).toHaveBeenCalledWith(expect.objectContaining({ full_name: 'Ada Obi', email: 'ada@example.com', source: 'contact_page', status: 'new' }));
  expect(supabase.functions.invoke).toHaveBeenCalledWith('send-lead-welcome-email', expect.anything());
});

import ContactMap from './ContactMap';

const DEFAULT_EMBED = contactConfig.components.ContactMap.defaultProps.embedUrl;

test('javascript: embed url falls back to the default embed', () => {
  const { container } = render(
    <MemoryRouter><ContactMap embedUrl="javascript:alert(1)" /></MemoryRouter>
  );
  expect(container.querySelector('iframe')).toHaveAttribute('src', DEFAULT_EMBED);
});

test('embed on another host or http falls back to the default embed', () => {
  const { container, rerender } = render(
    <MemoryRouter><ContactMap embedUrl="https://evil.example/x" /></MemoryRouter>
  );
  expect(container.querySelector('iframe')).toHaveAttribute('src', DEFAULT_EMBED);
  rerender(<MemoryRouter><ContactMap embedUrl="http://www.google.com/maps/embed?pb=1" /></MemoryRouter>);
  expect(container.querySelector('iframe')).toHaveAttribute('src', DEFAULT_EMBED);
});

test('an https www.google.com embed url is used', () => {
  const url = 'https://www.google.com/maps/embed?pb=abc';
  const { container } = render(<MemoryRouter><ContactMap embedUrl={url} /></MemoryRouter>);
  expect(container.querySelector('iframe')).toHaveAttribute('src', url);
});

test('javascript: directions url renders no link', () => {
  render(<MemoryRouter><ContactMap directionsUrl="javascript:alert(1)" /></MemoryRouter>);
  expect(screen.getByText('Open in Google Maps / Get Directions')).toBeInTheDocument();
  expect(screen.queryByRole('link')).toBeNull();
});

test('department with a bad email renders no mailto link', () => {
  const { container } = render(
    <ContactFormIntro departments={[{ name: 'Bad', email: 'x"onmouseover=y', description: 'd' }, { name: 'Good', email: 'ok@doright.ng', description: 'd' }]} />
  );
  expect(container.querySelector('a[href="mailto:x\\"onmouseover=y"]')).toBeNull();
  expect(screen.getByText('x"onmouseover=y')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /ok@doright.ng/ })).toHaveAttribute('href', 'mailto:ok@doright.ng');
  expect(screen.getAllByRole('link').filter((a) => a.getAttribute('href').startsWith('mailto:'))).toHaveLength(1);
});

test('an email carrying mailto query params renders no mailto link', () => {
  render(<ContactFormIntro departments={[{ name: 'Q', email: 'a@b.com?bcc=evil', description: 'd' }]} />);
  expect(screen.queryByRole('link', { name: /a@b.com/ })).toBeNull();
});
