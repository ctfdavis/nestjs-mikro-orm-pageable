import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { TestEntity } from './test.entity';
import { EntityRepository } from '@mikro-orm/sqlite';
import { Pageable, PageableResponse, PageFactory } from '../../src';
import { TestDto } from './test.dto';

@Injectable()
export class AppService {
    constructor(@InjectRepository(TestEntity) private readonly testRepository: EntityRepository<TestEntity>) {}

    async listTests(pageable: Pageable): Promise<PageableResponse<TestDto>> {
        return await new PageFactory(pageable, this.testRepository)
            .map((test) => ({
                ...test,
                createdAt: new Date(test.createdAt),
                updatedAt: new Date(test.updatedAt)
            }))
            .create();
    }
}
