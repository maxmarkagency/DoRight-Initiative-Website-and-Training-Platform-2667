import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiChevronUp, FiChevronDown } = FiIcons;

// Longer, prose-like fields get a textarea instead of a single-line input.
const isLongTextField = (key) => /description|body|bio|summary/i.test(key);
// Array-of-strings fields (e.g. `features`) get a simple one-per-line list editor.
const isStringListField = (value) => Array.isArray(value) && value.every((v) => typeof v === 'string');

const humanizeLabel = (key) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const emptyValueLike = (value) => {
  if (isStringListField(value)) return [];
  if (typeof value === 'number') return '';
  return '';
};

/**
 * Generic editor for an array of similarly-shaped objects (the `content_data`
 * arrays powering stats/timeline/values/program cards on the public site).
 * Infers its fields from the first item's keys rather than requiring a fixed
 * schema per section, since those arrays are all shaped differently.
 */
const RepeatableListEditor = ({ items, onChange, itemLabel = 'Item' }) => {
  const fieldKeys = items[0] ? Object.keys(items[0]) : [];

  const updateItem = (index, key, value) => {
    const next = items.map((item, i) => (i === index ? { ...item, [key]: value } : item));
    onChange(next);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const moveItem = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const addItem = () => {
    const template = fieldKeys.length > 0
      ? Object.fromEntries(fieldKeys.map((key) => [key, emptyValueLike(items[0][key])]))
      : { label: '', value: '' };
    onChange([...items, template]);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-neutral-700">{itemLabel} {index + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                className="p-1.5 text-neutral-500 hover:bg-neutral-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label={`Move ${itemLabel} ${index + 1} up`}
              >
                <SafeIcon icon={FiChevronUp} className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                className="p-1.5 text-neutral-500 hover:bg-neutral-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label={`Move ${itemLabel} ${index + 1} down`}
              >
                <SafeIcon icon={FiChevronDown} className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-1.5 text-red-500 hover:bg-red-100 rounded"
                aria-label={`Remove ${itemLabel} ${index + 1}`}
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(item).map(([key, value]) => {
              if (isStringListField(value)) {
                return (
                  <div key={key} className="sm:col-span-2">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      {humanizeLabel(key)} <span className="font-normal text-neutral-400">(one per line)</span>
                    </label>
                    <textarea
                      value={value.join('\n')}
                      onChange={(e) => updateItem(index, key, e.target.value.split('\n').filter((line) => line.trim()))}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                );
              }

              if (isLongTextField(key)) {
                return (
                  <div key={key} className="sm:col-span-2">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">{humanizeLabel(key)}</label>
                    <textarea
                      value={value ?? ''}
                      onChange={(e) => updateItem(index, key, e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                );
              }

              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">{humanizeLabel(key)}</label>
                  <input
                    type="text"
                    value={value ?? ''}
                    onChange={(e) => updateItem(index, key, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 text-sm font-medium text-yellow-600 hover:text-yellow-700"
      >
        <SafeIcon icon={FiPlus} className="w-4 h-4" />
        Add {itemLabel.toLowerCase()}
      </button>
    </div>
  );
};

export default RepeatableListEditor;
