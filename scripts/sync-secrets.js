const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ENV_FILES = [
  path.join(__dirname, '../apps/1protip.com/.env'),
  path.join(__dirname, '../functions/.env')
];

const TARGET_KEYS = [
  'EXPO_PUBLIC_LINKEDIN_CLIENT_ID',
  'EXPO_SECRET_LINKEDIN_CLIENT_SECRET',
  'EXPO_PUBLIC_LINKEDIN_REDIRECT_URI'
];

const KEY_ALIASES = {
  EXPO_PUBLIC_CLIENT_ID: 'EXPO_PUBLIC_LINKEDIN_CLIENT_ID',
  EXPO_SECRET_CLIENT_SECRET: 'EXPO_SECRET_LINKEDIN_CLIENT_SECRET',
};

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
      if (key && !key.startsWith('#')) {
        env[key] = value;
      }
    }
  });
  return env;
}

function syncSecrets() {
  console.log('Syncing secrets...');
  
  // Check for gh and firebase-tools
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch (e) {
    console.error('Error: GitHub CLI (gh) is not installed or not in PATH.');
    process.exit(1);
  }

  // Aggregate secrets
  const secrets = {};
  ENV_FILES.forEach(file => {
    console.log(`Reading ${file}...`);
    const env = parseEnv(file);
    Object.keys(env).forEach(key => {
      const canonicalKey = KEY_ALIASES[key] || key;
      if (TARGET_KEYS.includes(canonicalKey)) {
        secrets[canonicalKey] = env[key];
      }
    });
  });

  if (Object.keys(secrets).length === 0) {
    console.log('No matching secrets found to sync.');
    return;
  }

  // Sync to GitHub
  console.log('\nSyncing to GitHub Secrets...');
  Object.entries(secrets).forEach(([key, value]) => {
    try {
      console.log(`Setting ${key}...`);
      execSync(`gh secret set ${key}`, { input: value, stdio: ['pipe', 'inherit', 'inherit'] });
    } catch (e) {
      console.error(`Failed to set ${key} in GitHub.`);
    }
  });

  // Sync to Firebase
  console.log('\nSyncing to Firebase Functions Secrets...');
  Object.entries(secrets).forEach(([key, value]) => {
    try {
      console.log(`Setting ${key}...`);
      // Firebase prompts for input, piping works
      execSync(`firebase functions:secrets:set ${key}`, { input: value, stdio: ['pipe', 'inherit', 'inherit'] });
    } catch (e) {
      console.error(`Failed to set ${key} in Firebase.`);
    }
  });

  console.log('\nSync complete.');
}

syncSecrets();

