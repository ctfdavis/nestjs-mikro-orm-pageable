import { defineConfig } from '@mikro-orm/sqlite';

export default defineConfig({
    dbName: 'e2e/src/db/test.sqlite3',
    entities: ['e2e/src/**/*.entity.ts'],
    seeder: {
        path: 'e2e/src/db/seeders'
    }
});
