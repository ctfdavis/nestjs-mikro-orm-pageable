import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { makeTestData } from '../../testData';

const testData = makeTestData();

export class DatabaseSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        for (let i = 0; i < 1000; i++) {
            em.create('TestEntity', {
                title: testData[i].title,
                description: testData[i].description,
                createdAt: testData[i].createdAt,
                updatedAt: testData[i].updatedAt
            });
        }
    }
}
