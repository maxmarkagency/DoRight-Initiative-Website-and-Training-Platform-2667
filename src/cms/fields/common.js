export const textField = (label) => ({ type: 'text', label });
export const textareaField = (label) => ({ type: 'textarea', label });

export const buttonField = (label) => ({
  type: 'object',
  label,
  objectFields: {
    label: { type: 'text', label: 'Button text' },
    href: { type: 'text', label: 'Link (e.g. /join or https://…)' },
  },
});

export const hiddenField = {
  type: 'radio',
  label: 'Show on site',
  options: [
    { label: 'Show', value: false },
    { label: 'Hide', value: true },
  ],
};
