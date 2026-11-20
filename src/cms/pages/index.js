import homeConfig from './home.config';
import aboutConfig from './about.config';
import programsConfig from './programs.config';

export const PAGES = {
  home: { title: 'Home', path: '/', config: homeConfig },
  about: { title: 'About', path: '/about', config: aboutConfig },
  programs: { title: 'Programs', path: '/programs', config: programsConfig },
};
