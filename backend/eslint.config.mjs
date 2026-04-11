import eslint from '@eslint/js'; // Basic ESLint rules from the core library
import tseslint from 'typescript-eslint'; // TypeScript support for ESLint
import prettierConfig from 'eslint-config-prettier'; // Disables ESLint rules that might conflict with Prettier
import prettierPlugin from 'eslint-plugin-prettier'; // Runs Prettier as an ESLint rule

export default tseslint.config(
    eslint.configs.recommended, // Use recommended rules from ESLint
    ...tseslint.configs.recommended, // Use recommended rules for TypeScript (checks types and logic)
    {
        plugins: {
            prettier: prettierPlugin, // Enable the Prettier plugin to catch formatting as lint errors
        },
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json', // Tells ESLint where your TypeScript configuration is
                tsconfigRootDir: import.meta.dirname, // Helps resolve paths relative to this file
            },
        },
        rules: {
            'prettier/prettier': 'error', // Report Prettier formatting issues as 'error'
            'no-unused-vars': 'off', // Turn off standard unused-var check (TypeScript version is better)
            '@typescript-eslint/no-unused-vars': [
                'warn', // Warn about variables that are defined but never used
                { argsIgnorePattern: '^_' }, // Allow unused arguments if they start with an underscore (e.g., _req)
            ],
            '@typescript-eslint/no-explicit-any': 'warn', // Warn when you use 'any' type (prevents losing type safety)
        },
    },
    prettierConfig, // Important: This must be last to disable rules that conflict with Prettier
    {
        files: ['*.mjs'], // Special handling for root-level config files
        languageOptions: {
            parserOptions: {
                project: null, // Disable project-based parsing for these files
            },
        },
    },
    {
        ignores: ['dist/', 'node_modules/', 'scripts/', 'pnpm-lock.yaml'], // Files and folders to skip
    }
);
