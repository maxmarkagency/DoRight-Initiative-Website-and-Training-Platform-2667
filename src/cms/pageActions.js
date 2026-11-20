import { createContext, useContext } from 'react';

// Form pages provide behaviour (open a modal, render the form) to their CMS sections.
// In the Puck editor there's no provider, so every action is a harmless no-op.
const NOOP_ACTIONS = {
  openCommittee: () => {},
  selectWay: () => {},
  scrollToForm: () => {},
  renderContactForm: null,
  waysVisible: true,
  contactSettings: null,
};

export const PageActionsContext = createContext({});

export const usePageActions = () => ({ ...NOOP_ACTIONS, ...useContext(PageActionsContext) });
