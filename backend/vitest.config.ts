import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        testTimeout: 20000,
        hookTimeout: 20000,
        setupFiles: ['./tests/setup.ts'],
        globalSetup: './tests/globalSetup.ts',
        include: ['tests/integration/**/*.test.ts'],
        pool: 'forks',
        maxWorkers: 1,
        isolate: false,
        fileParallelism: false,
        sequence: {
            concurrent: false,
        },
    },
});