// Migration to shared ESLint configuration
// Use this temporarily until we can fully migrate to ESM

// const { config } = require('@owox/eslint-config/nestjs');

// module.exports = config;

import { config } from '@owox/eslint-config/nestjs';

export default config;
