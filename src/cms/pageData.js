// Page content is a Puck Data document: { root: { props }, content: [{ type, props }] }.
// Layout is fixed by the page config, so stored content only ever fills in props.

const isBlank = (value, fallback) =>
  value === undefined ||
  value === null ||
  (Array.isArray(value) && value.length === 0 && Array.isArray(fallback) && fallback.length > 0);

const mergeProps = (defaults = {}, stored = {}) => {
  const merged = { ...defaults };
  Object.entries(stored).forEach(([key, value]) => {
    if (!isBlank(value, defaults[key])) merged[key] = value;
  });
  return merged;
};

export const buildDefaultData = (config) => resolvePageData(null, config);

export const resolvePageData = (stored, config) => ({
  root: { props: mergeProps(config.root?.defaultProps, stored?.root?.props) },
  content: config.order.map((type) => {
    const storedItem = stored?.content?.find((item) => item.type === type);
    return {
      type,
      props: { id: type, ...mergeProps(config.components[type].defaultProps, storedItem?.props) },
    };
  }),
});

export const isSameData = (a, b) => JSON.stringify(a) === JSON.stringify(b);
