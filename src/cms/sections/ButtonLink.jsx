import React from 'react';
import { Link } from 'react-router-dom';

// Internal paths use the router; anything else opens in a new tab.
const ButtonLink = ({ href = '', className, children }) =>
  href.startsWith('/') ? (
    <Link to={href} className={className}>{children}</Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
  );

export default ButtonLink;
