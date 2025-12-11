require('ts-node/register');

const { test } = require('node:test');
const assert = require('node:assert');
const { LinkedInAuth } = require('../../lib/linkedin');

test('LinkedIn auth URL includes w_member_social scope', () => {
  process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID = 'client_id';
  process.env.EXPO_PUBLIC_LINKEDIN_REDIRECT_URI = 'https://example.com/callback';

  const url = LinkedInAuth['buildAuthUrl']('statetest');
  const scope = new URL(url).searchParams.get('scope');

  assert.ok(scope?.includes('w_member_social'), 'Scope must include w_member_social');
});

