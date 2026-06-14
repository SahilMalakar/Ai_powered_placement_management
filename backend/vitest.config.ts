import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        testTimeout: 20000,
        hookTimeout: 20000,
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/integration/**/*.test.ts'],
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true,
            },
        },
        sequence: {
            concurrent: false,
        },
    },
});
