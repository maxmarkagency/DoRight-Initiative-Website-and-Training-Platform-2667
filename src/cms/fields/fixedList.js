// "Fixed lists" are lists whose items are defined in code (ids, links, colours that forms rely on).
// Editors may change only the `editable` fields; items can't be added, removed or reordered.

const isBlank = (value) => value === undefined || value === null || value === '';

export const mergeByKey = (codeItems, storedItems, key, editable) => {
  const stored = Array.isArray(storedItems) ? storedItems : [];
  return codeItems.map((item) => {
    const match = stored.find((s) => s && s[key] === item[key]);
    if (!match) return item;
    const merged = { ...item };
    editable.forEach((field) => {
      if (!isBlank(match[field])) merged[field] = match[field];
    });
    return merged;
  });
};

export const fixedListField = ({ label, count, key, itemLabel, arrayFields }) => ({
  type: 'array',
  label,
  min: count,
  max: count,
  getItemSummary: (item) => item[itemLabel] || item[key],
  arrayFields,
});
