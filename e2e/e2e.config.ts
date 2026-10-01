import type { E2EConfig } from 'e2e';
import { github } from '@e2e-dev/github';
import { targets, workers } from './targets.ts';

export default {
  targets,
  workers,
  timeout: 180_000,
  assertionTimeout: 10_000,
  // restoreLtrAfterEach relaunches twice; ~30 s on an Android emulator.
  cleanupTimeout: 60_000,
  // github() only acts on GitHub Actions: job summary plus one PR comment.
  reporters: ['list', github()],
} satisfies E2EConfig;
