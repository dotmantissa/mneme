const required = [
  'DATABASE_URL',
  'DIRECT_URL',
  'OPENAI_API_KEY',
  'ZG_PRIVATE_KEY',
  'ZG_RPC_URL',
  'ZG_INDEXER_URL',
];

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
