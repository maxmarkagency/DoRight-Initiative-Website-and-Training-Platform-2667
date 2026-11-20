import React from 'react';

// Public-side renderer for Puck data; keeps @puckeditor/core out of public bundles.
const PageRenderer = ({ data, config }) =>
  data.content.map(({ type, props }) => {
    const Section = config.components[type]?.render;
    if (!Section || props.hidden === true) return null;
    return <Section key={props.id || type} {...props} />;
  });

export default PageRenderer;
