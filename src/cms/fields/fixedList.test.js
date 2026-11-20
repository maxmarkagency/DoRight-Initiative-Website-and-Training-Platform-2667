import { mergeByKey, fixedListField } from './fixedList';

const code = [
  { id: 'a', name: 'A', link: 'x' },
  { id: 'b', name: 'B', link: 'y' },
];
const merge = (stored) => mergeByKey(code, stored, 'id', ['name']);

test('stored editable fields override the matching code item', () => {
  expect(merge([{ id: 'b', name: 'Bee' }])).toEqual([
    { id: 'a', name: 'A', link: 'x' },
    { id: 'b', name: 'Bee', link: 'y' },
  ]);
});

test('non-editable fields always come from code', () => {
  expect(merge([{ id: 'a', link: 'evil' }])[0].link).toBe('x');
});

test('unknown keys are dropped', () => {
  expect(merge([{ id: 'z', name: 'Z' }])).toEqual(code);
});

test('null or junk stored values fall back to code', () => {
  expect(merge(null)).toEqual(code);
  expect(merge('junk')).toEqual(code);
});

test('empty strings do not override', () => {
  expect(merge([{ id: 'a', name: '' }])[0].name).toBe('A');
});

test('output follows code order', () => {
  expect(merge([{ id: 'b' }, { id: 'a' }]).map((i) => i.id)).toEqual(['a', 'b']);
});

test('fixedListField locks the item count', () => {
  const field = fixedListField({ label: 'L', count: 6, key: 'id', itemLabel: 'name', arrayFields: {} });
  expect(field.min).toBe(6);
  expect(field.max).toBe(6);
  expect(field.getItemSummary({ id: 'q', name: 'Q' })).toBe('Q');
});
