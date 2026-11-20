import { buildDefaultData, resolvePageData, isSameData } from './pageData';

const cfg = {
  order: ['A', 'B'],
  root: { defaultProps: { title: 'T' } },
  components: {
    A: { defaultProps: { title: 'Def A', items: [1, 2] } },
    B: { defaultProps: { text: 'Def B' } },
  },
};

const types = (data) => data.content.map((c) => c.type);
const props = (data, type) => data.content.find((c) => c.type === type).props;

test('buildDefaultData builds every section in order with defaults', () => {
  const data = buildDefaultData(cfg);
  expect(types(data)).toEqual(['A', 'B']);
  expect(data.content[0].props.title).toBe('Def A');
  expect(data.root.props.title).toBe('T');
});

test('resolvePageData with nothing stored equals the defaults', () => {
  expect(resolvePageData(null, cfg)).toEqual(buildDefaultData(cfg));
});

test('stored props override defaults and missing sections use defaults', () => {
  const data = resolvePageData({ content: [{ type: 'A', props: { title: 'Mine' } }] }, cfg);
  expect(props(data, 'A').title).toBe('Mine');
  expect(props(data, 'A').items).toEqual([1, 2]);
  expect(props(data, 'B').text).toBe('Def B');
});

test('an empty stored list falls back to the default list', () => {
  const data = resolvePageData({ content: [{ type: 'A', props: { items: [] } }] }, cfg);
  expect(props(data, 'A').items).toEqual([1, 2]);
});

test('unknown stored section types are dropped', () => {
  const data = resolvePageData({ content: [{ type: 'Z', props: {} }] }, cfg);
  expect(types(data)).toEqual(['A', 'B']);
});

test('output follows config order, not stored order', () => {
  const stored = { content: [{ type: 'B', props: {} }, { type: 'A', props: {} }] };
  expect(types(resolvePageData(stored, cfg))).toEqual(['A', 'B']);
});

test('stored root props override root defaults', () => {
  expect(resolvePageData({ root: { props: { title: 'X' } } }, cfg).root.props.title).toBe('X');
});

test('isSameData compares by value', () => {
  expect(isSameData(buildDefaultData(cfg), buildDefaultData(cfg))).toBe(true);
  expect(isSameData(buildDefaultData(cfg), null)).toBe(false);
});
