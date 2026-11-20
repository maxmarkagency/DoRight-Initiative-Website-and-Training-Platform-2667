import homeConfig from './home.config';
import aboutConfig from './about.config';
import programsConfig from './programs.config';
import trusteesConfig from './trustees.config';
import contactConfig from './contact.config';
import subCommitteesConfig from './subcommittees.config';

export const PAGES = {
  home: { title: 'Home', path: '/', config: homeConfig },
  about: { title: 'About', path: '/about', config: aboutConfig },
  programs: { title: 'Programs', path: '/programs', config: programsConfig },
  trustees: { title: 'Trustees', path: '/trustees', config: trusteesConfig },
  contact: { title: 'Contact', path: '/contact', config: contactConfig },
  'sub-committees': { title: 'Sub-Committees', path: '/sub-committees', config: subCommitteesConfig },
};
