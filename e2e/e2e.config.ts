import type { E2EConfig } from 'e2e';
import { github } from '@e2e-dev/github';
import { targets, workers } from './targets.ts';

export default {
  targets,
  workers,
  timeout: 180_000,
  assertionTimeout: 10_000,
  // github() only acts on GitHub Actions: job summary plus one PR comment.
  // Every ios.yml variant runs as job `ios-build`, so the key keeps their
  // comments apart.
  reporters: ['list', github({ key: process.env.E2E_REPORT_KEY })],
} satisfies E2EConfig;
