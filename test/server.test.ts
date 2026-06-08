import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { render } from '../src/server.js';

test('renders simple variable', () => {
  assert.equal(render({ template: 'Hello {{name}}!', view: { name: 'Mukunda' } }), 'Hello Mukunda!');
});

test('html-escapes by default', () => {
  // Mustache also escapes `/` (as `&#x2F;`) for safety inside <script>
  // contexts, so the result encodes both angles and the slash.
  const out = render({ template: '{{msg}}', view: { msg: '<b>hi</b>' } });
  assert.equal(out.includes('<'), false);
  assert.match(out, /&lt;b&gt;hi/);
  assert.match(out, /b&gt;$/);
});

test('triple-brace skips escape', () => {
  assert.equal(
    render({ template: '{{{msg}}}', view: { msg: '<b>hi</b>' } }),
    '<b>hi</b>',
  );
});

test('section iterates array', () => {
  const out = render({
    template: '{{#items}}{{name}},{{/items}}',
    view: { items: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] },
  });
  assert.equal(out, 'a,b,c,');
});

test('inverted section runs on falsy', () => {
  assert.equal(
    render({ template: '{{^items}}empty{{/items}}', view: { items: [] } }),
    'empty',
  );
});

test('partials', () => {
  const out = render({
    template: '{{>greeting}}, world!',
    view: { name: 'Mukunda' },
    partials: { greeting: 'Hello {{name}}' },
  });
  assert.equal(out, 'Hello Mukunda, world!');
});

test('missing variable renders empty', () => {
  assert.equal(render({ template: '[{{missing}}]', view: {} }), '[]');
});

test('rejects non-string template', () => {
  assert.throws(
    () => render({ template: 123 as unknown as string, view: {} }),
    /`template` is required and must be a string/,
  );
});

test('rejects missing view', () => {
  assert.throws(
    () => render({ template: '{{x}}', view: undefined as unknown as Record<string, unknown> }),
    /`view` is required and must be an object/,
  );
});

test('rejects non-object partials', () => {
  assert.throws(
    () =>
      render({
        template: '{{x}}',
        view: { x: 1 },
        partials: 'nope' as unknown as Record<string, string>,
      }),
    /`partials` must be an object when provided/,
  );
});
