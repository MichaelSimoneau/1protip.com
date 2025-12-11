const { test } = require('node:test');
const assert = require('node:assert');
const { readFileSync } = require('node:fs');
const path = require('node:path');

test('LinkedIn auth URL includes w_member_social scope', () => {
  const linkedinFile = path.join(__dirname, '..', '..', 'lib', 'linkedin.ts');
  const content = readFileSync(linkedinFile, 'utf8');
  assert.ok(
    content.includes('w_member_social'),
    'Expected LinkedIn auth scope to include w_member_social'
  );
});

