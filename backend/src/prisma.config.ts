import { defineConfig } from 'prisma/config';
import { serverConfig } from './configs/index.js';


export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
        seed: 'tsx prisma/seed.ts',
    },
    datasource: {
        url: serverConfig.DATABASE_URL,
    },
});
